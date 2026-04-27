"""
Merge enriched processors (from scripts/enrich_with_places.py) into the
landing directory's processors.json.

Consumes:
  data/enrichment/staged.json       # confident matches
  data/enrichment/needs_review.json # flagged for manual review
  data/enrichment/decisions.json    # Henry's rulings on flagged entries
                                    # (skip / accept_places / replace / add)

Produces:
  data/enrichment/merge_preview.json # dry-run output for review
  (src/data/processors.json         # only when --apply flag is passed)

Rules, in order:
  1. For each staged entry, build a new processors.json-schema record.
  2. For each needs_review entry, apply its decision:
       skip           → drop it
       accept_places  → use Places-returned name/address as canonical
       replace        → use the override payload from decisions.json
  3. Add every `add` entry from decisions.json (e.g. Weaver Meat Processing
     surfaced while resolving a different BD row).
  4. Default species to ["Beef"] when scrape found nothing.
  5. Generate slug: {name-kebab}-{city-kebab}-{state-lowercase}.
  6. Dedupe against existing directory by slug, then by name+state.

Usage:
  python3 scripts/merge_enriched.py             # dry-run → merge_preview.json
  python3 scripts/merge_enriched.py --apply     # actually write processors.json
"""
import argparse
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
EXISTING = REPO / "src/data/processors.json"
ABOUT_CONTENT = REPO / "src/data/processorAboutContent.json"
ENRICH_DIR = REPO / "data/enrichment"
STAGED = ENRICH_DIR / "staged.json"
NEEDS_REVIEW = ENRICH_DIR / "needs_review.json"
DECISIONS = ENRICH_DIR / "decisions.json"
PREVIEW = ENRICH_DIR / "merge_preview.json"


def kebab(s: str) -> str:
    s = (s or "").lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"^-+|-+$", "", s)


def make_slug(name: str, location: str, state: str) -> str:
    # location is "City, ST" or just "ST"
    city = (location or "").split(",")[0].strip()
    parts = [kebab(name)]
    if city and city.upper() != (state or "").upper():
        parts.append(kebab(city))
    parts.append((state or "").lower())
    return "-".join(p for p in parts if p)


def parse_address_parts(formatted_address: str) -> dict:
    """Best-effort parse of 'Street, City, ST ZIP' format."""
    if not formatted_address:
        return {}
    # Split on commas, handle trailing USA
    parts = [p.strip() for p in formatted_address.split(",")]
    if parts and parts[-1].upper() in ("USA", "UNITED STATES"):
        parts = parts[:-1]
    out = {}
    if len(parts) >= 3:
        out["address"] = parts[0]
        out["city"] = parts[1]
        last = parts[-1]
        m = re.match(r"([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?", last)
        if m:
            out["state"] = m.group(1)
            if m.group(2):
                out["zip"] = m.group(2)
    elif len(parts) == 2:
        out["address"] = parts[0]
        last = parts[-1]
        m = re.match(r"([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?", last)
        if m:
            out["state"] = m.group(1)
            if m.group(2):
                out["zip"] = m.group(2)
    return out


