"""
Enrichment pipeline for new processors from the BD team's list.

Runs in two phases:
  Phase A (discover): For processors without a website URL, search the web
                      and pick the best candidate.
  Phase B (scrape):   Fetch the homepage HTML and extract logo, about,
                      phone, species keywords, inspection level.

Output goes to data/enrichment/staged.json — NOT processors.json. Henry
reviews before the final merge.

Usage:
  python3 scripts/enrich_processors.py --pilot       # run 10-processor pilot
  python3 scripts/enrich_processors.py --all         # run full batch
  python3 scripts/enrich_processors.py --names=...   # run a specific subset
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from html.parser import HTMLParser

import openpyxl

REPO = Path(__file__).resolve().parents[1]
XLSX = Path("/Users/henryarrowood/Downloads/Farmshare Website Enrichment List.xlsx")
EXISTING = REPO / "src/data/processors.json"
OUT_DIR = REPO / "data/enrichment"
OUT_DIR.mkdir(parents=True, exist_ok=True)
STAGED = OUT_DIR / "staged.json"

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) "
      "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15")

SPECIES_KEYWORDS = {
    "Beef":  [r"\bbeef\b", r"\bcattle\b", r"\bsteer\b", r"\bheifer\b"],
    "Hog":   [r"\bhogs?\b", r"\bpork\b", r"\bpigs?\b", r"\bswine\b"],
    "Lamb":  [r"\blambs?\b", r"\bsheep\b", r"\bmutton\b"],
    "Goat":  [r"\bgoats?\b", r"\bchevon\b", r"\bcabrito\b"],
    "Bison": [r"\bbison\b", r"\bbuffalo\b"],
    "Deer":  [r"\bdeer\b", r"\bvenison\b", r"\belk\b", r"\bwild\s*game\b"],
}

INSPECTION_KEYWORDS = {
    "usda":         [r"\bUSDA\b", r"USDA[-\s]inspected", r"USDA[-\s]certified"],
    "custom":       [r"custom[-\s]exempt", r"custom[-\s]slaughter", r"custom[-\s]processing"],
    "state":        [r"state[-\s]inspected"],
}


def load_pending():
    """Load the xlsx and return processors that aren't already in the directory."""
    existing = json.loads(EXISTING.read_text())
    existing_keys = {
        (re.sub(r"[^a-z0-9]", "", (e.get("name") or "").lower()), e.get("state"))
        for e in existing
    }
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb.active
    out = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        name, state, addr, site = row
        if not name or not state or not addr:
            continue
        k = (re.sub(r"[^a-z0-9]", "", name.lower()), state)
        if k in existing_keys:
            continue
        out.append({
            "name": name.strip(),
            "state": state.strip(),
            "address": addr.strip(),
            "website_from_file": (site or "").strip() or None,
        })
    return out


