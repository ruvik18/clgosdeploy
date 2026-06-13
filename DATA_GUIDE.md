# CounselIQ — Data Upload Guide

A complete reference for uploading and updating all data in CounselIQ. All data lives in **JSON files** — no database, no admin panel. Just edit the right file and restart the server.

---

## File Locations

All data files are in:
```
artifacts/api-server/src/data/
├── colleges.json          ← College profiles (all details)
├── counsellings.json      ← Counselling bodies (JoSAA, CSAB, etc.)
├── cutoffs.json           ← Opening/closing ranks per branch per year
├── placements.json        ← Placement statistics per college
├── departments.json       ← Branch/department list per college
├── hostels.json           ← Hostel data per college
├── internships.json       ← Internship statistics per college
├── rounds.json            ← Counselling rounds and dates
└── loader.ts              ← (DO NOT EDIT — auto-loads all files)
```

After editing any file, the server reloads automatically in development. In production, redeploy the app.

---

## 1. Adding a New College

**File:** `artifacts/api-server/src/data/colleges.json`

Add a new object to the array. Every field is described below:

```json
{
  "id": "iit-roorkee",
  "name": "IIT Roorkee",
  "slug": "iit-roorkee",
  "location": "Roorkee",
  "state": "Uttarakhand",
  "type": "IIT",
  "established": 1847,
  "naacGrade": "A++",
  "logoUrl": null,
  "coverImageUrl": null,
  "tagline": "India's oldest technical institute — strong civil and electrical.",
  "description": "Short 1-line description shown in search results.",
  "about": "Longer paragraph about the college for the detail page.",
  "admissionThrough": "JEE Advanced → JoSAA",
  "website": "https://www.iitr.ac.in",
  "avgPackageLPA": 22.5,
  "medianPackageLPA": 16.0,
  "peakPackageCR": 1.80,
  "peakInternationalPackageCR": 2.20,
  "cseCutoffRank": 380,
  "nirfRank": 9,
  "nirfRankCategory": "Engineering",
  "qsWorldRank": 369,
  "placementPercent": 65,
  "totalOffers": 920,
  "linkedinAlumni": 82000,
  "totalFaculty": 540,
  "totalStudents": 8800,
  "campusAreaAcres": 365,
  "counsellings": ["josaa"],
  "topRecruiters": ["Google", "Microsoft", "Amazon", "Goldman Sachs", "L&T", "DRDO"],
  "facilities": ["Library", "Swimming Pool", "Indoor Stadium", "Hospital"],
  "labs": [
    { "name": "Earthquake Engineering Lab", "description": "World's largest shake table for seismic research" }
  ],
  "tags": ["IIT", "Institute of National Importance", "NAAC A++", "JEE Advanced"],
  "featured": true
}
```

### Field Reference

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique ID, use lowercase-hyphen format. MUST match the slug. |
| `slug` | string | Used in URLs: `/colleges/iit-roorkee`. Same as `id`. |
| `type` | string | One of: `"IIT"`, `"NIT"`, `"IIIT"`, `"GFTI"`, `"Deemed University"`, `"State University"`, `"Private"` |
| `naacGrade` | string or null | `"A++"`, `"A+"`, `"A"`, `"B++"`, or `null` |
| `logoUrl` | string or null | URL to college logo image. Use `null` if no logo — the app shows a colored initial letter instead. |
| `avgPackageLPA` | number | Average package in Lakhs Per Annum (e.g. 22.5 = ₹22.5 LPA) |
| `peakPackageCR` | number | Highest package in Crores (e.g. 1.80 = ₹1.80 Cr) |
| `cseCutoffRank` | number | JEE closing rank for CSE (used on college card). |
| `nirfRank` | number or null | NIRF Engineering rank. `null` if not ranked. |
| `qsWorldRank` | number or null | QS World University ranking. `null` if not ranked. |
| `counsellings` | array of strings | IDs of counsellings this college participates in. Must match IDs in `counsellings.json`. |
| `featured` | boolean | `true` = appears on homepage featured section. |

---

## 2. Adding a New Counselling

