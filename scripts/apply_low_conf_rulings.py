"""
Apply Henry's manual rulings on the pre-BD audit's low-confidence batch.

  - REMOVE: E.O.M.S. Inc. (PA), Hand Spanked Beef LLC (WI)
  - SKIP:   Frontier Meat Packing (GA) — not yet open, leave untouched
  - ACCEPT: 7 businesses where Places match in same state (Henning, Kinikin,
            Meat Worx, Ovid, Perham, Sorg's, Wanamingo). Re-queries Places
            fresh to collect phone/website/lat/lng/zip/address fills, then
            applies rename + fills. Also scrapes the website for logo + about
            + species, matching the behavior of audit_legacy_prospects.py.

Held back for Henry to confirm (flagged in output, not applied):
  - The Butcher Barn TN → Butchers at RiNo CO (state change)
  - His Provisions Butcher Shop OH → "New Creation Farm" (not obviously a butcher)
"""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from enrich_with_places import places_search, scrape_site, load_env

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "src/data/processors.json"
ABOUT = REPO / "src/data/processorAboutContent.json"

REMOVE_SLUGS = {
    "e-o-m-s-inc-pa",
    "hand-spanked-beef-llc-wi",
}

ACCEPT_SLUGS = [
    "henning-meat-locker-henning-mn",
    "kinikin-processing-llc-montrose-co",
    "meat-worx-or",
    "ovid-meat-co-llc-ovid-co",
    "perham-meat-market-perham-mn",
    "sorgs-darien-wi",
    "wanamingo-meats-wanamingo-mn",
]


def parse_places_addr(formatted_addr: str) -> dict:
    import re
    out = {}
    if not formatted_addr:
        return out
    parts = [p.strip() for p in formatted_addr.split(",")]
    if parts and parts[-1].upper() in ("USA", "UNITED STATES"):
        parts = parts[:-1]
    if len(parts) >= 3:
        out["address"] = parts[0]
        out["city"] = parts[-3]
        m = re.match(r"([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?", parts[-2])
        if m:
            out["state"] = m.group(1)
            if m.group(2):
                out["zip"] = m.group(2)
    return out


def main():
    env = load_env()
    key = env["VITE_GOOGLE_MAPS_API_KEY"]

    data = json.loads(DATA.read_text())
    about = json.loads(ABOUT.read_text())

    before_n = len(data)

    # Removes
    removed = [p["name"] for p in data if p["slug"] in REMOVE_SLUGS]
    data = [p for p in data if p["slug"] not in REMOVE_SLUGS]
    print(f"Removed {len(removed)} records: {removed}\n")

    # Accepts
    by_slug = {p["slug"]: p for p in data}
    applied = []
    for slug in ACCEPT_SLUGS:
        p = by_slug.get(slug)
        if not p:
            print(f"  ✗ {slug} — not found, skipping")
            continue
        state = p.get("state", "")
        addr = p.get("address") or p.get("location") or state
        pr = places_search(p["name"], addr, state, key)
        if not pr.get("ok"):
            print(f"  ✗ {p['name']} — Places error: {pr.get('error')}")
            continue
        place = pr["place"]
        places_name = (place.get("displayName") or {}).get("text", "")
        places_addr = place.get("formattedAddress", "")
        addr_parts = parse_places_addr(places_addr)

        changes = {"name": places_name}
        if place.get("nationalPhoneNumber"):
            changes["phone"] = place["nationalPhoneNumber"]
        if place.get("websiteUri"):
            changes["website"] = place["websiteUri"]
        loc_pt = place.get("location") or {}
        if loc_pt.get("latitude"):
            changes["lat"] = loc_pt["latitude"]
            changes["lng"] = loc_pt["longitude"]
        if addr_parts.get("zip"):
            changes["zip"] = addr_parts["zip"]
        if addr_parts.get("address"):
            changes["address"] = addr_parts["address"]
        if addr_parts.get("city") and addr_parts.get("state"):
            changes["location"] = f"{addr_parts['city']}, {addr_parts['state']}"

        # Scrape website for logo/about/species
        if changes.get("website"):
            s = scrape_site(changes["website"])
            if s.get("ok"):
                if s.get("logo") and not p.get("logo"):
                    changes["logo"] = s["logo"]
                if s.get("about"):
                    about[slug] = {"about": s["about"]}
                if s.get("species"):
                    merged = sorted(set(p.get("species") or []) | set(s["species"]))
                    if merged != (p.get("species") or []):
                        changes["species"] = merged

        for k, v in changes.items():
            p[k] = v
        applied.append({
            "slug": slug,
            "old_name": p["name"] if "name" not in changes else [x for x in [p.get("name")] if x],
            "new_name": places_name,
            "fields": sorted(changes.keys()),
        })
        print(f"  ✓ {slug} → {places_name}  ({', '.join(sorted(changes.keys()))})")
        time.sleep(0.3)

    DATA.write_text(json.dumps(data, indent=2) + "\n")
    ABOUT.write_text(json.dumps(about, indent=2) + "\n")
    print(f"\n─── Summary ───")
    print(f"  Before: {before_n} records")
    print(f"  After:  {len(data)} records (removed {len(removed)})")
    print(f"  Accepts applied: {len(applied)}/{len(ACCEPT_SLUGS)}")
    print(f"  Deferred for Henry's confirmation:")
    print(f"    - the-butcher-barn-dyersburg-tn (Places says Denver CO — state mismatch)")
    print(f"    - his-provisions-butcher-shop-chardon-oh (Places says 'New Creation Farm' — likely wrong business)")
    print(f"  Frontier Meat Packing (GA): left untouched (not yet open)")


if __name__ == "__main__":
    main()
