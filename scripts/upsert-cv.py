#!/usr/bin/env python3
"""Upload new CV to MinIO, point bio.resume to it, and seed certifications."""
import json, urllib.request, urllib.error, http.cookiejar, uuid

BASE = "http://localhost:8080/api/v1"
USER, PASS = "admin", "admin123"
CV_PATH = "Rizqika_Ibnu_Khattab_CV_ATS.pdf"

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def req(method, path, body=None, raw=None, headers=None):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    h = {"Content-Type": "application/json"}
    if headers: h.update(headers)
    if raw is not None:
        h = headers or {}
    r = urllib.request.Request(BASE + path, data=data, method=method, headers=h)
    try:
        resp = opener.open(r)
        return resp.status, json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")

def multipart_upload(filepath, folder):
    boundary = uuid.uuid4().hex
    name = filepath.split("/")[-1]
    with open(filepath, "rb") as f:
        content = f.read()
    body = b""
    body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"folder\"\r\n\r\n{folder}\r\n".encode()
    body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{name}\"\r\nContent-Type: application/pdf\r\n\r\n".encode()
    body += content
    body += f"\r\n--{boundary}--\r\n".encode()
    ct = f"multipart/form-data; boundary={boundary}"
    s, r = req("POST", "/admin/upload", raw=body, headers={"Content-Type": ct})
    return s, r

# ---------- login ----------
s, _ = req("POST", "/admin/auth/login", {"username": USER, "password": PASS})
print("login:", s)

# ---------- certifications ----------
certs = [
    {"title": "Mobile Penetration Testing — Android Focus (Mini-Bootcamp Batch 2)",
     "issuer": "Codelamp Indonesia", "date": "Jan 2026",
     "credential": "Score: 94.2/100 (MASTERED) · Final Project: 92/100", "sort": 1},
    {"title": "CS-01: Basic Hacking Mobile Application — Android Penetration Testing",
     "issuer": "ITBox (itbox.id)", "date": "Nov 2025",
     "credential": "", "sort": 2},
    {"title": "Belajar Dasar Mobile Security",
     "issuer": "ID-Networkers (IDN.ID) Training Center", "date": "Nov 2025",
     "credential": "Valid until Nov 2028", "sort": 3},
]
for c in certs:
    s, r = req("POST", "/admin/certifications", c)
    print("certification", c["title"][:40], "->", s)

# ---------- upload CV + update resume ----------
s, r = multipart_upload(CV_PATH, "resume")
print("upload:", s)
resume_url = r.get("data", {}).get("url", "")
print("resume url:", resume_url)

if resume_url:
    s, bio = req("GET", "/bio")
    b = bio["data"]
    b["resume"] = resume_url
    s, r = req("PUT", "/admin/bio", b)
    print("bio update:", s, "| resume ->", resume_url)