**File:** `artifacts/api-server/src/data/counsellings.json`

```json
{
  "id": "mht-cet",
  "name": "MHT-CET",
  "slug": "mht-cet",
  "type": "Engineering",
  "level": "State",
  "states": ["Maharashtra"],
  "startMonth": "Aug",
  "endMonth": "Oct",
  "startYear": 2026,
  "logoUrl": null,
  "description": "Maharashtra Common Entrance Test — engineering admissions in Maharashtra.",
  "about": "Longer description of the counselling body and process.",
  "totalColleges": 380,
  "totalSeats": 120000,
  "rounds": 3,
  "importantDates": [
    { "event": "Registration Opens", "date": "Aug 01, 2026" },
    { "event": "Round 1 Allotment", "date": "Aug 22, 2026" },
    { "event": "Round 2 Allotment", "date": "Sep 05, 2026" }
  ]
}
```

### Field Reference

| Field | Notes |
|-------|-------|
| `id` / `slug` | Unique lowercase-hyphen ID. Same value for both. |
| `level` | `"National"` or `"State"` |
| `states` | Array of state names. Use `["National"]` for all-India counsellings. |
| `rounds` | Total number of counselling rounds. |
| `importantDates` | Array of `{ event, date }` objects shown in the schedule. |

After adding, also add counselling rounds in `rounds.json` (see Section 5).

---

## 3. Adding Cutoff Data

**File:** `artifacts/api-server/src/data/cutoffs.json`

This is the largest file — it holds rank data for every branch, every category, every round.

```json
{
  "id": "unique-id",
  "collegeId": "iit-roorkee",
  "counsellingId": "josaa",
  "year": 2025,
  "round": 6,
  "branch": "Computer Science and Engineering",
  "branchCode": "CSE",
  "category": "OPEN",
  "quota": "AI",
  "openRank": 320,
  "closeRank": 380,
  "gender": "Gender-Neutral"
}
```

### Field Reference

| Field | Values | Notes |
|-------|--------|-------|
| `id` | string | Unique ID per row. Use a counter: `"c200"`, `"c201"`, etc. |
| `collegeId` | string | Must match a college `id` in `colleges.json` |
| `counsellingId` | string | Must match a counselling `id` in `counsellings.json` |
| `year` | number | 2020 to 2025 |
| `round` | number | 1 to 6 (or however many rounds the counselling has) |
| `category` | string | `"OPEN"`, `"OBC-NCL"`, `"SC"`, `"ST"`, `"EWS"`, `"OBC-NCL-PWD"`, `"SC-PWD"`, `"ST-PWD"`, `"EWS-PWD"` |
| `quota` | string | `"AI"` (IITs all-India), `"HS"` (Home State for NITs), `"OS"` (Other State for NITs), `"GO"` (Goa quota) |
| `openRank` | number | Opening rank (rank at which allotment started) |
| `closeRank` | number | Closing rank (last rank allotted — most important number) |
| `gender` | string | `"Gender-Neutral"` or `"Female-only"` |

### Tips for Bulk Cutoff Upload

**From JoSAA PDF/website:**
1. Download the official round-wise cutoff PDF from josaa.nic.in
2. Convert to CSV using a PDF-to-CSV tool or copy-paste into Excel
3. Map columns to the JSON fields above
4. Set `id` incrementally (e.g., start from `"c500"` to avoid conflicts)
5. Paste the resulting JSON array into `cutoffs.json` (inside the existing `[...]` array)

**Recommended structure per college:**
- Add Round 1 through Round 6 for the latest year
- At minimum add Round 6 (final) which is used for predictions by default
- Add 2-3 years of history for trend data

---

## 4. Adding Placement Data

**File:** `artifacts/api-server/src/data/placements.json`

This is a **dictionary** (object), not an array. The key is the college ID.

