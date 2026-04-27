"""
Run Places API over every PRE-EXISTING PROSPECT in processors.json to catch
state mismatches, rebrands, closures, and fill data gaps without clobbering
the good data already in the directory.

Excludes customers (those use partners.farmshare.co as source of truth, handled
separately).

Rules:
  - Missing fields (phone, website, lat/lng, zip, address) get filled from Places.
  - Differences in STATE or NAME are *flagged* for manual review — never silently
    overwritten.
  - Websites that the original scrape missed get scraped for logo/about/species.
  - Places no-match → flagged as possibly-closed.

Outputs:
  data/enrichment/legacy_audit.json   — full audit trail: changes, flags, no-matches
  (writes to processors.json / processorAboutContent.json only with --apply)

Usage:
  python3 scripts/audit_legacy_prospects.py              # dry-run
  python3 scripts/audit_legacy_prospects.py --limit 50   # pilot
  python3 scripts/audit_legacy_prospects.py --apply      # commit fills only
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
OUT = REPO / "data/enrichment/legacy_audit.json"


def parse_places_addr(formatted_addr: str) -> dict:
    import re as _re
    out = {}
    if not formatted_addr: return out
    parts = [p.strip() for p in formatted_addr.split(",")]
    if parts and parts[-1].upper() in ("USA","UNITED STATES"): parts = parts[:-1]
    if len(parts) >= 3:
        out["address"] = parts[0]
        out["city"] = parts[-3]
        m = _re.match(r"([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?", parts[-2])
        if m:
            out["state"] = m.group(1)
            if m.group(2): out["zip"] = m.group(2)
    return out


def is_pre_existing_prospect(p, bd_source_slugs):
    """Prospect that isn't from the BD batch (identified by slug not matching
    the BD-batch-generated pattern)."""
    return p.get("status") == "prospect" and p["slug"] not in bd_source_slugs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    env = load_env()
    KEY = env["VITE_GOOGLE_MAPS_API_KEY"]

    data = json.loads(DATA.read_text())
    about = json.loads(ABOUT.read_text())

    # Use the pre-BD slug snapshot (captured from git HEAD before we applied the
    # BD merge) to limit the audit to genuinely pre-existing prospects.
    pre_bd_path = REPO / "data/enrichment/pre_bd_slugs.json"
    if not pre_bd_path.exists():
        print("Missing data/enrichment/pre_bd_slugs.json — capture it first:", file=sys.stderr)
        print("  git show HEAD:src/data/processors.json | python3 -c '...'", file=sys.stderr)
        sys.exit(1)
    pre_bd_slugs = set(json.loads(pre_bd_path.read_text()))
    prospects = [p for p in data
                 if p.get("status") == "prospect" and p["slug"] in pre_bd_slugs]
    print(f"(Filtered to pre-BD prospects: {len(prospects)} of {sum(1 for p in data if p.get('status')=='prospect')} total prospects)")
    if args.limit:
        prospects = prospects[:args.limit]
    print(f"Auditing {len(prospects)} prospects via Places API\n")

    audit = {
        "updated":   [],  # fills applied
        "flagged":   [],  # state or name mismatch — needs manual review
        "no_match":  [],  # Places returned no match — possibly closed
        "no_change": 0,
    }
    about_adds = {}
    updated_count = 0

    for i, p in enumerate(prospects, 1):
        name = p["name"]
        state = p.get("state","")
        addr = p.get("address") or p.get("location") or state
        pr = places_search(name, addr, state, KEY)

        if not pr.get("ok"):
            audit["no_match"].append({
                "slug": p["slug"], "name": name, "state": state,
                "reason": pr.get("error","no-match"),
            })
            if i % 25 == 0 or i == len(prospects):
                print(f"[{i}/{len(prospects)}] {name}  ✗ {pr.get('error')}")
            continue

        place = pr["place"]
        places_name = (place.get("displayName") or {}).get("text", "")
        places_addr = place.get("formattedAddress","")
        conf = name_confidence(name, places_name)
        sm = state_match(state, places_addr)
        addr_parts = parse_places_addr(places_addr)

        changes = {}
        flags = []

        # Fill missing fields (never overwrite good data)
        if not p.get("phone") and place.get("nationalPhoneNumber"):
            changes["phone"] = place["nationalPhoneNumber"]
        if not p.get("website") and place.get("websiteUri"):
            changes["website"] = place["websiteUri"]
        loc_pt = place.get("location") or {}
        if (not p.get("lat") or not p.get("lng")) and loc_pt.get("latitude"):
            changes["lat"] = loc_pt["latitude"]
            changes["lng"] = loc_pt["longitude"]
        if not p.get("zip") and addr_parts.get("zip"):
            changes["zip"] = addr_parts["zip"]
        if not p.get("address") and addr_parts.get("address"):
            changes["address"] = addr_parts["address"]

        # Detect state mismatch — flag, don't fix
        if conf >= CONFIDENCE_THRESHOLD and not sm and addr_parts.get("state"):
            flags.append({
                "type": "state-mismatch",
                "current_state": state,
                "places_state": addr_parts["state"],
                "places_addr": places_addr,
            })

        # Detect name drift — flag, don't fix
        if conf >= CONFIDENCE_THRESHOLD and conf < 0.8 and places_name and places_name != name:
            flags.append({
                "type": "name-drift",
                "current_name": name,
                "places_name": places_name,
                "confidence": round(conf, 2),
            })

        # Low confidence Places match — don't touch the record at all
        if conf < CONFIDENCE_THRESHOLD:
            flags.append({
                "type": "low-confidence-match",
                "current_name": name,
                "places_name": places_name,
                "confidence": round(conf, 2),
                "places_addr": places_addr,
            })
            # Don't apply any changes when Places isn't sure
            changes = {}

        # If we have a NEW website from fill, scrape for logo/about
        if "website" in changes:
            s = scrape_site(changes["website"])
            if s.get("ok"):
                if s.get("logo") and not p.get("logo"):
                    changes["logo"] = s["logo"]
                if s.get("about") and p["slug"] not in about:
                    about_adds[p["slug"]] = {"about": s["about"]}
                if s.get("species"):
                    merged = sorted(set(p.get("species") or []) | set(s["species"]))
                    if merged != (p.get("species") or []):
                        changes["species"] = merged

        if changes or flags:
            entry = {"slug": p["slug"], "name": name, "state": state,
                     "places_name": places_name, "changes": changes, "flags": flags}
            if changes:
                audit["updated"].append(entry)
                updated_count += 1
            if flags:
                audit["flagged"].append(entry)
            # Apply changes in-memory (only if we're going to --apply later)
            for k, v in changes.items():
                p[k] = v
        else:
            audit["no_change"] += 1

        if i % 25 == 0 or i == len(prospects):
            print(f"[{i}/{len(prospects)}] updates={len(audit['updated'])} flagged={len(audit['flagged'])} no-match={len(audit['no_match'])}")
        time.sleep(0.3)

    OUT.write_text(json.dumps(audit, indent=2) + "\n")
    print(f"\nWrote {OUT.relative_to(REPO)}")
    print(f"\n─── Audit summary ───")
    print(f"  Updated (fills only): {len(audit['updated'])}")
    print(f"  Flagged (for review): {len(audit['flagged'])}")
    print(f"  Places no-match:      {len(audit['no_match'])}")
    print(f"  No change:            {audit['no_change']}")
    # Breakdown of flag types
    from collections import Counter
    flag_types = Counter(f["type"] for e in audit["flagged"] for f in e["flags"])
    if flag_types:
        print(f"  Flag types: {dict(flag_types)}")

    if args.apply:
        # Merge about additions into about file
        for k, v in about_adds.items(): about[k] = v
        DATA.write_text(json.dumps(data, indent=2) + "\n")
        ABOUT.write_text(json.dumps(about, indent=2) + "\n")
        print(f"\n✓ Applied: processors.json, processorAboutContent.json")
        print(f"  + {updated_count} records got fills. About entries: +{len(about_adds)} → {len(about)} total")
    else:
        print(f"\nDry-run. Re-run with --apply to write fills (flags + no-matches are NEVER auto-applied).")


if __name__ == "__main__":
    main()
