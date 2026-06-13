import { Router } from "express";
import { colleges, counsellings, cutoffs } from "../data/loader.js";

const router = Router();

router.get("/stats", (_req, res) => {
  const states = new Set(colleges.map((c) => c.state));
  const topIITs = colleges.filter((c) => c.type === "IIT").length;
  const topNITs = colleges.filter((c) => c.type === "NIT").length;

  res.json({
    totalColleges: colleges.length,
    totalCounsellings: counsellings.length,
    totalCutoffRecords: cutoffs.length,
    totalStates: states.size,
    lastUpdated: "2026-06-11",
    topIITs,
    topNITs,
  });
});

export default router;