def build_record(entry: dict, *, forced_name: str = None, override: dict = None):
    """Build a processors.json-schema record from an enrichment entry.
    If `forced_name` is set (for accept_places), use that as the canonical name.
    If `override` is set (for replace), it takes top priority for its fields.
    """
    override = override or {}
    bd_name = entry.get("name", "") or ""
    bd_state = entry.get("state") or ""
    bd_address = entry.get("address") or ""

    places = (entry.get("places") or {}).get("place") or {}
    places_name = (places.get("displayName") or {}).get("text")
    places_addr = places.get("formattedAddress")
    places_loc = places.get("location") or {}
    places_site = places.get("websiteUri")
    places_phone = places.get("nationalPhoneNumber")

    scrape = entry.get("scrape") or {}

    # Name: override > forced_name > Places > BD
    name = override.get("name") or forced_name or places_name or bd_name
    # Clean up trailing " LLC"/"Inc"/" Co." normalization? No — trust the source.

    # Address parsing
    state = override.get("state") or bd_state
    address_parts = parse_address_parts(override.get("address") or places_addr or bd_address)
    if override.get("address"):
        # Re-parse the override
        address_parts = parse_address_parts(override["address"])
    # Prefer override state if set
    if override.get("state"):
        state = override["state"]
    elif address_parts.get("state"):
        state = address_parts["state"]

    city = address_parts.get("city") or ""
    zip_code = address_parts.get("zip")
    street = address_parts.get("address") or override.get("address") or bd_address

    location = f"{city}, {state}" if city else state

    # Coords: override > Places
    lat = override.get("lat") or places_loc.get("latitude")
    lng = override.get("lng") or places_loc.get("longitude")

    # Contact
    website = override.get("website") or places_site or entry.get("website_from_file")
    phone = override.get("phone") or places_phone or (scrape.get("phone") if scrape.get("ok") else None)

    # Logo + about from scrape (when scrape was OK)
    logo = scrape.get("logo") if scrape.get("ok") else None
    about = scrape.get("about") if scrape.get("ok") else None

    # Species: scrape keywords → else default ["Beef"]
    species = (scrape.get("species") if scrape.get("ok") else None) or ["Beef"]

    slug = make_slug(name, location, state)

    record = {
        "name": name,
        "location": location,
        "state": state,
        "species": species,
        "logo": logo,
        "slug": slug,
        "status": "prospect",
        "address": street or None,
        "zip": zip_code,
        "phone": phone,
        "website": website or None,
        "description": None,  # about lives separately in processorAboutContent.json
    }
    if lat is not None and lng is not None:
        record["lat"] = lat
        record["lng"] = lng
    # Strip None values to match existing JSON style (selective)
    return {k: v for k, v in record.items() if v is not None and v != ""}, about


def load_all():
    existing = json.loads(EXISTING.read_text())
    staged = json.loads(STAGED.read_text()).get("results", []) if STAGED.exists() else []
    flagged = json.loads(NEEDS_REVIEW.read_text()).get("results", []) if NEEDS_REVIEW.exists() else []
    decisions = json.loads(DECISIONS.read_text()) if DECISIONS.exists() else {}
    about_content = json.loads(ABOUT_CONTENT.read_text()) if ABOUT_CONTENT.exists() else {}
    return existing, staged, flagged, decisions, about_content