```json
{
  "iit-roorkee": {
    "collegeId": "iit-roorkee",
    "year": 2025,
    "totalOffers": 920,
    "companiesRegistered": 280,
    "companiesOffered": 275,
    "internationalOffers": 28,
    "placementPercent": 65,
    "avgPackageLPA": 22.5,
    "medianPackageLPA": 16.0,
    "peakPackageCR": 1.80,
    "mbdPlacedPercent": 92.0,
    "topRecruiters": ["Google", "Microsoft", "Amazon", "Goldman Sachs", "L&T"],
    "sectorBreakdown": [
      { "sector": "Product / Tech", "firms": 8, "percentage": 50 },
      { "sector": "Finance / Banking", "firms": 3, "percentage": 18 },
      { "sector": "Core / Manufacturing", "firms": 4, "percentage": 22 },
      { "sector": "Consulting", "firms": 2, "percentage": 7 },
      { "sector": "Other", "firms": 1, "percentage": 3 }
    ],
    "yearWiseTrend": [
      { "year": 2021, "avgPackageLPA": 16.0, "peakPackageCR": 1.20, "totalOffers": 700, "placementPercent": 60 },
      { "year": 2022, "avgPackageLPA": 18.5, "peakPackageCR": 1.40, "totalOffers": 780, "placementPercent": 62 },
      { "year": 2023, "avgPackageLPA": 20.0, "peakPackageCR": 1.55, "totalOffers": 840, "placementPercent": 63 },
      { "year": 2024, "avgPackageLPA": 21.5, "peakPackageCR": 1.70, "totalOffers": 890, "placementPercent": 64 },
      { "year": 2025, "avgPackageLPA": 22.5, "peakPackageCR": 1.80, "totalOffers": 920, "placementPercent": 65 }
    ]
  }
}
```

### Field Notes

- `sectorBreakdown`: percentages should ideally add up to 100
- `yearWiseTrend`: add one entry per year. Used for the placement trend chart on the college detail page.
- `mbdPlacedPercent`: % of eligible students who got placed. Can be null if unknown.

---

## 5. Adding Departments / Branches

**File:** `artifacts/api-server/src/data/departments.json`

This is a dictionary where each key is a college ID, and the value is an **array** of department objects.

```json
{
  "iit-roorkee": [
    {
      "id": "iitr-cse",
      "collegeId": "iit-roorkee",
      "name": "Computer Science and Engineering",
      "code": "CSE",
      "seats": 80,
      "avgPackageLPA": 38.0,
      "peakPackageLPA": 180.0,
      "cseCutoffRank": 380,
      "duration": "4 Years",
      "description": "Brief description of the department."
    },
    {
      "id": "iitr-ece",
      "collegeId": "iit-roorkee",
      "name": "Electronics and Communication Engineering",
      "code": "ECE",
      "seats": 80,
      "avgPackageLPA": 25.0,
      "peakPackageLPA": 110.0,
      "cseCutoffRank": 820,
      "duration": "4 Years",
      "description": null
    }
  ]
}
```

### Field Notes

