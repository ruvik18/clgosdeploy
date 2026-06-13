import { Router } from "express";
import {
  counsellingById,
  colleges,
  cutoffs,
} from "../data/loader.js";

const router = Router();

router.get("/counsellings/:id/predict", (req, res) => {
  const counselling = counsellingById.get(req.params.id);
  if (!counselling) {
    res.status(404).json({ error: "Counselling not found" });
    return;
  }

  const {
    jeeMainRank,
    jeeMainCategoryRank,
    jeeAdvancedRank,
    jeeAdvancedCategoryRank,
    category = "OPEN",
    gender = "Gender-Neutral",
    homeState = "",
    round = "6",
    year = "2025",
  } = req.query;

  const jeeMain = jeeMainRank ? Number(jeeMainRank) : null;
  const jeeMainCat = jeeMainCategoryRank ? Number(jeeMainCategoryRank) : null;
  const jeeAdv = jeeAdvancedRank ? Number(jeeAdvancedRank) : null;
  const jeeAdvCat = jeeAdvancedCategoryRank ? Number(jeeAdvancedCategoryRank) : null;
  const targetRound = Number(round);
  const targetYear = Number(year);
  const cat = String(category);
  const genderStr = String(gender);
  const homeStateStr = String(homeState).toLowerCase();

  if (!jeeMain && !jeeAdv) {
    res.status(400).json({ error: "Provide at least one rank (jeeMainRank or jeeAdvancedRank)" });
    return;
  }

  const counsellingColleges = colleges.filter((c) =>
    c.counsellings.includes(counselling.id)
  );

  interface MatchedBranch {
    branch: string;
    branchCode: string | null;
    category: string;
    quota: string | null;
    openRank: number;
    closeRank: number;
    round: number;
    year: number;
    gender: string | null;
  }

  interface PredictedCollege {
    id: string;
    name: string;
    slug: string;
    type: string;
    nirfRank: number | null;
    state: string;
    location: string;
    matchingPrograms: number;
    bestCloseRank: number;
    branches: MatchedBranch[];
  }

  const results: PredictedCollege[] = [];

  for (const college of counsellingColleges) {
    const isIIT = college.type === "IIT";

    const collegeCutoffs = cutoffs.filter(
      (c) => c.collegeId === college.id
    );

    if (collegeCutoffs.length === 0) continue;

    const matchedBranches: MatchedBranch[] = [];

    const isHomeState =
      homeStateStr &&
      college.state.toLowerCase() === homeStateStr;

    for (const cutoff of collegeCutoffs) {
      if (cutoff.year !== targetYear) continue;
      if (cutoff.round !== targetRound) continue;

      const cutoffQuota = (cutoff.quota || "AI").toUpperCase();

      if (isIIT) {
        if (cutoffQuota !== "AI") continue;
      } else {
        if (cutoffQuota === "AI") continue;
        if (isHomeState && cutoffQuota === "OS") continue;
        if (!isHomeState && cutoffQuota === "HS") continue;
      }

      const isFemaleOnly = cutoff.gender === "Female-only";
      if (isFemaleOnly && genderStr !== "Female") continue;

      const isCategoryMatch = cutoff.category === cat || cutoff.category === "OPEN";

      let userRank: number | null = null;

      if (isIIT) {
        if (cutoff.category === cat && jeeAdvCat) {
          userRank = jeeAdvCat;
        } else if (cutoff.category === "OPEN" || cutoff.category === cat) {
          userRank = jeeAdv;
        }
      } else {
        if (cutoff.category === cat && cutoff.category !== "OPEN" && jeeMainCat) {
          userRank = jeeMainCat;
        } else if (cutoff.category === "OPEN" || cutoff.category === cat) {
          userRank = jeeMain;
        }
      }

      if (userRank === null) continue;
      if (!isCategoryMatch) continue;

      if (userRank <= cutoff.closeRank) {
        matchedBranches.push({
          branch: cutoff.branch,
          branchCode: cutoff.branchCode,
          category: cutoff.category,
          quota: cutoff.quota,
          openRank: cutoff.openRank,
          closeRank: cutoff.closeRank,
          round: cutoff.round,
          year: cutoff.year,
          gender: cutoff.gender,
        });
      }
    }

    if (matchedBranches.length === 0) continue;

    matchedBranches.sort((a, b) => a.closeRank - b.closeRank);
    const bestCloseRank = matchedBranches[0].closeRank;

    results.push({
      id: college.id,
      name: college.name,
      slug: college.slug,
      type: college.type,
      nirfRank: college.nirfRank,
      state: college.state,
      location: college.location,
      matchingPrograms: matchedBranches.length,
      bestCloseRank,
      branches: matchedBranches,
    });
  }

  results.sort((a, b) => {
    if (a.nirfRank !== null && b.nirfRank !== null) {
      return a.nirfRank - b.nirfRank;
    }
    if (a.nirfRank === null) return 1;
    if (b.nirfRank === null) return -1;
    return 0;
  });

  res.json({
    total: results.length,
    counsellingId: counselling.id,
    counsellingName: counselling.name,
    round: targetRound,
    year: targetYear,
    colleges: results,
  });
});

export default router;
