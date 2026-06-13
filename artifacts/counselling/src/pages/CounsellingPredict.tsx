import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCounselling } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarLogo } from "@/components/ui/avatar-logo";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

const CATEGORIES = [
  "OPEN",
  "OBC-NCL",
  "OBC-NCL-PWD",
  "SC",
  "SC-PWD",
  "ST",
  "ST-PWD",
  "EWS",
  "EWS-PWD",
];
const GENDERS = ["Male", "Female", "Other"];

const SPECIAL_QUOTAS = [
  {
    key: "pwd",
    label: "Person with Disability (PwD)",
    desc: "Unlocks PwD-reserved seats across counsellings.",
  },
  {
    key: "defence",
    label: "Defence personnel ward",
    desc: "Ward of serving / ex-serving armed forces (CW quota for JAC, DEF for MHT-CET, etc.).",
  },
  { key: "orphan", label: "Orphan", desc: "AICTE / state orphan-quota seats." },
  {
    key: "tfws",
    label: "Tuition Fee Waiver (TFWS)",
    desc: "Income-linked fee-waiver seats in private institutes.",
  },
  {
    key: "minority",
    label: "Minority (religious or linguistic)",
    desc: "Minority-institute seats (Christian / Jain / Muslim / Sindhi / Gujarati etc.).",
  },
  {
    key: "sgc",
    label: "Single Girl Child",
    desc: "JAC Delhi SG quota (General + Delhi domicile only).",
  },
  {
    key: "km",
    label: "Kashmiri Migrant",
    desc: "KM quota across central counsellings.",
  },
];

interface Profile {
  name: string;
  gender: string;
  category: string;
  homeState: string;
  city: string;
  quotas: string[];
  mobile: string;
}

interface Ranks {
  jeeMainRank: string;
  jeeMainCategoryRank: string;
  noJeeMainCategoryRank: boolean;
  jeeAdvancedRank: string;
  jeeAdvancedCategoryRank: string;
  noJeeAdvanced: boolean;
}