- `id`: Use format `"collegeid-branchcode"` e.g., `"iitr-cse"`, `"iitr-ece"`
- `cseCutoffRank`: The JEE closing rank for this specific branch (not CSE specifically — it's the branch cutoff rank)
- `peakPackageLPA`: In Lakhs, not Crores (unlike the main college `peakPackageCR`)

---

## 6. Adding Hostel Data

**File:** `artifacts/api-server/src/data/hostels.json`

Dictionary with college ID as key.

```json
{
  "iit-roorkee": {
    "collegeId": "iit-roorkee",
    "totalHostels": 10,
    "boysHostels": 8,
    "girlsHostels": 2,
    "totalCapacity": 8800,
    "boysCapacity": 7000,
    "girlsCapacity": 1800,
    "feePerYear": 48000,
    "description": "IIT Roorkee has 10 hostels on its sprawling campus.",
    "amenities": ["Wi-Fi", "Laundry", "Common Room", "Gym", "Mess", "24x7 Security"],
    "hostels": [
      {
        "name": "Cautley Bhawan",
        "type": "Boys",
        "capacity": 900,
        "feePerYear": 48000,
        "floors": 5,
        "amenities": ["Wi-Fi", "Gym", "Common Room", "Laundry"]
      },
      {
        "name": "Kasturba Bhawan",
        "type": "Girls",
        "capacity": 700,
        "feePerYear": 48000,
        "floors": 4,
        "amenities": ["Wi-Fi", "Common Room", "Security", "Laundry"]
      }
    ]
  }
}
```

---

## 7. Adding Internship Data

**File:** `artifacts/api-server/src/data/internships.json`

Dictionary with college ID as key.

```json
{
  "iit-roorkee": {
    "collegeId": "iit-roorkee",
    "year": 2025,
    "totalInterns": 680,
    "avgStipendPerMonth": 42000,
    "peakStipendPerMonth": 250000,
    "topCompanies": ["Google", "Microsoft", "Amazon", "Samsung", "Goldman Sachs", "Nvidia"],
    "internationalInternships": 28,
    "conversionToFullTime": 44.0
  }
}
```

### Field Notes

- `avgStipendPerMonth`: Monthly stipend in Rupees (e.g. 42000 = ₹42,000/month)
- `peakStipendPerMonth`: Highest monthly stipend received
- `conversionToFullTime`: % of interns who received a full-time offer (Pre-Placement Offer)

---

## 8. Adding Counselling Rounds

**File:** `artifacts/api-server/src/data/rounds.json`

Array of round objects. Each counselling has multiple rounds.

```json
{
  "id": "mhtcet-r1-2026",
  "counsellingId": "mht-cet",
  "roundNumber": 1,
  "name": "Round 1",
  "registrationStart": "Aug 01, 2026",
  "registrationEnd": "Aug 10, 2026",
  "resultDate": "Aug 22, 2026",
  "year": 2026,
  "notes": "First round — most competitive seats filled here."
}
```

---

## 9. JSON Validation Tips

Before uploading, validate your JSON using [jsonlint.com](https://jsonlint.com):

**Common mistakes:**
- Trailing commas after the last item in an array or object — JSON does NOT allow this
- Missing quotes around keys — all keys must be in double quotes
- Single quotes instead of double quotes
- Numbers as strings (`"22.5"` instead of `22.5`)

**Quick validation command (run in terminal):**
```bash
node -e "JSON.parse(require('fs').readFileSync('artifacts/api-server/src/data/colleges.json', 'utf8')); console.log('Valid JSON')"
```

---

## 10. Quick Reference — Adding Data for a New College

When you add a brand new college, update **all** of these files:

| File | What to add |
|------|-------------|
| `colleges.json` | Full college profile |
| `departments.json` | Add a key with college ID + array of departments |
| `placements.json` | Add a key with college ID + placement data |
| `hostels.json` | Add a key with college ID + hostel data |
| `internships.json` | Add a key with college ID + internship data |
| `cutoffs.json` | Add rows for each branch × category × round × year |

The college will appear in the predictor once cutoff data is added.

---

## 11. Updating Existing Data

To update existing data (e.g., new year's cutoffs):

1. Open the relevant JSON file
2. Find the existing entries by college ID / year
3. Add new entries (for cutoffs.json: add new rows with the new year)
4. The old data is preserved for historical comparison

**For cutoffs: always add, never delete old years.** The predictor uses the latest year by default, but historical data powers the trend charts.

---

## 12. Column / Field Naming Quick Sheet

| What you have | JSON field name |
|---------------|-----------------|
| JEE closing rank | `closeRank` |
| JEE opening rank | `openRank` |
| Average package (₹ Lakhs) | `avgPackageLPA` |
| Highest package (₹ Crores) | `peakPackageCR` |
| Highest package (₹ Lakhs) | `peakPackageLPA` (in departments) |
| NIRF rank | `nirfRank` |
| QS World rank | `qsWorldRank` |
| Placement percentage | `placementPercent` |
| Monthly stipend | `avgStipendPerMonth` |
| Annual hostel fee | `feePerYear` |
| Home state quota | quota = `"HS"` |
| Other state quota | quota = `"OS"` |
| All-India quota (IITs) | quota = `"AI"` |

---

*Last updated: June 2026 — CounselIQ Data Team*
