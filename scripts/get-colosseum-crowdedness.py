#!/usr/bin/env python3
import json
import os
import sys
import urllib.request


API_BASE = os.environ.get("COLOSSEUM_COPILOT_API_BASE", "https://copilot.colosseum.com/api/v1").rstrip("/")
TOKEN = os.environ.get("COLOSSEUM_COPILOT_PAT")

QUERY = (
    "SplitStable Telegram native group expense splitting USDC settlement "
    "Solana Pay wallet signed payments"
)


def fail(message: str) -> None:
    print(message, file=sys.stderr)
    sys.exit(1)


if not TOKEN:
    fail("Missing COLOSSEUM_COPILOT_PAT. Export it in this terminal first.")

payload = {
    "query": QUERY,
    "limit": 8,
    "diversify": True,
}

req = urllib.request.Request(
    f"{API_BASE}/search/projects",
    data=json.dumps(payload).encode("utf-8"),
    headers={
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
    },
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=15) as response:
        data = json.loads(response.read().decode("utf-8"))
except Exception as exc:
    fail(f"Colosseum Copilot request failed: {type(exc).__name__}: {exc}")


def find_projects(value):
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        for key in ("projects", "results", "items", "data"):
            if isinstance(value.get(key), list):
                return value[key]
        for nested in value.values():
            found = find_projects(nested)
            if found:
                return found
    return []


def pick(project, *keys):
    for key in keys:
        if key in project and project[key] not in (None, ""):
            return project[key]
    return ""


projects = find_projects(data)

print("# Colosseum Copilot Crowdedness Search")
print()
print(f"Query: {QUERY}")
print()

top_level_crowdedness = pick(data if isinstance(data, dict) else {}, "crowdedness", "crowdednessScore")
if top_level_crowdedness:
    print(f"Overall crowdedness: {top_level_crowdedness}")
    print()

if not projects:
    print("No similar projects returned.")
    print()
    print("Raw response:")
    print(json.dumps(data, indent=2))
    sys.exit(0)

print("| # | Project | Similarity | Crowdedness | Hackathon | One-liner |")
print("|---|---------|------------|-------------|-----------|-----------|")

for index, project in enumerate(projects[:8], start=1):
    if not isinstance(project, dict):
        continue
    name = pick(project, "name", "title", "projectName") or "(unnamed)"
    similarity = pick(project, "similarity", "score", "similarityScore")
    crowdedness = pick(project, "crowdedness", "crowdednessScore", "crowdednessLabel")
    hackathon = pick(project, "hackathon", "hackathonName", "event")
    one_liner = pick(project, "oneLiner", "one_liner", "tagline", "description")
    one_liner = str(one_liner).replace("\n", " ")[:140]
    print(f"| {index} | {name} | {similarity} | {crowdedness} | {hackathon} | {one_liner} |")

print()
print("Use the crowdedness value shown above in the Superteam grant form.")
