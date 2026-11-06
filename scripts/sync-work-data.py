#!/usr/bin/env python3
"""Upsert the Work and Experience content into the CMS through the admin API.

Usage: ADMIN_USER=... ADMIN_PASS=... python3 scripts/sync-work-data.py [--dry-run]

Projects and experiences are matched by title and company. Anything listed in
REMOVED_PROJECTS is deleted. Other CMS records are left alone.
"""
import http.cookiejar
import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.environ.get("CMS_API", "http://localhost:9998/api/v1")
DRY_RUN = "--dry-run" in sys.argv

# Renamed or removed entries, matched by their current title.
RENAMED_PROJECTS = {"Sipintar": "Rekan HR (Sipintar)"}
REMOVED_PROJECTS = ["PolicyMind AI"]

PROJECTS = [
    {
        "title": "RekanDoku",
        "date": "Jan 2025 – Present",
        "category": "fullstack developer",
        "featured": True,
        "tags": ["Next.js", "NestJS", "PostgreSQL", "BullMQ", "Redis", "MinIO"],
        "webapp_url": "https://rekandoku.com",
        "github_url": "",
        "description": (
            "Digital document platform with e-signature, e-KYC, and e-meterai stamping through Peruri. "
            "I built the original React frontend, then worked across the Next.js and NestJS rebuild: "
            "signing flows, role-based access, and queued stamping."
        ),
    },
    {
        "title": "OmniSync",
        "date": "Jul 2026 – Present",
        "category": "fullstack developer",
        "featured": True,
        "tags": ["Personal project", "Spring Boot", "Next.js", "PostgreSQL", "Flyway", "Jenkins"],
        "webapp_url": "",
        "github_url": "",
        "description": (
            "Multi-tenant commerce platform I'm building solo: product catalog, inventory, pricing, and "
            "two-way stock and price sync with marketplace connectors, plus supplier management and auto reorder."
        ),
    },
    {
        "title": "Rekan LM",
        "date": "Jul 2026",
        "category": "backend developer",
        "featured": True,
        "tags": ["Laravel", "PostgreSQL", "pgvector", "RAG", "Multi-tenant"],
        "webapp_url": "",
        "github_url": "",
        "description": (
            "Backend for a governed AI analytics platform: multi-tenant workspaces, a chunking and embedding "
            "pipeline with policy-aware retrieval, AI provider routing, agent trace logs, and human approval gates."
        ),
    },
    {
        "title": "Enterprise Location Hub",
        "date": "Feb 2026",
        "category": "fullstack developer",
        "featured": False,
        "tags": ["Client project", "Laravel", "React", "Inertia.js", "Google Business API"],
        "webapp_url": "",
        "github_url": "",
        "description": (
            "Central system for managing a large enterprise's physical locations. I built Excel import and "
            "export with validation and background processing, Google review sync, the review and KPI dashboards, "
            "and user management, then set up the test suite and ran security and performance testing."
        ),
    },
    {
        "title": "MyIdeaNet",
        "date": "2024 – Present",
        "category": "mobile frontend",
        "featured": False,
        "tags": ["Flutter", "Android", "Google Play"],
        "webapp_url": "",
        "github_url": "",
        "description": "ISP customer portal for managing internet services, live on Google Play. iOS release in progress.",
    },
    {
        "title": "Navasena AI",
        "date": "Oct 2025 – Mar 2026",
        "category": "frontend developer",
        "featured": False,
        "tags": ["Next.js", "React", "MinIO", "Docker"],
        "webapp_url": "https://navasena.com",
        "github_url": "",
        "description": (
            "Website for an AI education and bootcamp company, covering public programs and enterprise "
            "solutions, with images served from MinIO and a Docker deployment."
        ),
    },
    {
        "title": "RekanLabs",
        "date": "Feb 2026 – Jun 2026",
        "category": "frontend developer",
        "featured": False,
        "tags": ["Angular", "SSR", "i18n"],
        "webapp_url": "https://rekanlabs.com",
        "github_url": "",
        "description": (
            "The company's public website, built with Angular SSR, including a product showcase and full "
            "Indonesian and English translations."
        ),
    },
    {
        "title": "A&A Property Agent",
        "date": "2024",
        "category": "mobile frontend",
        "featured": False,
        "tags": ["Flutter", "Google Play", "REST API"],
        "webapp_url": "",
        "github_url": "",
        "description": (
            "Property marketplace for search, buy, sell, and rent. Built and shipped to Google Play as the "
            "sole mobile developer. iOS version in progress."
        ),
    },
    {
        "title": "BC Care",
        "date": "Feb 2023 – May 2023",
        "category": "mobile frontend",
        "featured": False,
        "tags": ["React Native", "Android", "Laravel", "Google Play"],
        "webapp_url": "",
        "github_url": "",
        "description": "Shipment tracking app for BCLogistics customers, live on Google Play, with REST APIs in Laravel.",
    },
    {
        "title": "Rekan HR (Sipintar)",
        "date": "Jan 2026 – Jul 2026",
        "category": "fullstack developer",
        "featured": False,
        "tags": ["Laravel", "React", "Inertia.js", "Docker"],
        "webapp_url": "",
        "github_url": "",
        "description": (
            "Talent and career management platform. I built performance assessment features: total score "
            "calculation, automatic performance ratings, merit distribution, award administration, and bulk "
            "Excel import, plus part of the Docker deployment setup."
        ),
    },
    {
        "title": "Policy Intelligence Dashboard",
        "date": "Dec 2025 – Jun 2026",
        "category": "fullstack developer",
        "featured": False,
        "tags": ["Client project", "Laravel", "Livewire", "LLM"],
        "webapp_url": "",
        "github_url": "",
        "description": (
            "News analytics dashboard with automated collection and LLM classification. I revamped the "
            "dashboard, added location data extracted from articles, and generalized its roles, prompts, and "
            "branding so the system could be reused."
        ),
    },
    {
        "title": "Booking Microservices",
        "date": "Feb 2025 – Apr 2025",
        "category": "backend developer",
        "featured": False,
        "tags": ["Personal project", "Go", "Gin", "GORM", "gRPC"],
        "webapp_url": "",
        "github_url": "",
        "description": "Field booking backend split into Go services. I built the user and field services, with S3 file storage.",
    },
]

