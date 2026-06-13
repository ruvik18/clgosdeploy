import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useListColleges } from "@workspace/api-client-react";
import {
  ChevronDown,
  Search,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

/* ── types ── */
interface CutoffRow {
  id: string;
  collegeId: string;
  counsellingId: string;
  year: number;
  round: number;
  branch: string;
  branchCode: string;
  category: string;
  quota: string;
  openRank: number;
  closeRank: number;
  gender: string;
}
interface College {
  id: string;
  name: string;
  slug: string;
  type: string;
  location: string;
  logoUrl?: string | null;
  nirfRank?: number;
}

const CATEGORIES = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"];
const QUOTAS = ["AI", "HS", "OS"];
const BRANCH_GROUPS: Record<string, string[]> = {
  "All Branches": [],
  "CSE & IT": [
    "Computer Science",
    "Information Technology",
    "Artificial Intelligence",
    "Data Science",
    "Computing",
  ],
  Electronics: [
    "Electronics",
    "Electrical",
    "Communication",
    "Instrumentation",
  ],
  Mechanical: [
    "Mechanical",
    "Production",
    "Manufacturing",
    "Aerospace",
    "Automotive",
  ],
  Civil: ["Civil", "Environmental", "Infrastructure", "Ocean"],
  Chemical: ["Chemical", "Biochemical", "Polymer", "Material"],
  Mathematics: ["Mathematics", "Statistics", "Engineering Physics"],
};
const COLLEGE_TYPES = ["All Types", "IIT", "NIT", "IIIT", "Other"];

function getLabel(
  rank: number,
  closeRank: number,
): "Safe" | "Moderate" | "Reach" | "Risky" {
  const r = rank / closeRank;
  if (r <= 0.75) return "Safe";
  if (r <= 0.92) return "Moderate";
  if (r <= 1.05) return "Reach";
  return "Risky";
}

const LABEL_STYLE: Record<string, string> = {
  Safe: "bg-[#beffcb] text-[#2a7a3b]",
  Moderate: "bg-[#fff0b3] text-[#7a5e00]",
  Reach: "bg-[#ffd6d6] text-[#9b2c2c]",
  Risky: "bg-[#f4f0ec] text-[#969696]",
};

export default function Branches() {
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [quota, setQuota] = useState("AI");
  const [submitted, setSubmitted] = useState(false);
  const [branchGroup, setBranchGroup] = useState("All Branches");
  const [collegeType, setCollegeType] = useState("All Types");
  const [labelFilter, setLabelFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<"close" | "open" | "alpha">("close");

  const { data: colleges = [] } = useListColleges();
  const collegeMap = useMemo(() => {
    const map: Record<string, College> = {};
    (colleges as College[]).forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [colleges]);

  const { data: cutoffs = [], isFetching } = useQuery<CutoffRow[]>({
    queryKey: ["cutoffs", rank, category, quota],
    queryFn: async () => {
      if (!rank) return [];
      const params = new URLSearchParams({
        category,
        quota,
        rank,
        gender: "Gender-Neutral",
        year: "2026",
      });
      const res = await fetch(`/api/cutoffs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: submitted && !!rank,
    staleTime: 60_000,
  });

  const results = useMemo(() => {
    let rows = cutoffs
      .map((c) => ({
        ...c,
        college: collegeMap[c.collegeId],
        label: getLabel(Number(rank), c.closeRank),
      }))
      .filter((r) => r.college);

    if (branchGroup !== "All Branches") {
      const keywords = BRANCH_GROUPS[branchGroup] || [];
      rows = rows.filter((r) =>
        keywords.some((k) => r.branch.toLowerCase().includes(k.toLowerCase())),
      );
    }
    if (collegeType !== "All Types") {
      rows = rows.filter((r) => r.college?.type === collegeType);
    }
    if (labelFilter !== "All") {
      rows = rows.filter((r) => r.label === labelFilter);
    }

    return rows.sort((a, b) => {
      if (sortBy === "close") return a.closeRank - b.closeRank;
      if (sortBy === "open") return a.openRank - b.openRank;
      return (a.college?.name || "").localeCompare(b.college?.name || "");
    });
  }, [
    cutoffs,
    collegeMap,
    rank,
    branchGroup,
    collegeType,
    labelFilter,
    sortBy,
  ]);

  const displayed = showAll ? results : results.slice(0, 20);

  const counts = useMemo(
    () => ({
      Safe: results.filter((r) => r.label === "Safe").length,
      Moderate: results.filter((r) => r.label === "Moderate").length,
      Reach: results.filter((r) => r.label === "Reach").length,
      Risky: results.filter((r) => r.label === "Risky").length,
    }),
    [results],
  );

  const handleSearch = () => {
    if (rank) {
      setSubmitted(true);
      setShowAll(false);
      setLabelFilter("All");
    }
  };

  return (
    <div className="bg-[#f8f4f0] min-h-screen">
      {/* Header */}
      <section className="pt-14 sm:pt-20 pb-10 px-4 border-b border-[#24341d] ">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs text-lable-base text-[#969696] tracking-widest mb-3">
            Branch Intelligence
          </p>
          <h1 className="text-3xl sm:text-5xl font-medium text-[#241f23] leading-tight mb-3">
            Every branch.
            <br />
            Every college.
            <br />
            Your rank.
          </h1>
          <p className="text-sm sm:text-base text-[#969696] max-w-xl mb-8">
            See all branches available at every JoSAA college for your rank and
            category — not just CSE at top colleges. Discover options you never
            knew existed.
          </p>

          {/* Rank input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696]" />
              <input
                type="number"
                value={rank}
                min={1}
                onChange={(e) => setRank(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter your JEE rank (e.g. 8500)"
                className="w-full h-12 pl-10 pr-4 border border-[#24341d] rounded-[4px] text-base focus:outline-none focus:border-black bg-[#f8f4f0]"
              />
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-12 px-4 pr-8 border border-[#24341d] rounded-[4px] bg-[#f8f4f0] appearance-none focus:outline-none text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696] pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="h-12 px-4 pr-8 border border-[#24341d] rounded-[4px] bg-[#f8f4f0] appearance-none focus:outline-none text-sm"
              >
                {QUOTAS.map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696] pointer-events-none" />
            </div>
            <button
              onClick={handleSearch}
              disabled={!rank}
              className="h-12 px-6 bg-[#241f23] text-white rounded-[4px] text-sm font-medium hover:bg-black transition-colors disabled:opacity-40 shrink-0"
            >
              Find Branches
            </button>
          </div>
          <p className="text-xs text-[#969696] mt-2">
            JoSAA 2026 · Round 1 · Gender-Neutral seats
          </p>
        </div>
      </section>

      {/* Results */}
      {submitted && (
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            {isFetching ? (
              <div className="text-center py-16 text-[#969696] text-sm animate-pulse">
                Loading branches for rank {Number(rank).toLocaleString("en-IN")}
                …
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-[#241f23] mb-2">
                  No branches found
                </p>
                <p className="text-sm text-[#969696]">
                  Your rank may be outside the range of our 2026 JoSAA dataset.
                </p>
              </div>
            ) : (
              <>
                {/* Stats bar */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div>
                    <p className="text-lg font-medium text-[#241f23]">
                      {results.length} branches available
                    </p>
                    <p className="text-xs text-[#969696]">
                      for rank {Number(rank).toLocaleString("en-IN")} ·{" "}
                      {category} · {quota}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap ml-auto">
                    <span className="text-[10px] bg-[#beffcb] text-[#2a7a3b] px-2.5 py-1 rounded-full font-bold">
                      {counts.Safe} Safe
                    </span>
                    <span className="text-[10px] bg-[#fff0b3] text-[#7a5e00] px-2.5 py-1 rounded-full font-bold">
                      {counts.Moderate} Moderate
                    </span>
                    <span className="text-[10px] bg-[#ffd6d6] text-[#9b2c2c] px-2.5 py-1 rounded-full font-bold">
                      {counts.Reach} Reach
                    </span>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4 items-center">
                  <SlidersHorizontal className="w-4 h-4 text-[#969696] shrink-0" />

                  {/* Branch group */}
                  <div className="relative">
                    <select
                      value={branchGroup}
                      onChange={(e) => setBranchGroup(e.target.value)}
                      className="h-8 px-3 pr-7 text-xs border border-[#d1d5db] rounded-full bg-white focus:outline-none focus:border-[#24341d] appearance-none"
                    >
                      {Object.keys(BRANCH_GROUPS).map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#969696] pointer-events-none" />
                  </div>

                  {/* College type */}
                  <div className="relative">
                    <select
                      value={collegeType}
                      onChange={(e) => setCollegeType(e.target.value)}
                      className="h-8 px-3 pr-7 text-xs border border-[#d1d5db] rounded-full bg-white focus:outline-none focus:border-[#24341d] appearance-none"
                    >
                      {COLLEGE_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#969696] pointer-events-none" />
                  </div>

                  {/* Safety filter */}
                  {(["All", "Safe", "Moderate", "Reach"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLabelFilter(l)}
                      className={`h-8 px-3 text-xs rounded-full border transition-colors ${
                        labelFilter === l
                          ? "bg-[#241f23] text-white border-[#241f23]"
                          : "bg-white text-[#969696] border-[#d1d5db] hover:border-[#24341d]"
                      }`}
                    >
                      {l}
                    </button>
                  ))}

                  {/* Sort */}
                  <div className="relative ml-auto">
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "close" | "open" | "alpha")
                      }
                      className="h-8 px-3 pr-7 text-xs border border-[#d1d5db] rounded-full bg-white focus:outline-none focus:border-[#24341d] appearance-none"
                    >
                      <option value="close">Sort: Closing Rank</option>
                      <option value="open">Sort: Opening Rank</option>
                      <option value="alpha">Sort: College Name</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#969696] pointer-events-none" />
                  </div>
                </div>

                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_40px] gap-3 px-4 py-2 text-[10px] font-bold text-[#969696] tracking-widest border-b border-[#24341d] mb-1">
                  <span>COLLEGE</span>
                  <span>BRANCH</span>
                  <span className="text-right">OPEN RANK</span>
                  <span className="text-right">CLOSE RANK</span>
                  <span className="text-right">STATUS</span>
                  <span />
                </div>

                {/* Rows */}
                <div className="space-y-1">
                  {displayed.map((row) => (
                    <div
                      key={row.id}
                      className="bg-white border border-[#e5e7eb] hover:border-[#24341d] rounded-lg transition-colors duration-150 group"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_40px] gap-2 sm:gap-3 items-center px-4 py-3">
                        {/* College */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CollegeLogo college={row.college} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#241f23] line-clamp-1">
                              {row.college?.name}
                            </p>
                            <p className="text-[10px] text-[#969696]">
                              {row.college?.type}
                              {row.college?.nirfRank
                                ? ` · NIRF #${row.college.nirfRank}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        {/* Branch */}
                        <p className="text-xs text-[#241f23] font-medium line-clamp-2 sm:line-clamp-1">
                          {row.branch}
                        </p>
                        {/* Open rank */}
                        <p className="text-xs text-[#969696] text-right tabular-nums hidden sm:block">
                          {row.openRank.toLocaleString("en-IN")}
                        </p>
                        {/* Close rank */}
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-[#241f23] tabular-nums">
                            {row.closeRank.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-[#969696]">closing</p>
                        </div>
                        {/* Status — mobile: inline */}
                        <div className="flex sm:justify-end gap-2 items-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${LABEL_STYLE[row.label]}`}
                          >
                            {row.label}
                          </span>
                          <span className="sm:hidden text-xs text-[#969696]">
                            Close: {row.closeRank.toLocaleString("en-IN")}
                          </span>
                        </div>
                        {/* Link */}
                        <Link
                          href={`/colleges/${row.college?.slug}`}
                          className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full border border-[#e5e7eb] text-[#969696] group-hover:border-[#24341d] group-hover:text-[#241f23] transition-colors duration-150 ml-auto"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {!showAll && results.length > 20 && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="mt-4 w-full py-3 border border-[#24341d] rounded-lg text-sm text-[#241f23] hover:bg-white transition-colors duration-150"
                  >
                    Show all {results.length} branches
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Empty state / guide */}
      {!submitted && (
        <section className="py-14 px-4">
          <div className="container mx-auto max-w-3xl">
            <p className="text-xs font-bold text-[#969696] tracking-widest mb-6">
              WHAT YOU CAN DO HERE
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#24341d] border border-[#24341d]">
              {[
                {
                  t: "See every option",
                  d: "Not just CSE at top colleges. Discover civil at IIT Bombay, electronics at NIT Warangal, all for your exact rank.",
                },
                {
                  t: "Filter by branch",
                  d: "Looking for CSE, ECE, or Mechanical? Filter to exactly the branch family you want — across all colleges at once.",
                },
                {
                  t: "Know your safety",
                  d: "Every row is colour-coded Safe / Moderate / Reach / Risky so you know instantly which ones are in your comfort zone.",
                },
              ].map((c) => (
                <div key={c.t} className="bg-white p-6">
                  <h3 className="text-sm font-medium text-[#241f23] mb-2">
                    {c.t}
                  </h3>
                  <p className="text-xs text-[#969696] leading-relaxed">
                    {c.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function CollegeLogo({ college }: { college?: College }) {
  if (!college)
    return <div className="w-8 h-8 rounded-full bg-[#f4f0ec] shrink-0" />;
  const logoSrc = college.logoUrl || `/logos/${college.slug}.png`;
  return (
    <img
      src={logoSrc}
      alt={college.name}
      onError={(e) => {
        const el = e.currentTarget;
        el.style.display = "none";
        const fb = el.nextElementSibling as HTMLElement | null;
        if (fb) fb.style.display = "flex";
      }}
      className="w-8 h-8 rounded-full object-contain bg-white border border-[#e5e7eb] p-0.5 shrink-0"
    />
  );
}