class MetaExtractor(HTMLParser):
    """Pull open-graph, meta description, first <title>, first header <img>,
    favicon, phone links, and visible body text (bounded) from HTML."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.og = {}
        self.meta = {}
        self.title = None
        self._in_title = False
        self.favicon = None
        self.apple_icon = None
        self.first_header_img = None
        self._in_header = 0
        self.phone_links = []
        self.body_text_chunks = []
        self._body_depth = 0
        self._skip_depth = 0  # inside <script>/<style>

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            prop = a.get("property") or a.get("name") or ""
            content = a.get("content") or ""
            if prop.startswith("og:"):
                self.og[prop[3:]] = content
            elif prop.lower() in ("description", "twitter:description"):
                self.meta.setdefault("description", content)
        elif tag == "link":
            rels = (a.get("rel") or "").lower().split()
            href = a.get("href") or ""
            if "icon" in rels and not self.favicon:
                self.favicon = href
            if "apple-touch-icon" in rels and not self.apple_icon:
                self.apple_icon = href
        elif tag == "header" or (tag == "nav" and self._in_header == 0):
            self._in_header += 1
        elif tag == "img" and self._in_header > 0 and not self.first_header_img:
            src = a.get("src") or a.get("data-src") or ""
            alt = (a.get("alt") or "").lower()
            # Prefer images whose alt text looks logo-like, else first
            if src:
                self.first_header_img = src
                if "logo" in alt or "logo" in src.lower():
                    self.first_header_img = src  # locked in
        elif tag == "a":
            href = a.get("href") or ""
            if href.startswith("tel:"):
                self.phone_links.append(href[4:])
        elif tag == "body":
            self._body_depth += 1
        elif tag in ("script", "style", "noscript", "svg"):
            self._skip_depth += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "header" or tag == "nav":
            if self._in_header > 0:
                self._in_header -= 1
        elif tag in ("script", "style", "noscript", "svg"):
            if self._skip_depth > 0:
                self._skip_depth -= 1
        elif tag == "body":
            if self._body_depth > 0:
                self._body_depth -= 1

    def handle_data(self, data):
        if self._in_title and not self.title:
            self.title = data.strip()
        if self._body_depth > 0 and self._skip_depth == 0:
            s = data.strip()
            if s and len(" ".join(self.body_text_chunks)) < 20_000:
                self.body_text_chunks.append(s)


def fetch(url, timeout=12):
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    try:
        with urlopen(req, timeout=timeout) as resp:
            final_url = resp.geturl()
            raw = resp.read(500_000)  # cap at 500KB
            # crude content-type guess; accept text/html and unknown
            ctype = resp.headers.get("Content-Type", "").lower()
            if "text/html" not in ctype and "text" not in ctype:
                return final_url, None
            # Decode
            charset = "utf-8"
            if "charset=" in ctype:
                charset = ctype.split("charset=", 1)[1].split(";")[0].strip()
            try:
                return final_url, raw.decode(charset, errors="replace")
            except Exception:
                return final_url, raw.decode("utf-8", errors="replace")
    except (URLError, HTTPError, TimeoutError, ConnectionError, ValueError) as e:
        return None, f"ERROR: {type(e).__name__}: {e}"


def normalize_url(maybe_url, base_url=None):
    if not maybe_url:
        return None
    maybe_url = maybe_url.strip()
    if maybe_url.startswith("//"):
        return "https:" + maybe_url
    if maybe_url.startswith("/") and base_url:
        return urllib.parse.urljoin(base_url, maybe_url)
    if maybe_url.startswith("http://") or maybe_url.startswith("https://"):
        return maybe_url
    if base_url and "://" not in maybe_url:
        return urllib.parse.urljoin(base_url, maybe_url)
    return maybe_url


def detect_species(text):
    hits = []
    for sp, patterns in SPECIES_KEYWORDS.items():
        for p in patterns:
            if re.search(p, text, re.I):
                hits.append(sp)
                break
    return hits


def detect_inspection(text):
    hits = []
    for key, patterns in INSPECTION_KEYWORDS.items():
        for p in patterns:
            if re.search(p, text):
                hits.append(key)
                break
    return hits


def detect_phone(text):
    # common US phone formats
    m = re.search(r"\b(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})\b", text)
    return m.group(1) if m else None


def first_paragraph(text, min_len=60, max_len=400):
    # crude: pick the first reasonably long chunk
    for chunk in text.split("\n"):
        c = chunk.strip()
        if min_len <= len(c) <= max_len:
            return c
    return None


def scrape_one(url):
    final_url, body = fetch(url)
    if body is None or body.startswith("ERROR:"):
        return {"ok": False, "url": url, "reason": body or "no-response"}
    parser = MetaExtractor()
    try:
        parser.feed(body)
    except Exception as e:
        return {"ok": False, "url": url, "reason": f"parse-error: {e}"}

    og = parser.og
    meta = parser.meta
    about = og.get("description") or meta.get("description") or None
    # Fall back to first long paragraph if no meta description
    if not about:
        joined = "\n".join(parser.body_text_chunks)
        about = first_paragraph(joined)

    # Logo priority: og:image → apple-touch-icon → favicon → first header img
    logo = (og.get("image")
            or parser.apple_icon
            or parser.first_header_img
            or parser.favicon)
    logo = normalize_url(logo, final_url)

    joined_text = "\n".join(parser.body_text_chunks)
    species = detect_species(joined_text + " " + (about or "") + " " + (parser.title or ""))
    inspection = detect_inspection(joined_text + " " + (about or ""))
    phone = (parser.phone_links[0] if parser.phone_links else None) or detect_phone(joined_text)

    return {
        "ok": True,
        "url": url,
        "final_url": final_url,
        "title": parser.title,
        "about": about,
        "logo": logo,
        "phone": phone,
        "species": species,
        "inspection": inspection,
        "body_text_chars": len(joined_text),
    }


def run(processors, *, skip_discovery):
    results = []
    for i, p in enumerate(processors, 1):
        site = p.get("website_from_file")
        discovered = None
        if not site and not skip_discovery:
            # Discovery placeholder — this is where WebSearch would go.
            # For the pilot we intentionally skip discovery so Henry can
            # review scrape quality first. Marking for follow-up.
            p["discovery_status"] = "needs-search"
            results.append({**p, "enrichment": None, "reason": "no-website-yet"})
            print(f"[{i}/{len(processors)}] {p['name']} — skipping (no website in file; discovery not run in pilot)")
            continue
        if not site:
            results.append({**p, "enrichment": None, "reason": "skipped-no-website"})
            continue
        print(f"[{i}/{len(processors)}] {p['name']} — scraping {site}")
        scrape = scrape_one(site)
        results.append({**p, "discovered_url": discovered, "enrichment": scrape})
        time.sleep(1.0)  # polite delay
    return results


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pilot", action="store_true", help="Run a 10-processor pilot")
    ap.add_argument("--all", action="store_true", help="Run full batch")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--skip-discovery", action="store_true", default=True,
                    help="Skip web discovery for rows without a website URL (pilot default)")
    args = ap.parse_args()

    pending = load_pending()
    if args.pilot:
        with_site = [p for p in pending if p["website_from_file"]]
        without = [p for p in pending if not p["website_from_file"]]
        selection = with_site[:5] + without[:5]
    elif args.all:
        selection = pending
    else:
        print("Specify --pilot or --all")
        sys.exit(2)

    if args.limit:
        selection = selection[:args.limit]

    print(f"Running enrichment on {len(selection)} processors (pending pool: {len(pending)})")
    results = run(selection, skip_discovery=args.skip_discovery)

    out = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "source_file": str(XLSX),
        "count": len(results),
        "results": results,
    }
    STAGED.write_text(json.dumps(out, indent=2))
    print(f"\nWrote {STAGED.relative_to(REPO)}")

    # Quick quality summary
    enriched = [r for r in results if (r.get("enrichment") or {}).get("ok")]
    with_logo = sum(1 for r in enriched if r["enrichment"].get("logo"))
    with_about = sum(1 for r in enriched if r["enrichment"].get("about"))
    with_species = sum(1 for r in enriched if r["enrichment"].get("species"))
    with_phone = sum(1 for r in enriched if r["enrichment"].get("phone"))
    print(f"\nQuality summary:")
    print(f"  Scraped OK:   {len(enriched)}/{len(results)}")
    print(f"  With logo:    {with_logo}/{len(enriched)}")
    print(f"  With about:   {with_about}/{len(enriched)}")
    print(f"  With species: {with_species}/{len(enriched)}")
    print(f"  With phone:   {with_phone}/{len(enriched)}")


if __name__ == "__main__":
    main()
