"""
Enrich thin pre-existing prospect records in processors.json — ones that
predate the BD-list enrichment pipeline and only have state/name set.

Slug is preserved (so existing URLs don't break). Name/location/address/
phone/website/logo/lat/lng/species get filled in from Places + site scrape.

Low-confidence Places matches are SKIPPED (not overwritten) and listed for
manual review.

Usage:
  python3 scripts/enrich_thin_existing.py             # dry-run preview
  python3 scripts/enrich_thin_existing.py --apply     # write processors.json
"""
import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from enrich_with_places import (
    places_search, scrape_site, load_env, name_confidence, state_match,
    CONFIDENCE_THRESHOLD,
)

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "src/data/processors.json"
ABOUT = REPO / "src/data/processorAboutContent.json"


def is_thin(p: dict) -> bool:
    """A pre-BD placeholder: no city in location, no phone, no logo."""
    if p.get("status") != "prospect":
        return False
    location = p.get("location") or ""
    return ("," not in location
            and not p.get("phone")
            and not p.get("logo"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    env = load_env()
    api_key = env["VITE_GOOGLE_MAPS_API_KEY"]

    data = json.loads(DATA.read_text())
    about_content = json.loads(ABOUT.read_text()) if ABOUT.exists() else {}

    thin = [(i, p) for i, p in enumerate(data) if is_thin(p)]
    print(f"Found {len(thin)} thin records to enrich\n")

    enriched_count = 0
    skipped = []
    for idx, (di, p) in enumerate(thin, 1):
        name = p["name"]
        state = p["state"]
        query_addr = p.get("address") or f"{name} {state}"
        print(f"[{idx}/{len(thin)}] {name} ({state})")

        r = places_search(name, query_addr, state, api_key)
        if not r.get("ok"):
            skipped.append({"name": name, "state": state, "reason": r.get("error", "places-error")})
            print(f"  ✗ Places: {r.get('error')}")
            continue

        place = r["place"]
        places_name = (place.get("displayName") or {}).get("text", "")
        places_addr = place.get("formattedAddress", "")
        conf = name_confidence(name, places_name)
        sm = state_match(state, places_addr)
        if conf < CONFIDENCE_THRESHOLD or not sm:
            skipped.append({
                "name": name,
                "state": state,
                "reason": f"low-confidence ({conf:.2f}) or state-mismatch",
                "places_name": places_name,
                "places_addr": places_addr,
            })
            print(f"  ✗ conf={conf:.2f} state_match={sm}  →  '{places_name}' @ {places_addr}")
            continue

        # Parse city/zip from Places address
        import re as _re
        addr_parts = [x.strip() for x in places_addr.split(",")]
        city = addr_parts[-3] if len(addr_parts) >= 3 else None
        m = _re.match(r"([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?", addr_parts[-2] if len(addr_parts) >= 2 else "")
        zip_code = m.group(2) if m else None

        # Update record in-place (preserve slug)
        before = {k: p.get(k) for k in ("name","location","address","phone","website","logo","lat","lng","species","description","zip")}
        p["name"] = places_name or name
        if city and state:
            p["location"] = f"{city}, {state}"
        p["address"] = addr_parts[0] if addr_parts else p.get("address")
        if zip_code:
            p["zip"] = zip_code
        p["phone"] = place.get("nationalPhoneNumber") or p.get("phone")
        if place.get("websiteUri"):
            p["website"] = place["websiteUri"]
        loc_pt = place.get("location") or {}
        if loc_pt.get("latitude") and loc_pt.get("longitude"):
            p["lat"] = loc_pt["latitude"]
            p["lng"] = loc_pt["longitude"]

        # Scrape for logo / about / species
        if p.get("website"):
            s = scrape_site(p["website"])
            if s.get("ok"):
                if s.get("logo") and not p.get("logo"):
                    p["logo"] = s["logo"]
                # Species: union of existing + detected
                new_species = set(p.get("species") or []) | set(s.get("species") or [])
                if new_species:
                    p["species"] = sorted(new_species)
                if s.get("about"):
                    about_content[p["slug"]] = {"about": s["about"]}
                # Fallback phone
                if not p.get("phone") and s.get("phone"):
                    p["phone"] = s["phone"]

        enriched_count += 1
        print(f"  ✓ {p['name']}  →  {p.get('location','?')}  website={p.get('website') or '(none)'}  logo={'yes' if p.get('logo') else 'no'}")
        time.sleep(0.5)

    print(f"\n─── Summary ───")
    print(f"  Enriched:  {enriched_count}/{len(thin)}")
    print(f"  Skipped:   {len(skipped)}")
    if skipped:
        print(f"\nSkipped (flagged for manual review):")
        for s in skipped:
            print(f"  - {s['name']}  |  {s['reason']}"
                  + (f"  →  '{s.get('places_name','')}' @ {s.get('places_addr','')}" if s.get("places_name") else ""))

    if args.apply and enriched_count:
        DATA.write_text(json.dumps(data, indent=2) + "\n")
        ABOUT.write_text(json.dumps(about_content, indent=2) + "\n")
        print(f"\n✓ Wrote {DATA.relative_to(REPO)} and {ABOUT.relative_to(REPO)}")
    elif not args.apply:
        print("\nDry-run. Re-run with --apply to write.")


if __name__ == "__main__":
    main()
