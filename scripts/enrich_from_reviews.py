"""
Pull Places reviews for each record with a matched Place, then:
  1. Scan all review text for species keywords → add to `species` array
  2. Summarize positive reviews (≥4 stars) into a description where we lack
     rich about content. NEVER uses negative review text — only extracts
     common positive themes via keyword counting.

Usage:
  python3 scripts/enrich_from_reviews.py --limit 20   # pilot
  python3 scripts/enrich_from_reviews.py --apply      # write processors.json

Reviews are requested via Places API (New) with field mask places.reviews,
which includes the review text, rating, and author display name. No review
text is copied verbatim into descriptions — only aggregated keyword hits.
"""
import argparse, json, re, sys, time
from collections import Counter
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

sys.path.insert(0, str(Path(__file__).parent))
from enrich_with_places import load_env, name_confidence, SPECIES_KEYWORDS

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "src/data/processors.json"
ABOUT = REPO / "src/data/processorAboutContent.json"
STAGING = REPO / "data/enrichment/reviews_pull.json"

PLACES_TEXT_SEARCH = "https://places.googleapis.com/v1/places:searchText"
REVIEWS_FIELDS = ",".join([
    "places.id",
    "places.displayName",
    "places.rating",
    "places.userRatingCount",
    "places.reviews",
])

# Positive service/quality phrases mentioned in reviews. Case-insensitive
# substring match. Only pulled when the review's rating is ≥ 4 stars.
SERVICE_KEYWORDS = {
    "vacuum packing":      [r"vacuum\s*pack", r"vacuum\s*seal"],
    "custom sausage":      [r"\bsausages?\b", r"\bbrats?\b", r"\bbratwurst\b"],
    "smoked meats":        [r"\bsmoked?\b", r"\bsmokehouse\b", r"\bsmoking\b"],
    "jerky":               [r"\bjerky\b"],
    "bacon":               [r"\bbacon\b"],
    "wild game processing":[r"wild\s*game", r"\bgame\s*processing", r"\bdeer\s*processing"],
    "taxidermy":           [r"\btaxidermy\b"],
    "custom cuts":         [r"custom\s*cuts?", r"cut\s*sheet", r"custom\s*processing"],
    "summer sausage":      [r"summer\s*sausage"],
    "snack sticks":        [r"snack\s*sticks?"],
    "hunting season slots":[r"hunting\s*season", r"take\s*my\s*deer"],
    "on-farm slaughter":   [r"\bmobile\s*slaughter", r"on[-\s]*farm", r"\bharvest\s+at\b"],
}

QUALITY_KEYWORDS = {
    "friendly staff":            [r"\bfriendly\b", r"\bpolite\b", r"\bkind\b", r"\bnice\s+people\b"],
    "quick turnaround":          [r"\bquick\b", r"\bfast\s+turn", r"\bin\s+and\s+out\b", r"\btimely\b"],
    "knowledgeable staff":       [r"\bknowledgeable\b", r"\bexperts?\b", r"\bknow\s+their\s+stuff\b"],
    "professional service":      [r"\bprofessional\b", r"\bwell[-\s]run\b"],
    "clean facility":            [r"\bclean\b(?!\s+up)"],
    "fair pricing":              [r"\breasonable\s+price", r"\bfair\s+price", r"\baffordable\b", r"\bgreat\s+value\b"],
    "family-owned operation":    [r"family\s*owned", r"family\s*run", r"family\s*operated"],
}


def query_reviews(name, address, state, key):
    q = f"{name} {address}".strip()
    payload = {"textQuery": q, "regionCode": "US", "maxResultCount": 3}
    req = Request(
        PLACES_TEXT_SEARCH,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": REVIEWS_FIELDS,
        },
        data=json.dumps(payload).encode(),
    )
    try:
        resp = urlopen(req, timeout=20)
        data = json.loads(resp.read())
    except HTTPError as e:
        return {"ok": False, "error": f"HTTP {e.code}"}
    except URLError as e:
        return {"ok": False, "error": f"URL error: {e.reason}"}
    places = data.get("places") or []
    if not places:
        return {"ok": False, "error": "no-match"}
    return {"ok": True, "place": places[0]}


def species_from_reviews(reviews):
    """Scan all review text for species mentions. Returns sorted list of species names."""
    full_text = " ".join((r.get("text") or {}).get("text", "") for r in reviews)
    if not full_text:
        return []
    found = set()
    for sp, patterns in SPECIES_KEYWORDS.items():
        for p in patterns:
            if re.search(p, full_text, re.I):
                found.add(sp)
                break
    return sorted(found)


def summarize_positive(reviews, min_rating=4):
    """Extract service + quality themes mentioned in ≥min_rating reviews.
    Returns {"services": [...], "qualities": [...], "positive_count": int}."""
    positive = [r for r in reviews if (r.get("rating") or 0) >= min_rating]
    text = " ".join((r.get("text") or {}).get("text", "") for r in positive)
    if not text:
        return {"services": [], "qualities": [], "positive_count": len(positive)}

    service_hits = Counter()
    for label, patterns in SERVICE_KEYWORDS.items():
        for p in patterns:
            if re.search(p, text, re.I):
                service_hits[label] += 1
                break
    quality_hits = Counter()
    for label, patterns in QUALITY_KEYWORDS.items():
        for p in patterns:
            if re.search(p, text, re.I):
                quality_hits[label] += 1
                break
    return {
        "services": [s for s, _ in service_hits.most_common(5)],
        "qualities": [q for q, _ in quality_hits.most_common(3)],
        "positive_count": len(positive),
    }


