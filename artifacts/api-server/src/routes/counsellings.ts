import { Router } from "express";
import {
  counsellings,
  counsellingById,
  colleges,
  rounds,
} from "../data/loader.js";

const router = Router();

router.get("/counsellings", (_req, res) => {
  const result = counsellings.map(({ importantDates: _id, ...c }) => c);
  res.json(result);
});

router.get("/counsellings/:id", (req, res) => {
  const c = counsellingById.get(req.params.id);
  if (!c) {
    res.status(404).json({ error: "Counselling not found" });
    return;
  }

  const linkedColleges = colleges
    .filter((col) => col.counsellings.includes(c.id))
    .map((col) => ({
      id: col.id,
      name: col.name,
      slug: col.slug,
      location: col.location,
      state: col.state,
      type: col.type,
      established: col.established,
      naacGrade: col.naacGrade,
      logoUrl: col.logoUrl,
      tagline: col.tagline ?? null,
      avgPackageLPA: col.avgPackageLPA,
      peakPackageCR: col.peakPackageCR,
      cseCutoffRank: col.cseCutoffRank,
      nirfRank: col.nirfRank,
      featured: col.featured,
    }));

  res.json({ ...c, colleges: linkedColleges });
});

router.get("/counsellings/:id/rounds", (req, res) => {
  const c = counsellingById.get(req.params.id);
  if (!c) {
    res.status(404).json({ error: "Counselling not found" });
    return;
  }
  const filtered = rounds.filter((r) => r.counsellingId === c.id);
  res.json(filtered);
});

export default router;
