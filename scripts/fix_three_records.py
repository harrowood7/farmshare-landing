"""
Correct three records where the Places re-query produced wrong matches or
no-match.

  - His Provisions Butcher Shop (OH): patch address to 12126 Clark Rd,
    Chardon, OH 44024 (same location as New Creation Farm per Henry).
    Re-query 'New Creation Farm Chardon OH' to get correct lat/lng.
  - SugarLoaf Mountain Meats (KY): revert + apply screenshot data
    (2345 Sugarloaf Mountain Rd, Morehead KY 40351, (606) 776-5766).
    Try precise Places query to get lat/lng.
  - Circuit Creek Meat (NH): apply screenshot data (phone (603) 944-2952,
    website circuitcreekmeat.com), clean <br /> from address.
"""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from enrich_with_places import places_search, load_env

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "src/data/processors.json"


def main():
    env = load_env()
    key = env["VITE_GOOGLE_MAPS_API_KEY"]

    data = json.loads(DATA.read_text())
    by_slug = {p["slug"]: p for p in data}

    # === His Provisions — same physical site as New Creation Farm ===
    p = by_slug["his-provisions-butcher-shop-chardon-oh"]
    p["address"] = "12126 Clark Rd"
    p["location"] = "Chardon, OH"
    p["zip"] = "44024"
    p["state"] = "OH"
    # clear bad phone/website picked up from wrong Millersburg match
    p["phone"] = None
    p["website"] = None
    # Re-query 'New Creation Farm' specifically for lat/lng
    pr = places_search("New Creation Farm", "12126 Clark Rd Chardon OH", "OH", key)
    if pr.get("ok"):
        loc_pt = (pr["place"].get("location") or {})
        if loc_pt.get("latitude"):
            p["lat"] = loc_pt["latitude"]
            p["lng"] = loc_pt["longitude"]
            print(f"  ✓ His Provisions: lat/lng from New Creation Farm = ({p['lat']:.4f}, {p['lng']:.4f})")
    else:
        print(f"  ! His Provisions: Places lookup failed — lat/lng NOT updated ({pr.get('error')})")
    # strip None-valued keys to keep the record tidy
    for k in ("phone", "website"):
        if p.get(k) is None:
            p.pop(k, None)
    time.sleep(0.3)

    # === SugarLoaf Mountain Meats — use Henry's screenshot data ===
    p = by_slug["sugarloaf-mountain-meats-processing-morehead-ky"]
    p["name"] = "SugarLoaf Mountain Meats & Processing"
    p["address"] = "2345 Sugarloaf Mountain Rd"
    p["location"] = "Morehead, KY"
    p["zip"] = "40351"
    p["state"] = "KY"
    p["phone"] = "(606) 776-5766"
    # Remove the wrong mtnmeadowmeats website/logo pulled from wrong match
    p.pop("website", None)
    p.pop("logo", None)
    # Try precise query for lat/lng
    pr = places_search("SugarLoaf Mountain Meats Processing", "2345 Sugarloaf Mountain Rd Morehead KY 40351", "KY", key)
    if pr.get("ok"):
        loc_pt = (pr["place"].get("location") or {})
        if loc_pt.get("latitude"):
            p["lat"] = loc_pt["latitude"]
            p["lng"] = loc_pt["longitude"]
            print(f"  ✓ SugarLoaf: lat/lng = ({p['lat']:.4f}, {p['lng']:.4f})")
        # If Places does find it this time, also grab website
        if pr["place"].get("websiteUri"):
            p["website"] = pr["place"]["websiteUri"]
    else:
        print(f"  ! SugarLoaf: Places lookup failed — lat/lng NOT updated ({pr.get('error')})")
    time.sleep(0.3)

    # === Circuit Creek Meat ===
    p = by_slug["circuit-creek-farm-meat-processing-hebron-nh"]
    # Clean the <br /> garbage in address
    if "<br" in (p.get("address") or ""):
        p["address"] = p["address"].split("<br")[0].strip()
    p["phone"] = "(603) 944-2952"
    p["website"] = "https://circuitcreekmeat.com"
    print(f"  ✓ Circuit Creek: address='{p['address']}', phone set, website set")

    DATA.write_text(json.dumps(data, indent=2) + "\n")
    print(f"\nWrote {DATA.relative_to(REPO)}")


if __name__ == "__main__":
    main()
