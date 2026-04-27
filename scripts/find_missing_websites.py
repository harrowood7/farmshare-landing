"""
For each prospect missing a website, search DuckDuckGo HTML and pick the
first result that:
  1. Isn't a directory (yellowpages, yelp, bbb, facebook, etc.)
  2. Shares a meaningful name token (>= 4 chars) with the business name

Writes proposed matches to data/enrichment/website_suggestions.json for
Henry's review BEFORE applying. Run with --apply to commit.

Usage:
  python3 scripts/find_missing_websites.py              # generate suggestions
  python3 scripts/find_missing_websites.py --apply      # write websites to processors.json
  python3 scripts/find_missing_websites.py --limit 20   # pilot
"""
import argparse, json, re, time, urllib.parse, urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "src/data/processors.json"
OUT = REPO / "data/enrichment/website_suggestions.json"

DIRECTORY_DOMAINS = {
    "yellowpages.com", "yelp.com", "bbb.org", "mapquest.com", "google.com",
    "facebook.com", "linkedin.com", "manta.com", "dnb.com", "buzzfile.com",
    "citysquares.com", "allbusiness.com", "localstack.com", "chamberofcommerce.com",
    "tripadvisor.com", "bizapedia.com", "local.com", "cylex.us.com", "hotfrog.com",
    "bizjournals.com", "indeed.com", "glassdoor.com", "instagram.com",
    "tiktok.com", "youtube.com", "twitter.com", "x.com", "pinterest.com",
    "wikipedia.org", "usda.gov", "fsis.usda.gov", "gov",
    "n49.com", "foursquare.com", "superpages.com", "merchantcircle.com",
    "usasearchdirectory.com", "americantowns.com", "zaubacorp.com",
    "opencorporates.com", "ziprecruiter.com", "apollo.io", "crunchbase.com",
    "brokercheck.com", "mapquestapi.com", "whereisit.com",
}

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def name_tokens(name: str) -> set:
    """Meaningful tokens from the business name, for domain-match heuristic."""
    tokens = re.findall(r"[a-z0-9]+", name.lower())
    stop = {"the","inc","llc","co","company","meats","meat","market","markets",
            "processing","processor","processors","lockers","locker","shop",
            "butcher","butchers","butchery","packing","farm","farms","ranch"}
    return {t for t in tokens if len(t) >= 4 and t not in stop}


def extract_domain(url: str) -> str:
    m = re.search(r"https?://([^/]+)", url)
    if not m:
        return ""
    d = m.group(1).lower()
    if d.startswith("www."):
        d = d[4:]
    return d


def search(query: str):
    """Return list of (url, title, domain) from DDG HTML results."""
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        html = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "ignore")
    except Exception:
        return []
    # Extract all result anchors and their uddg= params
    results = []
    for m in re.finditer(r'<a rel="nofollow" class="result__a" href="([^"]+)"[^>]*>([^<]+)</a>', html):
        href, title = m.group(1), m.group(2)
        # DDG wraps: //duckduckgo.com/l/?uddg=<URL_encoded>&...
        mm = re.search(r"uddg=([^&]+)", href)
        if not mm:
            continue
        real = urllib.parse.unquote(mm.group(1))
        domain = extract_domain(real)
        results.append({"url": real, "title": title.strip(), "domain": domain})
    return results


def is_directory(domain: str) -> bool:
    for d in DIRECTORY_DOMAINS:
        if domain == d or domain.endswith("." + d):
            return True
    # .gov and .edu typically aren't the business
    if domain.endswith(".gov") or domain.endswith(".edu"):
        return True
    return False


def pick_best(results, name_toks):
    # Pass 1: prefer a real site whose domain shares a token with the business name
    for r in results:
        if r["domain"] == "facebook.com" or r["domain"].endswith(".facebook.com"):
            continue
        if is_directory(r["domain"]):
            continue
        dom_stripped = re.sub(r"\.(com|net|org|co|us|shop|farm|biz|info)$", "", r["domain"])
        dom_tokens = re.findall(r"[a-z0-9]+", dom_stripped)
        if any(t in dt or dt in t for t in name_toks for dt in dom_tokens):
            r["source"] = "website"
            return r
    # Pass 2: accept a Facebook page if its title contains a meaningful name token
    for r in results:
        if r["domain"] == "facebook.com" or r["domain"].endswith(".facebook.com"):
            title_lower = r["title"].lower()
            if any(t in title_lower for t in name_toks):
                r["source"] = "facebook"
                return r
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    data = json.loads(DATA.read_text())
    targets = [r for r in data if r.get("status") == "prospect" and not r.get("website")]
    if args.limit:
        targets = targets[:args.limit]
    print(f"Searching {len(targets)} prospects without websites\n")

    suggestions = []
    hits = 0
    for i, row in enumerate(targets, 1):
        city = ""
        loc = row.get("location") or ""
        if "," in loc:
            city = loc.split(",")[0].strip()
        q = f"{row['name']} {city} {row.get('state','')}".strip()
        results = search(q)
        toks = name_tokens(row["name"])
        best = pick_best(results, toks)
        entry = {
            "slug": row["slug"],
            "name": row["name"],
            "state": row.get("state"),
            "query": q,
            "picked": best,
            "all_top3": results[:3],
        }
        suggestions.append(entry)
        if best:
            hits += 1
        if i % 10 == 0 or i == len(targets):
            print(f"  [{i}/{len(targets)}] hits={hits}")
        time.sleep(1.5)

    OUT.write_text(json.dumps(suggestions, indent=2) + "\n")
    print(f"\nWrote {OUT.relative_to(REPO)}")
    print(f"  Matched: {hits}/{len(targets)} ({100*hits//max(len(targets),1)}%)")

    if args.apply:
        applied = 0
        by_slug = {r["slug"]: r for r in data}
        for s in suggestions:
            if s["picked"]:
                by_slug[s["slug"]]["website"] = s["picked"]["url"]
                applied += 1
        DATA.write_text(json.dumps(data, indent=2) + "\n")
        print(f"\n✓ Applied {applied} websites to processors.json")
    else:
        print("\nDry-run. Re-run with --apply to write.")


if __name__ == "__main__":
    main()
