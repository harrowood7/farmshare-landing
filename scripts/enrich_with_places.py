"""
Places-API-based enrichment for new processors from the BD team's list.

Flow per processor:
  1. Google Places API (New) Text Search   → canonical name, address, lat/lng,
                                              website, phone, place_id, photo refs
  2. Scrape website (if found)             → logo (og:image / apple-touch-icon /
                                              header img), about (og:description /
                                              meta description / /about fallback),
                                              species keywords, inspection level
  3. Quality-score and write to `data/enrichment/staged.json`

Output is *staged* — not merged into `src/data/processors.json`. Human review
first.

Cost per 610 processors, with field masking:
  Text Search (basic+contact) ≈ $10/1000 calls → ~$6
  Place photos optional (not enabled by default)

Usage:
  python3 scripts/enrich_with_places.py --pilot         # 10-processor pilot
  python3 scripts/enrich_with_places.py --limit 50      # first 50 pending
  python3 scripts/enrich_with_places.py --all           # full batch
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
from difflib import SequenceMatcher
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from html.parser import HTMLParser

import openpyxl

REPO = Path(__file__).resolve().parents[1]
XLSX = Path("/Users/henryarrowood/Downloads/Farmshare Website Enrichment List.xlsx")
EXISTING = REPO / "src/data/processors.json"
OUT_DIR = REPO / "data/enrichment"
OUT_DIR.mkdir(parents=True, exist_ok=True)
STAGED = OUT_DIR / "staged.json"
ENV = REPO / ".env"

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
    "usda":   [r"\bUSDA\b", r"USDA[-\s]inspected", r"USDA[-\s]certified"],
    "custom": [r"custom[-\s]exempt", r"custom[-\s]slaughter", r"custom[-\s]processing"],
    "state":  [r"state[-\s]inspected"],
}

# Words that appear so often in processor names they carry no signal. We strip
# these before scoring name similarity between the BD list and what Places returned.
NAME_FILLER = {
    "meat", "meats", "processing", "processor", "processors", "shop", "shoppe",
    "store", "market", "company", "co", "corporation", "corp", "inc", "llc",
    "ltd", "the", "and", "of", "family", "farm", "farms", "locker", "lockers",
    "butcher", "butchery", "butchers", "son", "sons", "plant", "plants",
    "packing", "packers", "packer", "custom", "provisions", "service",
    "services", "food", "foods", "product", "products", "smokehouse", "house",
    "usda", "local",
}

# Minimum combined score (see `name_confidence`) for a BD↔Places match to be
# treated as trustworthy. Lower = flag for manual review.
CONFIDENCE_THRESHOLD = 0.40


def _normalize_name_tokens(name: str) -> set:
    s = (name or "").lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    tokens = set()
    for tok in s.split():
        if not tok or tok in NAME_FILLER:
            continue
        # Crude singularize: "meats"→"meat", "sons"→"son" already hit the filler,
        # but names like "burkes"→"burke" need this.
        if len(tok) > 3 and tok.endswith("s") and not tok.endswith("ss"):
            tok = tok[:-1]
        tokens.add(tok)
    return tokens


def name_confidence(bd_name: str, places_name: str) -> float:
    """0.0–1.0 score. >= CONFIDENCE_THRESHOLD = keep; below = flag for review."""
    if not places_name:
        return 0.0
    tb = _normalize_name_tokens(bd_name)
    tp = _normalize_name_tokens(places_name)
    ratio = SequenceMatcher(None, bd_name.lower(), places_name.lower()).ratio()
    if not tb or not tp:
        # One side collapsed to pure filler — fall back to raw string similarity.
        return ratio
    overlap = tb & tp
    if overlap:
        jaccard = len(overlap) / len(tb | tp)
        # Overlap on content words is a strong signal; blend with raw ratio.
        return max(jaccard, ratio)
    # No content-word overlap — the businesses are probably different.
    # Cap the score at half the raw string similarity to flag these.
    return ratio * 0.5


def state_match(bd_state: str, places_address: str) -> bool:
    """Sanity check: Places-returned address should contain the BD state code."""
    if not bd_state or not places_address:
        return False
    up_addr = places_address.upper()
    return (
        f", {bd_state.upper()}" in up_addr
        or f" {bd_state.upper()} " in up_addr
        or up_addr.endswith(f" {bd_state.upper()}")
    )


# ─── Env ──────────────────────────────────────────────────────────────────────

def load_env():
    vals = {}
    for line in ENV.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            vals[k.strip()] = v.strip()
    return vals


# ─── Places API (New) ─────────────────────────────────────────────────────────

PLACES_TEXT_SEARCH = "https://places.googleapis.com/v1/places:searchText"

# Field mask — only what we actually use. Keeps cost in the $10-per-1000 band.
PLACES_FIELDS = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.googleMapsUri",
    "places.primaryType",
    "places.types",
])


def places_search(name, address, state, api_key):
    """One Text Search call. Returns the top candidate dict or an error dict."""
    # Compose a high-signal query. Places Text Search is fuzzy but rewards
    # specific inputs — so we give it name + full address.
    query = f"{name} {address}".strip()
    payload = {
        "textQuery": query,
        "regionCode": "US",
        "maxResultCount": 3,
    }
    req = Request(
        PLACES_TEXT_SEARCH,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": PLACES_FIELDS,
        },
        data=json.dumps(payload).encode("utf-8"),
    )
    try:
        with urlopen(req, timeout=20) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        return {"error": f"HTTP {e.code}: {err_body[:400]}"}
    except (URLError, TimeoutError, ConnectionError) as e:
        return {"error": f"{type(e).__name__}: {e}"}

    places = body.get("places") or []
    if not places:
        return {"error": "no-match", "query": query}

    # Pick the best match: prefer one whose formattedAddress contains our state
    preferred = None
    for p in places:
        addr = (p.get("formattedAddress") or "").upper()
        if f", {state.upper()}" in addr or f" {state.upper()} " in addr:
            preferred = p
            break
    best = preferred or places[0]
    return {"ok": True, "place": best, "candidates_count": len(places)}


# ─── Website scrape ───────────────────────────────────────────────────────────

class MetaExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.og = {}
        self.meta = {}
        self.title = None
        self._in_title = False
        self.favicon = None
        self.apple_icon = None
        self.header_imgs = []
        self._in_header = 0
        self.phone_links = []
        self.body_text_chunks = []
        self._body_depth = 0
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            prop = (a.get("property") or a.get("name") or "").lower()
            content = a.get("content") or ""
            if prop.startswith("og:"):
                self.og[prop[3:]] = content
            elif prop in ("description", "twitter:description"):
                self.meta.setdefault("description", content)
        elif tag == "link":
            rels = (a.get("rel") or "").lower().split()
            href = a.get("href") or ""
            if "icon" in rels and not self.favicon:
                self.favicon = href
            if "apple-touch-icon" in rels and not self.apple_icon:
                self.apple_icon = href
        elif tag in ("header", "nav"):
            self._in_header += 1
        elif tag == "img" and self._in_header > 0:
            src = a.get("src") or a.get("data-src") or ""
            alt = (a.get("alt") or "").lower()
            if src:
                score = 2 if ("logo" in alt or "logo" in src.lower()) else 1
                self.header_imgs.append((score, src))
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
        elif tag in ("header", "nav"):
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
            if s and sum(len(c) for c in self.body_text_chunks) < 20_000:
                self.body_text_chunks.append(s)

    def best_header_img(self):
        if not self.header_imgs:
            return None
        # pick highest score, earliest occurrence
        return sorted(self.header_imgs, key=lambda t: -t[0])[0][1]


def fetch(url, timeout=12):
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    try:
        with urlopen(req, timeout=timeout) as resp:
            final_url = resp.geturl()
            raw = resp.read(500_000)
            ctype = (resp.headers.get("Content-Type") or "").lower()
            if "text/html" not in ctype and "text" not in ctype:
                return final_url, None
            charset = "utf-8"
            if "charset=" in ctype:
                charset = ctype.split("charset=", 1)[1].split(";")[0].strip()
            try:
                return final_url, raw.decode(charset, errors="replace")
            except Exception:
                return final_url, raw.decode("utf-8", errors="replace")
    except Exception as e:
        return None, f"ERROR: {type(e).__name__}: {e}"


def normalize_url(maybe_url, base_url=None):
    if not maybe_url:
        return None
    u = maybe_url.strip()
    if u.startswith("//"):
        return "https:" + u
    if u.startswith("/") and base_url:
        return urllib.parse.urljoin(base_url, u)
    if u.startswith("http://") or u.startswith("https://"):
        return u
    if base_url and "://" not in u:
        return urllib.parse.urljoin(base_url, u)
    return u


def detect_species(text):
    out = []
    for sp, patterns in SPECIES_KEYWORDS.items():
        for p in patterns:
            if re.search(p, text, re.I):
                out.append(sp)
                break
    return out


def detect_inspection(text):
    out = []
    for key, patterns in INSPECTION_KEYWORDS.items():
        for p in patterns:
            if re.search(p, text):
                out.append(key)
                break
    return out


def detect_phone(text):
    m = re.search(r"(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})", text)
    return m.group(1) if m else None


def first_paragraph(text, min_len=60, max_len=400):
    for chunk in text.split("\n"):
        c = chunk.strip()
        if min_len <= len(c) <= max_len:
            return c
    return None


def scrape_site(url):
    """Homepage + /about fallback. Combines their text for species/inspection detection."""
    visited = []
    combined_text = []
    meta_parser = None
    final_url_home = None

    # Homepage
    final_url, body = fetch(url)
    if body is None or (body or "").startswith("ERROR:"):
        return {"ok": False, "url": url, "reason": body or "no-response"}
    final_url_home = final_url
    visited.append(final_url)
    parser = MetaExtractor()
    try:
        parser.feed(body)
    except Exception as e:
        return {"ok": False, "url": url, "reason": f"parse-error: {e}"}
    meta_parser = parser
    combined_text.append("\n".join(parser.body_text_chunks))

    # Try /about for more species/inspection signal
    about_url = urllib.parse.urljoin(final_url, "/about")
    if about_url not in visited:
        try:
            _, ab_body = fetch(about_url, timeout=8)
            if ab_body and not ab_body.startswith("ERROR:"):
                ap = MetaExtractor()
                ap.feed(ab_body)
                combined_text.append("\n".join(ap.body_text_chunks))
                visited.append(about_url)
        except Exception:
            pass

    joined_text = "\n".join(combined_text)

    # Logo priority
    logo = (meta_parser.og.get("image")
            or meta_parser.apple_icon
            or meta_parser.best_header_img()
            or meta_parser.favicon)
    logo = normalize_url(logo, final_url_home)

    about = (meta_parser.og.get("description")
             or meta_parser.meta.get("description")
             or first_paragraph(joined_text))

    species = detect_species(joined_text + " " + (about or "") + " " + (meta_parser.title or ""))
    inspection = detect_inspection(joined_text + " " + (about or ""))
    phone = (meta_parser.phone_links[0] if meta_parser.phone_links else None) or detect_phone(joined_text)

    return {
        "ok": True,
        "url": url,
        "final_url": final_url_home,
        "pages_visited": visited,
        "title": meta_parser.title,
        "about": about,
        "logo": logo,
        "phone": phone,
        "species": species,
        "inspection": inspection,
        "body_text_chars": len(joined_text),
    }


# ─── Loader ───────────────────────────────────────────────────────────────────

def load_pending():
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


# ─── Run ──────────────────────────────────────────────────────────────────────

def run(processors, *, api_key, do_scrape=True):
    results = []
    for i, p in enumerate(processors, 1):
        print(f"[{i}/{len(processors)}] {p['name']} ({p['state']})")
        entry = {**p, "places": None, "scrape": None,
                 "name_confidence": 0.0, "state_matches": False,
                 "needs_review": True, "review_reason": None}

        # Phase 1: Places
        places_result = places_search(p["name"], p["address"], p["state"], api_key)
        entry["places"] = places_result
        website = p.get("website_from_file")
        if places_result.get("ok"):
            place = places_result["place"]
            places_name = (place.get("displayName") or {}).get("text", "")
            places_addr = place.get("formattedAddress") or ""
            places_website = place.get("websiteUri")
            conf = name_confidence(p["name"], places_name)
            sm = state_match(p["state"], places_addr)
            entry["name_confidence"] = round(conf, 3)
            entry["state_matches"] = sm
            # Flag if name confidence is low OR Places address is in a different state.
            if conf < CONFIDENCE_THRESHOLD:
                entry["needs_review"] = True
                entry["review_reason"] = f"low-name-similarity ({conf:.2f}): '{p['name']}' vs '{places_name}'"
            elif not sm:
                entry["needs_review"] = True
                entry["review_reason"] = f"state-mismatch: expected {p['state']}, got '{places_addr}'"
            else:
                entry["needs_review"] = False
                entry["review_reason"] = None
            if places_website and not website:
                website = places_website
            flag = " ⚠ REVIEW" if entry["needs_review"] else ""
            print(f"    Places: {places_name}  conf={conf:.2f}{flag}")
            print(f"      website={places_website or 'none'}  phone={place.get('nationalPhoneNumber','none')}")
        else:
            entry["review_reason"] = f"places-error: {places_result.get('error')}"
            print(f"    Places: {places_result.get('error')}")

        # Phase 2: Scrape
        if do_scrape and website:
            print(f"    Scrape: {website}")
            entry["scrape"] = scrape_site(website)
            if entry["scrape"].get("ok"):
                s = entry["scrape"]
                print(f"      logo={bool(s.get('logo'))} "
                      f"about={bool(s.get('about'))} "
                      f"species={s.get('species') or []} "
                      f"phone={s.get('phone') or 'none'}")
            else:
                print(f"      scrape failed: {entry['scrape'].get('reason','?')}")

        results.append(entry)
        time.sleep(0.6)
    return results


def summarize(results):
    n = len(results)
    places_ok = sum(1 for r in results if (r.get("places") or {}).get("ok"))
    with_website = sum(1 for r in results
                       if (((r.get("places") or {}).get("place") or {}).get("websiteUri"))
                       or r.get("website_from_file"))
    flagged = [r for r in results if r.get("needs_review")]
    scraped = [r for r in results if (r.get("scrape") or {}).get("ok")]
    with_logo = sum(1 for r in scraped if r["scrape"].get("logo"))
    with_about = sum(1 for r in scraped if r["scrape"].get("about"))
    with_species = sum(1 for r in scraped if r["scrape"].get("species"))
    print("\n─── Quality summary ───")
    print(f"  Places resolved:    {places_ok}/{n}")
    print(f"  With website:       {with_website}/{n}")
    print(f"  Scraped OK:         {len(scraped)}/{n}")
    print(f"    With logo:        {with_logo}/{len(scraped) or 1}")
    print(f"    With about:       {with_about}/{len(scraped) or 1}")
    print(f"    With species:     {with_species}/{len(scraped) or 1}")
    print(f"\n  Flagged for review: {len(flagged)}/{n}")
    if flagged:
        print(f"  (These will be skipped at merge time and written to needs_review.json)")
        for r in flagged[:10]:
            print(f"    ⚠ {r['name']}  →  {r.get('review_reason')}")
        if len(flagged) > 10:
            print(f"    … and {len(flagged) - 10} more")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pilot", action="store_true")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--no-scrape", action="store_true")
    args = ap.parse_args()

    env = load_env()
    api_key = env.get("VITE_GOOGLE_MAPS_API_KEY")
    if not api_key:
        print("Missing VITE_GOOGLE_MAPS_API_KEY in .env", file=sys.stderr)
        sys.exit(1)

    pending = load_pending()
    if args.pilot:
        # 5 with a website already + 5 without, so we exercise both code paths
        with_site = [p for p in pending if p["website_from_file"]]
        without_site = [p for p in pending if not p["website_from_file"]]
        selection = with_site[:5] + without_site[:5]
    elif args.all:
        selection = pending
    else:
        print("Specify --pilot or --all")
        sys.exit(2)
    if args.limit:
        selection = selection[:args.limit]

    print(f"Enriching {len(selection)} processors (pending pool: {len(pending)})\n")
    results = run(selection, api_key=api_key, do_scrape=not args.no_scrape)

    staged = [r for r in results if not r.get("needs_review")]
    flagged = [r for r in results if r.get("needs_review")]

    STAGED.write_text(json.dumps({
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "source_file": str(XLSX),
        "count": len(staged),
        "results": staged,
    }, indent=2))
    review_path = OUT_DIR / "needs_review.json"
    review_path.write_text(json.dumps({
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "count": len(flagged),
        "results": flagged,
    }, indent=2))
    print(f"\nWrote {STAGED.relative_to(REPO)} ({len(staged)} ready)")
    print(f"Wrote {review_path.relative_to(REPO)} ({len(flagged)} flagged for review)")
    summarize(results)


if __name__ == "__main__":
    main()