EXPERIENCE_UPDATES = {
    "PT. Allbest Solution System": {
        "skills": [
            "NestJS", "Next.js", "React.js", "Angular", "Laravel",
            "PostgreSQL", "Redis", "BullMQ", "Flutter", "Docker",
        ],
        "desc": (
            "Full stack developer in a 4-developer Agile/Scrum team, working across web, backend, and mobile. "
            "Build RekanDoku's Next.js frontend and NestJS backend (e-signature, e-KYC, e-meterai), and built "
            "the Rekan LM backend in Laravel (RAG pipeline, approvals, multi-tenant access), the company site "
            "RekanLabs in Angular SSR, and Navasena AI in Next.js. Shipped MyIdeaNet to Google Play, and "
            "contributed to client systems for location management and news analytics."
        ),
    },
}

# Group title -> skill names in display order. Existing names keep their image.
SKILL_GROUPS = {
    "Backend": ["Golang (Gin)", "Java (Spring Boot)", "NestJS", "Laravel", "RESTful API"],
    "Frontend": ["React.js", "Next.js", "Angular"],
    "DevOps / Workflow": ["Git", "Agile/Scrum", "CI/CD (Jenkins)", "Code Review", "Docker"],
}
RENAMED_SKILLS = {"CI/CD": "CI/CD (Jenkins)"}


def main():
    user, password = os.environ.get("ADMIN_USER"), os.environ.get("ADMIN_PASS")
    if not user or not password:
        sys.exit("Set ADMIN_USER and ADMIN_PASS.")

    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())
    )

    def request(method, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(
            BASE + path, data=data, method=method, headers={"Content-Type": "application/json"}
        )
        try:
            with opener.open(req) as resp:
                raw = resp.read()
        except urllib.error.HTTPError as error:
            sys.exit(f"{method} {path} failed: {error.code} {error.read()[:200]!r}")
        return json.loads(raw) if raw else {}

    def write(method, path, body=None):
        print(f"{'would ' if DRY_RUN else ''}{method} {path}")
        if not DRY_RUN:
            request(method, path, body)

    request("POST", "/admin/auth/login", {"username": user, "password": password})

    current = {p["title"]: p for p in request("GET", "/admin/projects")["data"]}
    for old, new in RENAMED_PROJECTS.items():
        if old in current and new not in current:
            current[new] = current.pop(old)

    for sort, project in enumerate(PROJECTS, start=1):
        existing = current.get(project["title"])
        payload = {
            "image_url": existing.get("image_url", "") if existing else "",
            "members": [],
            **project,
            "sort": sort,
        }
        if existing:
            write("PUT", f"/admin/projects/{existing['id']}", payload)
        else:
            write("POST", "/admin/projects", payload)

    for title in REMOVED_PROJECTS:
        if title in current:
            write("DELETE", f"/admin/projects/{current[title]['id']}")

    experiences = request("GET", "/experiences")["data"]
    for experience in experiences:
        update = EXPERIENCE_UPDATES.get(experience["company"])
        if update:
            write("PUT", f"/admin/experiences/{experience['id']}", {**experience, **update})

    for group in request("GET", "/skills")["data"]:
        names = SKILL_GROUPS.get(group["title"])
        if not names:
            continue
        images = {RENAMED_SKILLS.get(x["name"], x["name"]): x.get("image_url", "") for x in group["skills"]}
        unexpected = set(images) - set(names)
        if unexpected:
            sys.exit(f"{group['title']} has skills missing from SKILL_GROUPS: {sorted(unexpected)}")
        skills = [
            {"name": name, "image_url": images.get(name, ""), "sort": index}
            for index, name in enumerate(names, start=1)
        ]
        write(
            "PUT",
            f"/admin/skills/{group['id']}",
            {"title": group["title"], "sort": group["sort"], "skills": skills},
        )


if __name__ == "__main__":
    main()
