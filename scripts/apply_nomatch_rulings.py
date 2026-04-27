"""
Apply Henry's second batch of rulings on pre-BD audit leftovers.

  - Canby Meats (OR)           → accept Places: Ebner's Custom Meats
  - His Provisions Butcher Shop (OH) → keep NAME, apply address/lat/lng only
    (Places returned 'New Creation Farm' at same physical address — Henry
     clarified farm and butcher shop share a location)
  - Circuit Creek Meat (NH)    → apply fills (re-query finds the real listing
    now — the audit's no-match was a query miss)
  - Double L Meat Processing   → state correction VA → WY (Sheridan), apply fills
  - SugarLoaf Mountain Meats (KY) → apply fills

Skipped:
  - The Butcher Barn (TN) — Places match was Denver CO; untouched
  - Meriwether Farms (WY), Nexus Beef (TX) — 'don't worry about'
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


# (slug, search_name, search_state, mode, force_state)
#   mode: 'full'        = rename + all fills
#         'fills_only'  = keep name, take address/lat/lng/phone/website/zip
#         'addr_only'   = keep name, only take address/lat/lng (same-place case)
#   force_state: override state on the record (for corrections)
TARGETS = [
    ("canby-meats-canby-or",                      "Ebner's Custom Meats",         "OR", "full",       None),
    ("his-provisions-butcher-shop-chardon-oh",    "His Provisions Butcher Shop",  "OH", "addr_only",  None),
    ("circuit-creek-farm-meat-processing-hebron-nh", "Circuit Creek Meat",        "NH", "fills_only", None),
    ("double-l-meat-processing-producer-va",      "Double L Meat Processing",     "WY", "fills_only", "WY"),
    ("sugarloaf-mountain-meats-processing-morehead-ky", "SugarLoaf Mountain Meats & Processing", "KY", "fills_only", None),
]


def main():
    env = load_env()
    key = env["VITE_GOOGLE_MAPS_API_KEY"]

    data = json.loads(DATA.read_text())
    about = json.loads(ABOUT.read_text())
    by_slug = {p["slug"]: p for p in data}

    applied = []
    missed = []
    for slug, search_name, search_state, mode, force_state in TARGETS:
        p = by_slug.get(slug)
        if not p:
            print(f"  ✗ {slug} — not found in processors.json")
            continue

        # Re-query Places with the corrected name + state
        query_addr = f"{search_name} {search_state}"
        pr = places_search(search_name, query_addr, search_state, key)
        if not pr.get("ok"):
            print(f"  ✗ {p['name']} — Places: {pr.get('error')}")
            missed.append(slug)
            continue

        place = pr["place"]
        places_name = (place.get("displayName") or {}).get("text", "")
        places_addr = place.get("formattedAddress", "")
        addr_parts = parse_places_addr(places_addr)
        loc_pt = place.get("location") or {}

        changes = {}

        if mode == "full":
            changes["name"] = places_name
        # else: keep existing name

        # Address/lat/lng — applied in all three modes
        if addr_parts.get("address"):
            changes["address"] = addr_parts["address"]
        if loc_pt.get("latitude"):
            changes["lat"] = loc_pt["latitude"]
            changes["lng"] = loc_pt["longitude"]
        if addr_parts.get("zip"):
            changes["zip"] = addr_parts["zip"]
        if addr_parts.get("city") and (force_state or addr_parts.get("state")):
            st = force_state or addr_parts["state"]
            changes["location"] = f"{addr_parts['city']}, {st}"

        # Phone/website only for full or fills_only
        if mode in ("full", "fills_only"):
            if place.get("nationalPhoneNumber"):
                changes["phone"] = place["nationalPhoneNumber"]
            if place.get("websiteUri"):
                changes["website"] = place["websiteUri"]

        # State correction
        if force_state:
            changes["state"] = force_state

        # Website scrape (only if we're taking a website)
        if changes.get("website") and mode in ("full", "fills_only"):
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
            "mode": mode,
            "final_name": p["name"],
            "places_name": places_name,
            "places_addr": places_addr,
            "fields": sorted(changes.keys()),
        })
        suffix = f" [name kept]" if mode != "full" else f" → {places_name}"
        print(f"  ✓ {slug}{suffix}")
        print(f"      {places_addr}")
        print(f"      fields: {', '.join(sorted(changes.keys()))}")
        time.sleep(0.3)

    DATA.write_text(json.dumps(data, indent=2) + "\n")
    ABOUT.write_text(json.dumps(about, indent=2) + "\n")
    print(f"\n─── Summary ───")
    print(f"  Applied: {len(applied)}/{len(TARGETS)}")
    if missed:
        print(f"  Places missed (need manual fill): {missed}")
    print(f"  Left untouched: The Butcher Barn (TN), Meriwether Farms (WY), Nexus Beef (TX)")


if __name__ == "__main__":
    main()