def build_description(processor, summary, rating, review_count):
    """Build a factual paragraph from the summary dict. Never uses review text directly."""
    name = processor["name"]
    loc = processor.get("location", processor.get("state", ""))
    parts = []

    lead = f"{name} is a meat processor"
    if loc:
        lead += f" in {loc}"
    if rating is not None and review_count:
        lead += f", rated {rating} stars across {review_count} Google reviews."
    else:
        lead += "."
    parts.append(lead)

    if summary["qualities"]:
        parts.append(f"Customers highlight their {_join(summary['qualities'])}.")

    if summary["services"]:
        parts.append(f"Common review themes include {_join(summary['services'])}.")

    return " ".join(parts)


def _join(items):
    if not items: return ""
    if len(items) == 1: return items[0]
    if len(items) == 2: return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    env = load_env()
    key = env["VITE_GOOGLE_MAPS_API_KEY"]

    data = json.loads(DATA.read_text())
    about = json.loads(ABOUT.read_text())

    # Target records with googleMapsUri (which means a matched Place)
    targets = [r for r in data if r.get("googleMapsUri")]
    if args.limit:
        targets = targets[:args.limit]
    print(f"Pulling reviews for {len(targets)} records with matched Places")

    results = []
    stats = {"ok": 0, "no_reviews": 0, "species_added": 0, "desc_generated": 0, "error": 0}

    for i, r in enumerate(targets, 1):
        addr = r.get("address") or r.get("location") or r.get("state", "")
        pr = query_reviews(r["name"], addr, r.get("state", ""), key)
        entry = {"slug": r["slug"], "name": r["name"]}

        if not pr.get("ok"):
            entry["error"] = pr.get("error")
            stats["error"] += 1
            results.append(entry)
            continue

        place = pr["place"]
        places_name = (place.get("displayName") or {}).get("text", "")
        conf = name_confidence(r["name"], places_name)
        entry["confidence"] = round(conf, 2)
        if conf < 0.4:
            entry["error"] = "low-confidence"
            stats["error"] += 1
            results.append(entry)
            continue

        reviews = place.get("reviews") or []
        if not reviews:
            stats["no_reviews"] += 1
            results.append(entry)
            continue

        new_species = species_from_reviews(reviews)
        existing_species = set(r.get("species") or [])
        added_species = sorted(set(new_species) - existing_species)

        summary = summarize_positive(reviews, min_rating=4)

        # Decide whether to generate a description:
        # - No rich about content in processorAboutContent.json
        # - No existing processor.description OR existing is the boilerplate
        # - Have at least 2 positive reviews AND either 1+ quality or 1+ service
        has_rich = r["slug"] in about and len(about[r["slug"]].get("about") or "") >= 100
        has_existing_desc = bool(r.get("description"))
        can_summarize = (
            summary["positive_count"] >= 2
            and (summary["qualities"] or summary["services"])
        )
        generated_desc = None
        if not has_rich and not has_existing_desc and can_summarize:
            generated_desc = build_description(
                r, summary, place.get("rating"), place.get("userRatingCount"),
            )

        entry["review_count"] = len(reviews)
        entry["added_species"] = added_species
        entry["summary"] = summary
        entry["generated_desc"] = generated_desc
        results.append(entry)

        stats["ok"] += 1
        if added_species:
            stats["species_added"] += 1
        if generated_desc:
            stats["desc_generated"] += 1

        if i % 25 == 0 or i == len(targets):
            print(f"  [{i}/{len(targets)}] ok={stats['ok']} species+={stats['species_added']} descs+={stats['desc_generated']}")
        time.sleep(0.15)

    STAGING.write_text(json.dumps(results, indent=2) + "\n")
    print(f"\nStaged to {STAGING.relative_to(REPO)}")
    print(f"\n─── Summary ───")
    print(f"  Success:          {stats['ok']}")
    print(f"  No reviews:       {stats['no_reviews']}")
    print(f"  Errors:           {stats['error']}")
    print(f"  Species added:    {stats['species_added']}")
    print(f"  Descs generated:  {stats['desc_generated']}")

    if args.apply:
        by_slug = {e["slug"]: e for e in results}
        species_count = 0
        desc_count = 0
        for r in data:
            e = by_slug.get(r["slug"])
            if not e or "error" in e:
                continue
            if e.get("added_species"):
                merged = sorted(set(r.get("species") or []) | set(e["added_species"]))
                if merged != (r.get("species") or []):
                    r["species"] = merged
                    species_count += 1
            if e.get("generated_desc") and not r.get("description"):
                r["description"] = e["generated_desc"]
                desc_count += 1

        DATA.write_text(json.dumps(data, indent=2) + "\n")
        print(f"\n✓ Applied: {species_count} species updates, {desc_count} descriptions generated")


if __name__ == "__main__":
    main()