interface MatchedBranch {
  branch: string;
  branchCode: string | null;
  category: string;
  quota: string | null;
  openRank: number;
  closeRank: number;
  round: number;
  year: number;
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

interface PredictResults {
  total: number;
  counsellingId: string;
  counsellingName: string;
  round: number;
  year: number;
  colleges: PredictedCollege[];
}

const TYPE_COLORS: Record<string, string> = {
  IIT: "bg-red-100 text-red-700",
  NIT: "bg-blue-100 text-blue-700",
  IIIT: "bg-purple-100 text-purple-700",
  GFTI: "bg-green-100 text-green-700",
};

function StepIndicator({ step, total = 3 }: { step: number; total?: number }) {
  const labels = ["Exam", "Review", "Results"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                i + 1 < step
                  ? "bg-[#241f23] border-[#241f23] text-white"
                  : i + 1 === step
                    ? "bg-[#241f23] border-[#241f23] text-white"
                    : "bg-white border-[#d1d5db] text-[#969696]"
              }`}
            >
              {i + 1 < step ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-bold mt-2 ${i + 1 === step ? "text-[#241f23]" : "text-[#969696]"}`}
            >
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div
              className={`w-24 md:w-40 h-0.5 mb-5 mx-2 transition-colors ${i + 1 < step ? "bg-[#241f23]" : "bg-[#d1d5db]"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const inputCls =
  "w-full border border-[#d1d5db] rounded-[4px] px-4 py-3 text-sm font-medium text-[#241f23] bg-white focus:outline-none focus:border-black placeholder-[#969696]";
const selectCls =
  "w-full border border-[#d1d5db] rounded-[4px] px-4 py-3 text-sm font-medium text-[#241f23] bg-white focus:outline-none focus:border-black cursor-pointer";
const labelCls = "block text-sm font-bold text-[#241f23] mb-2";
const helperGreenCls = "text-xs font-medium text-green-600 mt-1";
const helperRedCls = "text-xs font-medium text-red-600 mt-1";

export default function CounsellingPredict({
  params,
}: {
  params: { slug: string };
}) {
  const [, navigate] = useLocation();
  const { data: counselling, isLoading } = useGetCounselling(params.slug);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    gender: "",
    category: "",
    homeState: "",
    city: "",
    quotas: [],
    mobile: "",
  });
  const [ranks, setRanks] = useState<Ranks>({
    jeeMainRank: "",
    jeeMainCategoryRank: "",
    noJeeMainCategoryRank: false,
    jeeAdvancedRank: "",
    jeeAdvancedCategoryRank: "",
    noJeeAdvanced: false,
  });
  const [results, setResults] = useState<PredictResults | null>(null);
  const [activeRound, setActiveRound] = useState(6);
  const [isLoading2, setIsLoading2] = useState(false);
  const [error, setError] = useState("");

  const ROUND_YEAR_MAP: Record<number, number | null> = {
    1: 2026,
    2: null,
    3: null,
    4: null,
    5: null,
    6: 2025,
  };

  const getYearForRound = (round: number) => ROUND_YEAR_MAP[round] ?? null;

  const toggleQuota = (key: string) => {
    setProfile((p) => ({
      ...p,
      quotas: p.quotas.includes(key)
        ? p.quotas.filter((q) => q !== key)
        : [...p.quotas, key],
    }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !profile.name ||
      !profile.gender ||
      !profile.category ||
      !profile.homeState
    )
      return;
    setStep(2);
  };

  const buildQs = (round: number) => {
    const year = getYearForRound(round);
    const qs = new URLSearchParams();
    if (ranks.jeeMainRank) qs.set("jeeMainRank", ranks.jeeMainRank);
    if (!ranks.noJeeMainCategoryRank && ranks.jeeMainCategoryRank)
      qs.set("jeeMainCategoryRank", ranks.jeeMainCategoryRank);
    if (!ranks.noJeeAdvanced && ranks.jeeAdvancedRank)
      qs.set("jeeAdvancedRank", ranks.jeeAdvancedRank);
    if (!ranks.noJeeAdvanced && ranks.jeeAdvancedCategoryRank)
      qs.set("jeeAdvancedCategoryRank", ranks.jeeAdvancedCategoryRank);
    qs.set("category", profile.category);
    qs.set("gender", profile.gender === "Female" ? "Female" : "Male");
    qs.set("homeState", profile.homeState);
    qs.set("round", String(round));
    if (year !== null) qs.set("year", String(year));
    return qs;
  };

  const handleRanksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ranks.jeeMainRank && !ranks.jeeAdvancedRank) {
      setError("Please enter at least one rank.");
      return;
    }
    setError("");
    setIsLoading2(true);
    try {
      const qs = buildQs(activeRound);
      const resp = await fetch(
        `/api/counsellings/${params.slug}/predict?${qs.toString()}`,
      );
      if (!resp.ok) throw new Error("Prediction failed");
      const data: PredictResults = await resp.json();
      setResults(data);
      setActiveRound(data.round);
      setStep(3);
    } catch (err) {
      setError("Could not load predictions. Please try again.");
    } finally {
      setIsLoading2(false);
    }
  };

  const handleRoundChange = async (round: number) => {
    const year = getYearForRound(round);
    setActiveRound(round);
    if (!results || year === null) return;
    setIsLoading2(true);
    try {
      const qs = buildQs(round);
      const resp = await fetch(
        `/api/counsellings/${params.slug}/predict?${qs.toString()}`,
      );
      if (!resp.ok) throw new Error();
      const data: PredictResults = await resp.json();
      setResults(data);
    } catch {
    } finally {
      setIsLoading2(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-12">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (!counselling)
    return (
      <div className="p-12 text-center text-[#969696]">
        Counselling not found
      </div>
    );

  return (
    <div className="bg-[#f8f4f0] min-h-screen pb-24">
      {/* Page Header */}
      <div className="border-b border-[#24341d]">
        <div className="container mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-3">
          <Link
            href={`/counsellings/${params.slug}`}
            className="flex items-center gap-1.5 text-sm font-sans text-[#969696] hover:text-[#241f23] transition-colors group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#f4f0ec] border border-[#24341d] flex items-center justify-center font-bold text-[#969696] shrink-0 text-sm">
              {counselling.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-sans text-base sm:text-xl md:text-2xl lg:text-3xl text-[#241f23] truncate">
                {counselling.name}
              </div>
              <div className="text-[10px] sm:text-xs text-[#969696] font-data-base">
                {counselling.type} · {counselling.level}
              </div>
            </div>
            <span className="hidden sm:inline text-xs font-sans bg-[#f4f0ec] px-3 py-1 rounded-full text-[#969696] whitespace-nowrap shrink-0">
              {counselling.startMonth?.substring(0, 3).toUpperCase()} –{" "}
              {counselling.endMonth?.substring(0, 3).toUpperCase()}{" "}
              {counselling.startYear}
            </span>
          </div>
          <div className="w-8 sm:w-20 shrink-0" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <StepIndicator step={step} />

        {/* ── STEP 1: Profile ── */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-medium tracking-tight text-[#241f23] mb-2">
                Update your basics.
              </h1>
              <p className="text-[#969696] font-sans">
                Fill in your profile. This powers state-quota and category-based
                cutoff matching.
              </p>
            </div>
            <form
              onSubmit={handleProfileSubmit}
              className="bg-white rounded-xl border border-[#24341d] p-8 space-y-6"
            >
              <div>
                <label className={labelCls}>Full name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  required
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Gender *</label>
                  <select
                    value={profile.gender}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, gender: e.target.value }))
                    }
                    required
                    className={selectCls}
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Category *</label>
                  <select
                    value={profile.category}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, category: e.target.value }))
                    }
                    required
                    className={selectCls}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <p className={helperRedCls}>Affects rank cutoffs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Home state *</label>
                  <select
                    value={profile.homeState}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, homeState: e.target.value }))
                    }
                    required
                    className={selectCls}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <p className={helperGreenCls}>For state-quota cutoffs</p>
                </div>
                <div>
                  <label className={labelCls}>Current city *</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="e.g. Hyderabad"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Special quotas{" "}
                  <span className="font-sans text-[#969696]">(optional)</span>
                </label>
                <p className="text-xs text-[#969696] font-sans mb-4">
                  Tick anything that applies. These unlock extra seat buckets in
                  your predictions — leave them all unticked if none apply.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SPECIAL_QUOTAS.map((q) => (
                    <label
                      key={q.key}
                      className={`flex gap-3 p-4 rounded-[4px] border cursor-pointer transition-colors ${
                        profile.quotas.includes(q.key)
                          ? "border-[#24341d] bg-[#f4f0ec]"
                          : "border-[#24341d] bg-white hover:border-[#969696]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={profile.quotas.includes(q.key)}
                        onChange={() => toggleQuota(q.key)}
                        className="mt-0.5 shrink-0"
                      />
                      <div>
                        <div className="text-sm font-sans text-[#241f23]">
                          {q.label}
                        </div>
                        <div className="text-xs text-[#969696] font-medium mt-0.5">
                          {q.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Mobile{" "}
                  <span className="font-sans text-[#969696]">(optional)</span>
                </label>
                <div className="flex">
                  <span className="flex items-center px-4 border border-r-0 border-[#d1d5db] rounded-l-[4px] bg-[#f4f0ec] text-sm font-bold text-[#969696]">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={profile.mobile}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, mobile: e.target.value }))
                    }
                    placeholder="10-digit number"
                    className={`${inputCls} rounded-l-none`}
                  />
                </div>
                <p className={helperGreenCls}>
                  We'll notify you when {counselling.name} rounds close. Skip it
                  — predictor still works.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#d1beff] text-[#111111] hover:bg-[#352d33] hover:text-white border border-[#24341d] font-sans rounded-[4px] hover:bg-black transition-colors flex items-center justify-center gap-2 group"
              >
                <span>Save changes</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Ranks ── */}
        {step === 2 && (
          <div>
            {/* Profile summary */}
            <div className="mb-6 flex items-center justify-between bg-white border border-[#d1d5db] rounded-[4px] px-5 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-sans text-[#969696] tracking-widest mr-2">
                  YOUR DETAILS
                </span>
                {[
                  profile.name,
                  profile.category,
                  profile.gender,
                  profile.homeState,
                  profile.city,
                ]
                  .filter(Boolean)
                  .map((v, i) => (
                    <span
                      key={i}
                      className="text-xs text-data-base bg-[#f4f0ec] px-2 py-1 rounded-[2px] text-[#241f23]"
                    >
                      {v}
                    </span>
                  ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#241f23] hover:underline shrink-0 ml-4 flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" />
                <span>EDIT</span>
              </button>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-medium tracking-tight text-[#241f23] mb-2">
                {counselling.name} — your ranks
              </h1>
              <p className="text-[#969696] font-sans">
                JEE Main rank powers NIT / IIIT / GFTI cutoffs. JEE Advanced
                rank powers IIT cutoffs.
              </p>
            </div>

            <form
              onSubmit={handleRanksSubmit}
              className="bg-white rounded-xl border border-[#24341d] p-8 space-y-6"
            >
              <div>
                <label className={labelCls}>JEE Main rank (CRL)</label>
                <input
                  type="number"
                  value={ranks.jeeMainRank}
                  onChange={(e) =>
                    setRanks((r) => ({ ...r, jeeMainRank: e.target.value }))
                  }
                  placeholder="e.g. 12345"
                  min={1}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>JEE Main category rank</label>
                <input
                  type="number"
                  value={
                    ranks.noJeeMainCategoryRank ? "" : ranks.jeeMainCategoryRank
                  }
                  onChange={(e) =>
                    setRanks((r) => ({
                      ...r,
                      jeeMainCategoryRank: e.target.value,
                    }))
                  }
                  placeholder="e.g. 4500"
                  min={1}
                  disabled={ranks.noJeeMainCategoryRank}
                  className={`${inputCls} ${ranks.noJeeMainCategoryRank ? "opacity-40 cursor-not-allowed" : ""}`}
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ranks.noJeeMainCategoryRank}
                    onChange={(e) =>
                      setRanks((r) => ({
                        ...r,
                        noJeeMainCategoryRank: e.target.checked,
                      }))
                    }
                    className="cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[#969696]">
                    I don't have a separate category rank
                  </span>
                </label>
                <p className={helperGreenCls}>
                  NIT / IIIT / GFTI seats reserved for your category.
                </p>
              </div>

              <div className="border-t border-[#f4f0ec] pt-6">
                <label className={labelCls}>JEE Advanced rank</label>
                <input
                  type="number"
                  value={ranks.noJeeAdvanced ? "" : ranks.jeeAdvancedRank}
                  onChange={(e) =>
                    setRanks((r) => ({ ...r, jeeAdvancedRank: e.target.value }))
                  }
                  placeholder="e.g. 8765"
                  min={1}
                  disabled={ranks.noJeeAdvanced}
                  className={`${inputCls} ${ranks.noJeeAdvanced ? "opacity-40 cursor-not-allowed" : ""}`}
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ranks.noJeeAdvanced}
                    onChange={(e) =>
                      setRanks((r) => ({
                        ...r,
                        noJeeAdvanced: e.target.checked,
                      }))
                    }
                    className="cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[#969696]">
                    I didn't qualify for JEE Advanced
                  </span>
                </label>
                <p className={helperRedCls}>Required for IIT cutoffs.</p>
              </div>

              <div>
                <label className={labelCls}>JEE Advanced category rank</label>
                <input
                  type="number"
                  value={
                    ranks.noJeeAdvanced ? "" : ranks.jeeAdvancedCategoryRank
                  }
                  onChange={(e) =>
                    setRanks((r) => ({
                      ...r,
                      jeeAdvancedCategoryRank: e.target.value,
                    }))
                  }
                  placeholder="e.g. 1200"
                  min={1}
                  disabled={ranks.noJeeAdvanced}
                  className={`${inputCls} ${ranks.noJeeAdvanced ? "opacity-40 cursor-not-allowed" : ""}`}
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading2}
                className="w-full py-4 bg-[#241f23] font-sans rounded-[4px] bg-[#d1beff] text-[#111111] hover:bg-[#352d33] hover:text-white border border-[#24341d] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 group"
              >
                <span>{isLoading2 ? "Predicting..." : "PREDICT COLLEGES"}</span>
                {!isLoading2 && (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && results && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link
                href={`/counsellings/${params.slug}`}
                className="text-sm font-bold text-[#969696] hover:text-[#241f23] transition-colors flex items-center gap-1.5 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>BACK TO COUNSELLING</span>
              </Link>
              <button
                onClick={() => setStep(2)}
                className="text-sm font-bold text-[#241f23] hover:underline flex items-center gap-1 group"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>EDIT MY ANSWERS</span>
              </button>
            </div>

            <div className="mb-8">
              <p className="text-sm font-bold text-[#969696] tracking-widest mb-2">
                — {results.total} PREDICTED COLLEGES
              </p>
              <h1 className="text-4xl font-medium tracking-tight text-[#241f23] mb-2">
                {results.total} matches
              </h1>
              <p className="text-[#969696] font-medium">
                Round {activeRound} · {results.counsellingName} · using your JEE
                Main + Advanced ranks, category, home state, and branch
                preferences.
              </p>
            </div>

            {/* Round pills */}
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              {[1, 2, 3, 4, 5, 6].map((r) => {
                const hasData = getYearForRound(r) !== null;
                const roundYear = getYearForRound(r);
                return (
                  <div key={r} className="relative group/pill">
                    <button
                      onClick={() => hasData ? handleRoundChange(r) : undefined}
                      disabled={!hasData}
                      title={hasData ? `R${r} · ${roundYear} data` : "No data yet for this round"}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                        !hasData
                          ? "bg-[#f4f0ec] border border-[#d1d5db] text-[#c4c0bc] cursor-not-allowed"
                          : activeRound === r
                            ? "bg-[#241f23] text-white"
                            : "bg-white border border-[#d1d5db] text-[#969696] hover:border-[#241f23] hover:text-[#241f23]"
                      }`}
                    >
                      R{r}
                      {hasData && (
                        <span className="ml-1 text-[9px] opacity-60">{String(roundYear).slice(2)}</span>
                      )}
                    </button>
                    {!hasData && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pill:block z-20 pointer-events-none">
                        <div className="bg-[#241f23] text-white text-[10px] font-sans px-2 py-1 rounded whitespace-nowrap">
                          No data yet
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <span className="ml-auto text-xs font-bold text-[#969696]">
                {isLoading2
                  ? "Loading..."
                  : `${results.colleges.length} colleges`}
              </span>
            </div>

            {getYearForRound(activeRound) === null ? (
              <div className="bg-white rounded-xl border border-[#d1d5db] p-12 text-center">
                <p className="text-xl font-bold text-[#241f23] mb-2">
                  No data for this round yet
                </p>
                <p className="text-[#969696] font-medium text-sm">
                  We have data for <strong>Round 1 (2026)</strong> and <strong>Round 6 (2025)</strong>. More rounds will be added as JoSAA releases them.
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => handleRoundChange(6)}
                    className="text-sm font-bold border border-[#241f23] px-5 py-2 rounded-[4px] hover:bg-[#241f23] hover:text-white transition-colors"
                  >
                    R6 · 2025
                  </button>
                  <button
                    onClick={() => handleRoundChange(1)}
                    className="text-sm font-bold border border-[#241f23] px-5 py-2 rounded-[4px] hover:bg-[#241f23] hover:text-white transition-colors"
                  >
                    R1 · 2026
                  </button>
                </div>
              </div>
            ) : results.colleges.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#d1d5db] p-12 text-center">
                <p className="text-xl font-bold text-[#241f23] mb-2">
                  No matches found
                </p>
                <p className="text-[#969696] font-medium text-sm">
                  Your rank may be above the closing ranks for this round. Try R6 (2025) for broader results, or check your category and home state.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="mt-6 text-sm font-bold border border-[#241f23] px-6 py-2 rounded-[4px] hover:bg-[#241f23] hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span>ADJUST MY RANKS</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.colleges.map((college, idx) => (
                  <div
                    key={college.id}
                    className="bg-white rounded-xl border border-[#24341d]/50 p-5 sm:p-6 hover:shadow-md transition-shadow flex flex-col relative"
                  >
                    <div className="absolute top-4 right-4 bg-[#f8f4f0] text-[#241f23] text-[10px] font-sans px-2 py-1 rounded-sm">
                      #{idx + 1} MATCH
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <AvatarLogo
                        src={`/logos/${college.slug}.png`}
                        alt={college.name}
                        fallback={college.type.charAt(0)}
                        type={college.type}
                        size="md"
                        rounded="full"
                      />
                      <div className="min-w-0 pr-12">
                        <Link href={`/colleges/${college.slug}`}>
                          <h3 className="text-base sm:text-lg font-bold text-[#241f23] hover:underline leading-tight line-clamp-1">
                            {college.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-[#969696] mt-0.5">
                          {college.location}, {college.state}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-[4px] ${TYPE_COLORS[college.type] || "bg-gray-100 text-gray-700"}`}
                      >
                        {college.type}
                      </span>
                      {college.nirfRank && (
                        <span className="text-xs font-bold bg-[#f4f0ec] text-[#241f23] px-2 py-1 rounded-[4px]">
                          NIRF #{college.nirfRank}
                        </span>
                      )}
                      <span className="text-xs font-bold bg-[#beffcb] text-[#241f23] px-2 py-1 rounded-[4px]">
                        {college.matchingPrograms} programs
                      </span>
                    </div>

                    <div className="border-t border-[#f4f0ec] pt-4 space-y-2 flex-1 mb-4">
                      {college.branches.slice(0, 4).map((branch, bi) => (
                        <div
                          key={bi}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-[#f4f0ec] flex items-center justify-center text-xs font-bold shrink-0 text-[#241f23]">
                              {bi + 1}
                            </span>
                            <span className="text-[#241f23] font-medium truncate text-xs sm:text-sm">
                              {branch.branch}
                            </span>
                          </div>
                          <span className="font-bold text-[#241f23] ml-3 shrink-0 text-xs sm:text-sm">
                            {branch.closeRank.toLocaleString("en-IN")}
                            <span className="text-[#969696] font-medium text-[10px] ml-1">
                              CL
                            </span>
                          </span>
                        </div>
                      ))}
                      {college.branches.length > 4 && (
                        <div className="text-xs font-bold text-[#969696] text-center pt-1">
                          +{college.branches.length - 4} more programs
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/colleges/${college.slug}`}
                      className="flex items-center justify-center gap-1.5 text-xs font-sans border border-[#24341d] py-2 rounded-[4px] bg-[#d1beff] text-[#111111] hover:bg-[#352d33] hover:text-white transition-colors group mt-auto"
                    >
                      <span>VIEW DASHBOARD</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
