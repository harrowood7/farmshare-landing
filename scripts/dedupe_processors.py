"""
Remove 9 duplicate pairs from processors.json. For each pair, keep the slug
that follows the canonical BD pattern and merge in any cleaner fields from
the legacy record (which had internal-notes / wrong state codes baked into
the slug but sometimes had cleaner addresses/websites).

Pairs (keep_slug ← drop_slug):
  farmerstown-meats-sugarcreek-oh       ← farmertown-meats-oh
  hurdwell-arlington-oh                 ← hurdwell-market-ne
  lakes-community-coop-meat-market-perham-mn ← perham-meat-market-perham-mn
  montshire-packing-cambridge-nh        ← montshire-farms-vt        [merge addr/location/website]
  r-and-d-meats-jennings-ok             ← r-and-d-meats-sd
  rising-spring-meat-company-spring-mills-pa ← rising-spring-meat-co-pa
  salchert-meats-st-cloud-wi            ← salchert-market-inc-pilot-not-signed-wi
  showalter-s-country-meats-llc-windsor-ky ← showalters-new-deal
  this-old-farm-inc-colfax-in           ← this-old-farm-meats-and-processing-mo
"""
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "src/data/processors.json"
ABOUT = REPO / "src/data/processorAboutContent.json"

# (keep_slug, drop_slug, field_overrides)
#   field_overrides: pick these fields from the dropped record when the kept
#                    one has worse data. Empty dict = straight drop.
PAIRS = [
    ("farmerstown-meats-sugarcreek-oh",            "farmertown-meats-oh",                             {}),
    ("hurdwell-arlington-oh",                       "hurdwell-market-ne",                              {}),
    ("lakes-community-coop-meat-market-perham-mn", "perham-meat-market-perham-mn",                    {}),
    # Montshire: BD record has clean conventional slug but garbage address and
    # wrong location "Cambridge, NH". Legacy had correct "North Haverhill, NH"
    # and "500 Benton Rd", plus newenglandmeat.com (boydenbeef.com looks wrong).
    ("montshire-packing-cambridge-nh",              "montshire-farms-vt",
        {"address": "500 Benton Rd", "location": "North Haverhill, NH", "website": "http://newenglandmeat.com/"}),
    ("r-and-d-meats-jennings-ok",                   "r-and-d-meats-sd",                                {}),
    ("rising-spring-meat-company-spring-mills-pa", "rising-spring-meat-co-pa",                        {}),
    ("salchert-meats-st-cloud-wi",                  "salchert-market-inc-pilot-not-signed-wi",         {}),
    ("showalter-s-country-meats-llc-windsor-ky",   "showalters-new-deal",                             {}),
    ("this-old-farm-inc-colfax-in",                "this-old-farm-meats-and-processing-mo",           {}),
]


def main():
    data = json.loads(DATA.read_text())
    about = json.loads(ABOUT.read_text())
    by_slug = {p["slug"]: p for p in data}

    drops = set()
    for keep_slug, drop_slug, overrides in PAIRS:
        keep = by_slug.get(keep_slug)
        drop = by_slug.get(drop_slug)
        if not keep:
            print(f"  ! keep slug missing: {keep_slug}")
            continue
        if not drop:
            print(f"  ! drop slug missing: {drop_slug}")
            continue

        # Apply explicit overrides from drop → keep
        for k, v in overrides.items():
            keep[k] = v

        # For any field that's missing on keep but present on drop, backfill
        for k, v in drop.items():
            if k in ("slug",):
                continue
            if keep.get(k) in (None, "", []) and v not in (None, ""):
                keep[k] = v

        # Species: union
        s1 = set(keep.get("species") or [])
        s2 = set(drop.get("species") or [])
        if s1 | s2:
            keep["species"] = sorted(s1 | s2)

        # If drop has an about entry and keep doesn't, migrate
        if drop_slug in about and keep_slug not in about:
            about[keep_slug] = about[drop_slug]
        if drop_slug in about:
            del about[drop_slug]

        drops.add(drop_slug)
        print(f"  ✓ kept {keep_slug}, dropped {drop_slug}" + (f"  (overrides: {list(overrides)})" if overrides else ""))

    new_data = [p for p in data if p["slug"] not in drops]
    DATA.write_text(json.dumps(new_data, indent=2) + "\n")
    ABOUT.write_text(json.dumps(about, indent=2) + "\n")
    print(f"\n{len(data)} → {len(new_data)} records ({len(drops)} removed)")


if __name__ == "__main__":
    main()
