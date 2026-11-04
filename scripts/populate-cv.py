#!/usr/bin/env python3
"""Populate portfolio CMS with CV-derived content via the admin API."""
import json, urllib.request, urllib.error, http.cookiejar

BASE = "http://localhost:8080/api/v1"
USER, PASS = "admin", "admin123"

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method,
                               headers={"Content-Type": "application/json"})
    try:
        resp = opener.open(r)
        return resp.status, json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")

def icon(slug):
    return f"https://cdn.simpleicons.org/{slug}" if slug else ""

# ---------- BIO ----------
bio = {
    "name": "Rizqika Ibnu Khattab",
    "roles": ["Full Stack Developer", "Android Security Practitioner", "Mobile Developer", "Backend Developer"],
    "description": (
        "Full Stack Developer with 2+ years of experience building production systems across backend, mobile, and web. "
        "Delivered 9+ production projects, including 3 Android apps live on Google Play Store (logistics, ISP, property). "
        "Develops backend services with Golang (Gin), NestJS, and Laravel, and cross-platform apps with Flutter and React Native. "
        "Holds 3 formal certifications in Android mobile penetration testing (top score 94.2/100) and applies OWASP Mobile Top 10 "
        "and secure coding practices in daily development."
    ),
    "github": "https://github.com/riz081",
    "resume": "https://drive.google.com/file/d/1ZO1Lb3BcomUXDmqIRAcXjP_lFBfpeM-y/view?usp=sharing",
    "linkedin": "https://www.linkedin.com/in/rizqika-ibnu-khattab-231714218/",
    "insta": "https://www.instagram.com/rizqika_i.k/#",
    "facebook": "https://www.facebook.com/rizqika.ningendo",
    "avatar_url": "",
}

# ---------- SKILLS ----------
skill_groups = [
    {"title": "Backend", "sort": 1, "skills": [
        {"name": "Golang (Gin)", "image_url": icon("go")},
        {"name": "NestJS", "image_url": icon("nestjs")},
        {"name": "Laravel", "image_url": icon("laravel")},
        {"name": "RESTful API", "image_url": ""},
    ]},
    {"title": "Mobile", "sort": 2, "skills": [
        {"name": "Flutter", "image_url": icon("flutter")},
        {"name": "React Native", "image_url": ""},
        {"name": "Java (Android)", "image_url": ""},
    ]},
    {"title": "Frontend", "sort": 3, "skills": [
        {"name": "React.js", "image_url": icon("react")},
        {"name": "Next.js", "image_url": icon("nextdotjs")},
    ]},
    {"title": "Languages", "sort": 4, "skills": [
        {"name": "Go", "image_url": icon("go")},
        {"name": "TypeScript", "image_url": icon("typescript")},
        {"name": "JavaScript", "image_url": icon("javascript")},
        {"name": "PHP", "image_url": icon("php")},
        {"name": "Dart", "image_url": icon("dart")},
        {"name": "Java", "image_url": ""},
        {"name": "SQL", "image_url": ""},
    ]},
    {"title": "Security", "sort": 5, "skills": [
        {"name": "OWASP Mobile Top 10", "image_url": ""},
        {"name": "OWASP Web Top 10", "image_url": ""},
        {"name": "ADB", "image_url": ""},
        {"name": "APK Reverse Engineering", "image_url": ""},
        {"name": "Static & Dynamic Analysis", "image_url": ""},
        {"name": "API Security Testing", "image_url": ""},
    ]},
    {"title": "AI & Tooling", "sort": 6, "skills": [
        {"name": "Claude Code", "image_url": ""},
        {"name": "OpenCode", "image_url": ""},
        {"name": "LLM Integration", "image_url": ""},
        {"name": "Prompt Engineering", "image_url": ""},
    ]},
    {"title": "DevOps / Workflow", "sort": 7, "skills": [
        {"name": "Git", "image_url": icon("git")},
        {"name": "Agile/Scrum", "image_url": ""},
        {"name": "CI/CD", "image_url": ""},
        {"name": "Code Review", "image_url": ""},
        {"name": "Docker", "image_url": icon("docker")},
    ]},
]

