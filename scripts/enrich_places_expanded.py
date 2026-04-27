"""
Re-query Places API for all records with an expanded field mask, pulling
data we haven't been storing. Keeps the existing fields intact — only adds
new fields to each record.

New fields added to processors.json:
  - googleMapsUri       : link to business's Google Maps page
  - rating              : Google star rating (0-5)
  - userRatingCount     : number of reviews
  - hours               : array of human-readable opening hours (Mon-Sun)
  - editorialSummary    : Google's short description (when present)
  - businessStatus      : OPERATIONAL | CLOSED_TEMPORARILY | CLOSED_PERMANENTLY
  - placeTypes          : array of Places type strings (e.g. butcher_shop)

Usage:
  python3 scripts/enrich_places_expanded.py              # dry-run (writes staging)
  python3 scripts/enrich_places_expanded.py --apply      # writes processors.json
  python3 scripts/enrich_places_expanded.py --limit 10   # pilot
  python3 scripts/enrich_places_expanded.py --skip-existing  # skip records that already have rating
"""
import argparse, json, sys, time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

sys.path.insert(0, str(Path(__file__).parent))
from enrich_with_places import load_env, name_confidence

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "src/data/processors.json"
STAGING = REPO / "data/enrichment/expanded_places.json"

PLACES_TEXT_SEARCH = "https://places.googleapis.com/v1/places:searchText"

EXPANDED_FIELDS = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.googleMapsUri",
    "places.rating",
    "places.userRatingCount",
    "places.regularOpeningHours",
    "places.editorialSummary",
    "places.businessStatus",
    "places.types",
])


def query(name, address, state, key):
    q = f"{name} {address}".strip()
    payload = {"textQuery": q, "regionCode": "US", "maxResultCount": 3}
    req = Request(
        PLACES_TEXT_SEARCH,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": EXPANDED_FIELDS,
        },
        data=json.dumps(payload).encode(),
    )
    try:
        resp = urlopen(req, timeout=15)
        data = json.loads(resp.read())
    except HTTPError as e:
        return {"ok": False, "error": f"HTTP {e.code}: {e.read().decode('utf-8','ignore')[:120]}"}
    except URLError as e:
        return {"ok": False, "error": f"URL error: {e.reason}"}
    places = data.get("places") or []
    if not places:
        return {"ok": False, "error": "no-match"}
    return {"ok": True, "place": places[0]}


def extract_fields(place):
    """Pull only the fields we want to persist on the record."""
    out = {}
    if place.get("googleMapsUri"):
        out["googleMapsUri"] = place["googleMapsUri"]
    if place.get("rating") is not None:
        out["rating"] = place["rating"]
    if place.get("userRatingCount") is not None:
        out["userRatingCount"] = place["userRatingCount"]
    hours = (place.get("regularOpeningHours") or {}).get("weekdayDescriptions")
    if hours:
        out["hours"] = hours
    es = place.get("editorialSummary") or {}
    if es.get("text"):
        out["editorialSummary"] = es["text"]
    if place.get("businessStatus"):
        out["businessStatus"] = place["businessStatus"]
    if place.get("types"):
        out["placeTypes"] = place["types"]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--skip-existing", action="store_true",
                    help="Skip records that already have 'googleMapsUri' set")
    args = ap.parse_args()

    env = load_env()
    key = env["VITE_GOOGLE_MAPS_API_KEY"]

    data = json.loads(DATA.read_text())
    targets = [r for r in data if not (args.skip_existing and r.get("googleMapsUri"))]
    if args.limit:
        targets = targets[:args.limit]
    print(f"Pulling expanded Places data for {len(targets)} records\n")

    results = []
    hits = {"rating": 0, "hours": 0, "editorialSummary": 0, "googleMapsUri": 0, "all_success": 0, "no_match": 0}
    for i, r in enumerate(targets, 1):
        name = r["name"]
        addr = r.get("address") or r.get("location") or r.get("state", "")
        pr = query(name, addr, r.get("state", ""), key)
        entry = {"slug": r["slug"], "name": name, "state": r.get("state")}
        if not pr.get("ok"):
            entry["error"] = pr.get("error")
            hits["no_match"] += 1
        else:
            place = pr["place"]
            places_name = (place.get("displayName") or {}).get("text", "")
            conf = name_confidence(name, places_name)
            fields = extract_fields(place)
            entry["places_name"] = places_name
            entry["confidence"] = round(conf, 2)
            entry["fields"] = fields
            if conf >= 0.4:  # only apply if reasonable match
                for k in ("rating", "hours", "editorialSummary", "googleMapsUri"):
                    if k in fields:
                        hits[k] += 1
                hits["all_success"] += 1
        results.append(entry)
        if i % 50 == 0 or i == len(targets):
            print(f"  [{i}/{len(targets)}] success={hits['all_success']} rating={hits['rating']} hours={hits['hours']} summary={hits['editorialSummary']}")
        time.sleep(0.15)

    STAGING.write_text(json.dumps(results, indent=2) + "\n")
    print(f"\nStaged to {STAGING.relative_to(REPO)}")
    print(f"\n─── Summary ───")
    print(f"  Success:           {hits['all_success']}/{len(targets)}")
    print(f"  Have rating:       {hits['rating']}")
    print(f"  Have hours:        {hits['hours']}")
    print(f"  Have summary:      {hits['editorialSummary']}")
    print(f"  Have maps URL:     {hits['googleMapsUri']}")
    print(f"  No match / error:  {hits['no_match']}")

    if args.apply:
        by_slug = {e["slug"]: e for e in results}
        applied = 0
        for r in data:
            e = by_slug.get(r["slug"])
            if not e or not e.get("fields") or e.get("confidence", 0) < 0.4:
                continue
            for k, v in e["fields"].items():
                r[k] = v
            applied += 1
        DATA.write_text(json.dumps(data, indent=2) + "\n")
        print(f"\n✓ Applied expanded fields to {applied} records in processors.json")


if __name__ == "__main__":
    main()
