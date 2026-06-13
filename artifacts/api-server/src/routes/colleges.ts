import { Router } from "express";
import {
  colleges,
  collegeById,
  placements,
  hostels,
  departments,
  internships,
  cutoffs,
} from "../data/loader.js";

const router = Router();

router.get("/colleges", (req, res) => {
  const { search, counsellingId, state, type, featured } = req.query;

  let result = colleges.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    location: c.location,
    state: c.state,
    type: c.type,
    established: c.established,
    naacGrade: c.naacGrade,
    logoUrl: c.logoUrl,
    tagline: c.tagline ?? null,
    avgPackageLPA: c.avgPackageLPA,
    peakPackageCR: c.peakPackageCR,
    cseCutoffRank: c.cseCutoffRank,
    nirfRank: c.nirfRank,
    featured: c.featured,
  }));

  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
    );
  }

  if (counsellingId && typeof counsellingId === "string") {
    const fullColleges = colleges.filter((c) =>
      c.counsellings.includes(counsellingId)
    );
    const ids = new Set(fullColleges.map((c) => c.id));
    result = result.filter((c) => ids.has(c.id));
  }

  if (state && typeof state === "string") {
    result = result.filter((c) =>
      c.state.toLowerCase() === state.toLowerCase()
    );
  }

  if (type && typeof type === "string") {
    result = result.filter((c) =>
      c.type.toLowerCase() === type.toLowerCase()
    );
  }

  if (featured === "true") {
    result = result.filter((c) => c.featured);
  }

  res.json(result);
});

router.get("/colleges/:id", (req, res) => {
  const c = collegeById.get(req.params.id);
  if (!c) {
    res.status(404).json({ error: "College not found" });
    return;
  }
  res.json(c);
});

router.get("/colleges/:id/placements", (req, res) => {
  const data = placements[req.params.id];
  if (!data) {
    res.json({
      collegeId: req.params.id,
      year: 2025,
      totalOffers: 0,
      companiesRegistered: 0,
      companiesOffered: 0,
      internationalOffers: 0,
      placementPercent: 0,
      avgPackageLPA: 0,
      medianPackageLPA: 0,
      peakPackageCR: 0,
      mbdPlacedPercent: null,
      topRecruiters: [],
      sectorBreakdown: [],
      yearWiseTrend: [],
    });
    return;
  }
  res.json(data);
});

router.get("/cutoffs", (req, res) => {
  const { counsellingId, round, year, branch, category, quota, gender, rank } = req.query;

  let result = [...cutoffs];

  if (counsellingId && typeof counsellingId === "string")
    result = result.filter((c) => c.counsellingId === counsellingId);
  if (round) result = result.filter((c) => c.round === Number(round));
  if (year)  result = result.filter((c) => c.year === Number(year));
  if (branch && typeof branch === "string")
    result = result.filter((c) => c.branch.toLowerCase().includes(branch.toLowerCase()));
  if (category && typeof category === "string")
    result = result.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  if (quota && typeof quota === "string")
    result = result.filter((c) => c.quota === quota);
  if (gender && typeof gender === "string")
    result = result.filter((c) => c.gender === gender);
  if (rank) {
    const r = Number(rank);
    result = result.filter((c) => r <= c.closeRank * 1.45);
  }

  res.json(result);
});

router.get("/colleges/:id/cutoffs", (req, res) => {
  const { counsellingId, round, year, branch, category } = req.query;

  let result = cutoffs.filter((c) => c.collegeId === req.params.id);

  if (counsellingId && typeof counsellingId === "string") {
    result = result.filter((c) => c.counsellingId === counsellingId);
  }
  if (round) {
    result = result.filter((c) => c.round === Number(round));
  }
  if (year) {
    result = result.filter((c) => c.year === Number(year));
  }
  if (branch && typeof branch === "string") {
    result = result.filter((c) =>
      c.branch.toLowerCase().includes(branch.toLowerCase())
    );
  }
  if (category && typeof category === "string") {
    result = result.filter(
      (c) => c.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json(result);
});

router.get("/colleges/:id/hostels", (req, res) => {
  const data = hostels[req.params.id];
  if (!data) {
    res.json({
      collegeId: req.params.id,
      totalHostels: 0,
      boysHostels: 0,
      girlsHostels: 0,
      totalCapacity: 0,
      boysCapacity: null,
      girlsCapacity: null,
      feePerYear: null,
      description: null,
      amenities: [],
      hostels: [],
    });
    return;
  }
  res.json(data);
});

router.get("/colleges/:id/departments", (req, res) => {
  const data = departments[req.params.id] ?? [];
  res.json(data);
});

router.get("/colleges/:id/internships", (req, res) => {
  const data = internships[req.params.id];
  if (!data) {
    res.json({
      collegeId: req.params.id,
      year: 2025,
      totalInterns: 0,
      avgStipendPerMonth: 0,
      peakStipendPerMonth: null,
      topCompanies: [],
      internationalInternships: 0,
      conversionToFullTime: null,
    });
    return;
  }
  res.json(data);
});

export default router;