def decision_key(d: dict) -> tuple:
    return ((d.get("name") or "").lower().strip(), (d.get("state") or "").upper() if d.get("state") else None)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Actually write processors.json. Default is dry-run.")
    args = ap.parse_args()

    existing, staged, flagged, decisions, about_content = load_all()

    existing_slugs = {p["slug"] for p in existing}
    existing_name_state = {
        (re.sub(r"[^a-z0-9]", "", (p.get("name") or "").lower()), p.get("state"))
        for p in existing
    }

    skip_keys = {decision_key(d) for d in decisions.get("skip", [])}
    accept_keys = {decision_key(d) for d in decisions.get("accept_places", [])}
    replace_map = {decision_key(d): d.get("override", {}) for d in decisions.get("replace", [])}

    to_add_records = []
    to_add_about = {}
    skipped = []
    collisions = []

    def entry_key(entry):
        return ((entry.get("name") or "").lower().strip(), (entry.get("state") or "").upper() if entry.get("state") else None)

    # Staged entries (already confident) — build records directly.
    for entry in staged:
        rec, about = build_record(entry)
        if rec["slug"] in existing_slugs:
            collisions.append({"slug": rec["slug"], "reason": "slug-exists", "from": entry["name"]})
            continue
        nk = (re.sub(r"[^a-z0-9]", "", rec["name"].lower()), rec["state"])
        if nk in existing_name_state:
            collisions.append({"slug": rec["slug"], "reason": "name+state-exists", "from": entry["name"]})
            continue
        existing_slugs.add(rec["slug"])
        existing_name_state.add(nk)
        to_add_records.append(rec)
        if about:
            to_add_about[rec["slug"]] = {"about": about}

    # Flagged entries — apply decisions
    for entry in flagged:
        key = entry_key(entry)
        if key in skip_keys:
            skipped.append({"name": entry["name"], "state": entry.get("state"), "reason": "skip-per-decision"})
            continue
        if key in replace_map:
            rec, about = build_record(entry, override=replace_map[key])
        elif key in accept_keys:
            places_name = ((entry.get("places") or {}).get("place") or {}).get("displayName", {}).get("text")
            rec, about = build_record(entry, forced_name=places_name)
        else:
            # No decision recorded — leave in "unresolved" bucket
            skipped.append({"name": entry["name"], "state": entry.get("state"), "reason": "no-decision (remain in needs_review.json)"})
            continue
        if rec["slug"] in existing_slugs:
            collisions.append({"slug": rec["slug"], "reason": "slug-exists", "from": entry["name"]})
            continue
        nk = (re.sub(r"[^a-z0-9]", "", rec["name"].lower()), rec["state"])
        if nk in existing_name_state:
            collisions.append({"slug": rec["slug"], "reason": "name+state-exists", "from": entry["name"]})
            continue
        existing_slugs.add(rec["slug"])
        existing_name_state.add(nk)
        to_add_records.append(rec)
        if about:
            to_add_about[rec["slug"]] = {"about": about}

    # Manual `add` entries from decisions.json
    for add in decisions.get("add", []):
        # These need their own Places lookup; otherwise we write a stub and flag.
        # For now, we only materialize adds that the user has fully specified
        # via an "override" block or that carry enough inline data.
        if not add.get("override"):
            # Weaver Meat Processing case: we know it exists at the American Butchery AL address,
            # but its own Places lookup hasn't been run. Flag it to be picked up in a follow-up run.
            skipped.append({
                "name": add["name"],
                "state": add.get("state"),
                "reason": "manual-add-needs-enrichment-run",
            })
            continue
        pseudo_entry = {"name": add["name"], "state": add.get("state"), "address": add.get("override", {}).get("address")}
        rec, about = build_record(pseudo_entry, override=add["override"])
        if rec["slug"] in existing_slugs:
            collisions.append({"slug": rec["slug"], "reason": "slug-exists", "from": add["name"]})
            continue
        existing_slugs.add(rec["slug"])
        existing_name_state.add((re.sub(r"[^a-z0-9]", "", rec["name"].lower()), rec["state"]))
        to_add_records.append(rec)
        if about:
            to_add_about[rec["slug"]] = {"about": about}

    # Write preview
    preview = {
        "summary": {
            "new_records": len(to_add_records),
            "skipped": len(skipped),
            "collisions": len(collisions),
            "existing_total": len(existing),
            "new_total": len(existing) + len(to_add_records),
        },
        "new_records": to_add_records,
        "skipped": skipped,
        "collisions": collisions,
        "new_about_entries": to_add_about,
    }
    PREVIEW.write_text(json.dumps(preview, indent=2))
    print(f"Wrote {PREVIEW.relative_to(REPO)}")
    print()
    print(f"Summary:")
    print(f"  New records to add:   {len(to_add_records)}")
    print(f"  Skipped:              {len(skipped)}")
    print(f"  Collisions w/ existing: {len(collisions)}")
    print(f"  Existing directory:   {len(existing)}")
    print(f"  After merge:          {len(existing) + len(to_add_records)}")
    if collisions:
        print("\nCollisions (will NOT be added):")
        for c in collisions[:10]:
            print(f"  - {c['from']}  (slug: {c['slug']}, reason: {c['reason']})")

    if args.apply:
        merged = existing + to_add_records
        EXISTING.write_text(json.dumps(merged, indent=2) + "\n")
        print(f"\n✓ Applied: {EXISTING.relative_to(REPO)} now has {len(merged)} records.")

        # Merge about content
        if to_add_about:
            about_existing = json.loads(ABOUT_CONTENT.read_text()) if ABOUT_CONTENT.exists() else {}
            about_existing.update(to_add_about)
            ABOUT_CONTENT.write_text(json.dumps(about_existing, indent=2) + "\n")
            print(f"✓ Applied: {ABOUT_CONTENT.relative_to(REPO)} now has {len(about_existing)} entries.")
    else:
        print("\nDry-run only. Re-run with --apply to write processors.json.")


if __name__ == "__main__":
    main()