# ---------- EXPERIENCES ----------
experiences = [
    {
        "role": "Full Stack Developer",
        "company": "PT. Allbest Solution System",
        "date": "Oct 2024 – Present",
        "desc": "Delivered 9+ production projects across mobile, web, and backend in a 4-developer Agile/Scrum team. Shipped MyIdeaNet and A&A Property Agent on Google Play Store; built the company platform RekanLabs and client platforms Navasena AI and RekanDoku.",
        "skills": ["Golang", "NestJS", "Laravel", "React.js", "Next.js", "Flutter", "React Native", "PostgreSQL"],
        "sort": 1,
    },
    {
        "role": "Mobile Developer (Freelance)",
        "company": "CV A&A Indonesia",
        "date": "2024",
        "desc": "Architected, built, and shipped A&A Property Agent, a Flutter-based property marketplace (search, buy, sell, rent) live on Google Play Store as the sole mobile developer, including iOS version in progress.",
        "skills": ["Flutter", "REST API", "Google Play Store"],
        "sort": 2,
    },
    {
        "role": "Full Stack / Mobile Developer Intern",
        "company": "PT. Berkat Cipta Logistic",
        "date": "Feb 2023 – May 2023",
        "desc": "Developed and shipped BC Care, an Android shipment tracking app live on Google Play Store. Migrated and developed RESTful APIs using Laravel with structured request validation and secure data processing.",
        "skills": ["React Native", "Laravel", "REST API", "MySQL"],
        "sort": 3,
    },
]

# ---------- EDUCATION ----------
education = [
    {
        "school": "Universitas Telkom, Surabaya",
        "degree": "Bachelor of Information System",
        "date": "Oct 2020 – Oct 2024",
        "grade": "",
        "desc": "Research on robotics and IoT systems for autonomous agricultural tractors (autopilot navigation using sensors and embedded systems), plus machine learning and AI applications. Served as Teaching Assistant for web and mobile application development.",
        "img_url": "",
        "sort": 1,
    },
]

# ---------- PROJECTS ----------
projects = [
    {"title": "BC Care", "date": "Feb 2023 – May 2023",
     "description": "Shipment tracking app for BCLogistics customers, live on Google Play Store.",
     "category": "mobile frontend", "github_url": "https://github.com/riz081/RN-BC-Care", "webapp_url": "",
     "tags": ["React Native", "Android", "Laravel", "Google Play"], "sort": 1},
    {"title": "MyIdeaNet", "date": "2024 – Present",
     "description": "ISP customer portal for managing internet services, live on Google Play Store (iOS release in progress).",
     "category": "mobile frontend", "github_url": "", "webapp_url": "",
     "tags": ["Android", "ISP", "Google Play"], "sort": 2},
    {"title": "A&A Property Agent", "date": "2024",
     "description": "Property marketplace for search, buy, sell, and rent, built with Flutter and live on Google Play Store.",
     "category": "mobile frontend", "github_url": "", "webapp_url": "",
     "tags": ["Flutter", "Google Play", "Property"], "sort": 3},
    {"title": "RekanLabs", "date": "2024 – Present",
     "description": "Company's main public platform and client-facing site built with React.js and Next.js (SSR).",
     "category": "frontend developer", "github_url": "", "webapp_url": "https://rekanlabs.com",
     "tags": ["React.js", "Next.js", "SSR"], "sort": 4},
    {"title": "Navasena AI", "date": "2024",
     "description": "AI education and bootcamp platform: public programs and enterprise solutions.",
     "category": "frontend developer", "github_url": "", "webapp_url": "https://navasena.com",
     "tags": ["React.js", "Next.js", "AI"], "sort": 5},
    {"title": "RekanDoku", "date": "2024 – Present",
     "description": "Document management microservice frontend, deployed to a staging VPS.",
     "category": "frontend developer", "github_url": "", "webapp_url": "",
     "tags": ["React.js", "Microservices"], "sort": 6},
    {"title": "PolicyMind AI", "date": "2024 – Present",
     "description": "AI-powered policy management tool with LLM integration.",
     "category": "fullstack developer", "github_url": "", "webapp_url": "",
     "tags": ["AI", "LLM", "React.js"], "sort": 7},
    {"title": "Sipintar", "date": "2024",
     "description": "Internal platform in development and maintenance phase.",
     "category": "frontend developer", "github_url": "", "webapp_url": "",
     "tags": ["React.js"], "sort": 8},
]

# ---------- RUN ----------
s, r = req("POST", "/admin/auth/login", {"username": USER, "password": PASS})
print("login:", s)

s, r = req("PUT", "/admin/bio", bio)
print("bio:", s)

for g in skill_groups:
    s, r = req("POST", "/admin/skills", g)
    print("skill group", g["title"], "->", s)

for e in experiences:
    s, r = req("POST", "/admin/experiences", e)
    print("experience", e["company"], "->", s)

for e in education:
    s, r = req("POST", "/admin/education", e)
    print("education", e["school"], "->", s)

for p in projects:
    s, r = req("POST", "/admin/projects", {**p, "members": []})
    print("project", p["title"], "->", s)