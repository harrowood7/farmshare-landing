"""
Find logos for records that have a website but no logo. Smarter than the
original scraper: looks at ALL <img> tags on the page (not just inside
<header>/<nav>) for ones whose src or alt contains 'logo'. Prefers
non-favicon paths and PNG/SVG over JPG.

Skips records whose website domain is on the known-bad list (CMS defaults,
sister-brand favicons).

Writes proposals to data/enrichment/logo_suggestions.json. Run with --apply
to write into processors.json.

Usage:
  python3 scripts/find_missing_logos.py             # dry-run
  python3 scripts/find_missing_logos.py --apply     # write to processors.json
  python3 scripts/find_missing_logos.py --limit 20  # pilot
"""
import argparse, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "src/data/processors.json"
OUT = REPO / "data/enrichment/logo_suggestions.json"

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

BAD_LOGO_PATTERNS = [
    r"assets\.squarespace\.com/universal",
    r"wix\.com/favicon",
    r"justplainbusiness\.com",
    r"websites\.hibu\.com",
    r"cropped-htm",
    r"cropped-fav-icon",
    r"default-favicon",
]


def is_bad(url):
    if not url:
        return True
    if url.startswith("data:"):  # base64 inline images bloat JSON
        return True
    return any(re.search(p, url, re.I) for p in BAD_LOGO_PATTERNS)


def absolutize(url, base):
    if not url:
        return None
    if url.startswith("//"):
        url = "https:" + url
    elif not url.startswith("http"):
        url = urllib.parse.urljoin(base, url)
    # Strip Wix's image processing transforms (returns original resolution)
    if "wixstatic.com" in url and "/v1/" in url:
        url = re.sub(r"(\.(?:png|jpg|jpeg|webp|gif))/v1/.*$", r"\1", url, flags=re.I)
    return url


def fetch(url, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            final = r.geturl()
            data = r.read()
            ct = r.headers.get("Content-Type", "")
            try:
                text = data.decode("utf-8")
            except Exception:
                text = data.decode("latin-1", "ignore")
            return final, text, ct
    except Exception as e:
        return None, None, str(e)


def find_logo_in_html(html, base):
    """Score and return the best logo URL on the page."""
    candidates = []
    # 1. og:image
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image', html, re.I)
    if m:
        candidates.append((30, "og:image", m.group(1)))

    # 2. All <img> tags — score by 'logo' in src or alt, prefer png/svg
    for m in re.finditer(r'<img\b[^>]*?>', html, re.I):
        tag = m.group(0)
        src = (re.search(r'\bsrc=["\']([^"\']+)', tag, re.I) or [None, ""])[1]
        if not src:
            continue
        alt = (re.search(r'\balt=["\']([^"\']*)', tag, re.I) or [None, ""])[1].lower()
        score = 0
        src_lower = src.lower()
        if "logo" in src_lower:
            score += 20
        if "logo" in alt:
            score += 15
        if src_lower.endswith((".svg",)):
            score += 8
        elif src_lower.endswith((".png", ".webp")):
            score += 4
        elif src_lower.endswith((".gif", ".ico")):
            score -= 5
        # Penalize obvious non-logos
        if any(bad in src_lower for bad in ("/icon", "favicon", "thumb", "cropped-")):
            score -= 8
        if any(bad in src_lower for bad in ("twitter", "facebook", "instagram", "linkedin", "credit", "/sign", "cover", "banner", "hero")):
            score -= 30
        if "tracking" in src_lower or "pixel" in src_lower:
            score -= 30
        if score > 0:
            candidates.append((score, "img", src))

    # 3. apple-touch-icon (last resort, score lower)
    for m in re.finditer(r'<link[^>]+rel=["\']([^"\']*apple-touch-icon[^"\']*)["\'][^>]+href=["\']([^"\']+)', html, re.I):
        candidates.append((5, "apple-touch", m.group(2)))

    if not candidates:
        return None
    candidates.sort(key=lambda c: -c[0])
    for score, kind, url in candidates:
        if score < 10:
            continue  # too weak — better to fall back to initials than guess wrong
        full = absolutize(url, base)
        if not is_bad(full):
            return {"url": full, "score": score, "via": kind}
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    data = json.loads(DATA.read_text())
    targets = [r for r in data
               if r.get("website") and not r.get("logo")
               and not is_bad(r.get("website",""))]
    if args.limit:
        targets = targets[:args.limit]
    print(f"Searching for logos on {len(targets)} records with website but no logo\n")

    suggestions = []
    found = 0
    for i, row in enumerate(targets, 1):
        url = row["website"]
        if not url.startswith("http"):
            url = "http://" + url
        final, html, ct = fetch(url)
        entry = {"slug": row["slug"], "name": row["name"], "website": url}
        if not html or not ct.startswith(("text/html", "application/xhtml")):
            entry["error"] = ct or "no-response"
        else:
            picked = find_logo_in_html(html, final or url)
            if picked:
                entry["logo"] = picked["url"]
                entry["via"] = picked["via"]
                entry["score"] = picked["score"]
                found += 1
            else:
                entry["error"] = "no-candidate"
        suggestions.append(entry)
        if i % 20 == 0 or i == len(targets):
            print(f"  [{i}/{len(targets)}] found={found}")
        time.sleep(0.4)

    OUT.write_text(json.dumps(suggestions, indent=2) + "\n")
    print(f"\nWrote {OUT.relative_to(REPO)}: {found}/{len(targets)} matched")

    if args.apply:
        by_slug = {s["slug"]: s for s in suggestions}
        applied = 0
        for r in data:
            s = by_slug.get(r["slug"])
            if s and s.get("logo") and not r.get("logo"):
                r["logo"] = s["logo"]
                applied += 1
        DATA.write_text(json.dumps(data, indent=2) + "\n")
        print(f"✓ Applied {applied} logos to processors.json")


if __name__ == "__main__":
    main()
