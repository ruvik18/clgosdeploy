import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListColleges } from "@workspace/api-client-react";
import { AvatarLogo } from "@/components/ui/avatar-logo";
import { ArrowRight, ChevronDown, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface College {
  id: string;
  name: string;
  slug: string;
  type: string;
  location: string;
  state: string;
  established: number;
  naacGrade?: string;
  logoUrl?: string | null;
  avgPackageLPA?: number;
  medianPackageLPA?: number;
  peakPackageCR?: number;
  cseCutoffRank?: number;
  nirfRank?: number;
  placementPercent?: number;
  totalStudents?: number;
  totalFaculty?: number;
  campusAreaAcres?: number;
  admissionThrough?: string;
  website?: string;
  topRecruiters?: string[];
  tagline?: string;
  qsWorldRank?: number;
  totalOffers?: number;
}

type Verdict = "left" | "right" | "tie";

interface MetricRow {
  label: string;
  key: keyof College | null;
  format: (v: any, college: College) => string;
  verdict: (a: College, b: College) => Verdict;
  highlight?: boolean;
}

function better(a: number | undefined, b: number | undefined, lowerIsBetter = false): Verdict {
  if (a == null && b == null) return "tie";
  if (a == null) return "right";
  if (b == null) return "left";
  if (a === b) return "tie";
  if (lowerIsBetter) return a < b ? "left" : "right";
  return a > b ? "left" : "right";
}

const METRICS: MetricRow[] = [
  {
    label: "NIRF Rank",
    key: "nirfRank",
    format: (v) => v ? `#${v}` : "—",
    verdict: (a, b) => better(a.nirfRank, b.nirfRank, true),
    highlight: true,
  },
  {
    label: "CSE Cutoff (Closing Rank)",
    key: "cseCutoffRank",
    format: (v) => v ? v.toLocaleString("en-IN") : "—",
    verdict: (a, b) => better(a.cseCutoffRank, b.cseCutoffRank, true),
    highlight: true,
  },
  {
    label: "Avg Package",
    key: "avgPackageLPA",
    format: (v) => v ? `₹${v}L` : "—",
    verdict: (a, b) => better(a.avgPackageLPA, b.avgPackageLPA),
    highlight: true,
  },
  {
    label: "Median Package",
    key: "medianPackageLPA",
    format: (v) => v ? `₹${v}L` : "—",
    verdict: (a, b) => better(a.medianPackageLPA, b.medianPackageLPA),
  },
  {
    label: "Peak Package",
    key: "peakPackageCR",
    format: (v) => v ? `₹${v}Cr` : "—",
    verdict: (a, b) => better(a.peakPackageCR, b.peakPackageCR),
  },
  {
    label: "Placement %",
    key: "placementPercent",
    format: (v) => v ? `${v}%` : "—",
    verdict: (a, b) => better(a.placementPercent, b.placementPercent),
    highlight: true,
  },
  {
    label: "Total Offers",
    key: "totalOffers",
    format: (v) => v ? v.toLocaleString("en-IN") : "—",
    verdict: (a, b) => better(a.totalOffers, b.totalOffers),
  },
  {
    label: "NAAC Grade",
    key: "naacGrade",
    format: (v) => v || "—",
    verdict: (a, b) => {
      const order: Record<string, number> = { "A++": 4, "A+": 3, "A": 2, "B++": 1, "B+": 0 };
      const va = order[a.naacGrade || ""] ?? -1;
      const vb = order[b.naacGrade || ""] ?? -1;
      return better(va, vb);
    },
  },
  {
    label: "QS World Rank",
    key: "qsWorldRank",
    format: (v) => v ? `#${v}` : "—",
    verdict: (a, b) => better(a.qsWorldRank, b.qsWorldRank, true),
  },
  {
    label: "Total Students",
    key: "totalStudents",
    format: (v) => v ? v.toLocaleString("en-IN") : "—",
    verdict: (a, b) => better(a.totalStudents, b.totalStudents),
  },
  {
    label: "Total Faculty",
    key: "totalFaculty",
    format: (v) => v ? v.toLocaleString("en-IN") : "—",
    verdict: (a, b) => better(a.totalFaculty, b.totalFaculty),
  },
  {
    label: "Campus Area",
    key: "campusAreaAcres",
    format: (v) => v ? `${v} acres` : "—",
    verdict: (a, b) => better(a.campusAreaAcres, b.campusAreaAcres),
  },
  {
    label: "Established",
    key: "established",
    format: (v) => v ? String(v) : "—",
    verdict: (a, b) => better(a.established, b.established, true),
  },
  {
    label: "Admission",
    key: "admissionThrough",
    format: (v) => v || "—",
    verdict: () => "tie",
  },
  {
    label: "Location",
    key: "location",
    format: (_, c) => `${c.location}, ${c.state}`,
    verdict: () => "tie",
  },
];

function VerdictIcon({ v, side }: { v: Verdict; side: "left" | "right" }) {
  if (v === "tie") return <Minus className="w-3.5 h-3.5 text-[#969696]" />;
  if (v === side) return <TrendingUp className="w-3.5 h-3.5 text-[#2a7a3b]" />;
  return <TrendingDown className="w-3.5 h-3.5 text-[#9b2c2c]" />;
}

function CollegeSelector({
  colleges,
  selected,
  onSelect,
  label,
}: {
  colleges: College[];
  selected: College | null;
  onSelect: (c: College | null) => void;
  label: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      colleges.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.type.toLowerCase().includes(search.toLowerCase()) ||
          c.location.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 20),
    [colleges, search]
  );

  return (
    <div className="relative flex-1 min-w-0">
      <p className="text-[10px] text-[#969696] tracking-widest mb-2">{label}</p>
      {selected ? (
        <div className="bg-white border border-[#24341d] rounded-lg p-3 flex items-center gap-3">
          <AvatarLogo
            src={selected.logoUrl || `/logos/${selected.slug}.png`}
            alt={selected.name}
            fallback={selected.type.charAt(0)}
            type={selected.type}
            size="sm"
            rounded="full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#241f23] line-clamp-1">{selected.name}</p>
            <p className="text-xs text-[#969696]">{selected.type} · {selected.location}</p>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-[#969696] hover:text-[#241f23] shrink-0 border border-[#d1d5db] px-2 py-1 rounded hover:border-[#24341d] transition-colors"
          >
            Change
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full bg-white border border-[#24341d] rounded-lg px-4 py-3 text-left text-sm text-[#969696] flex items-center justify-between hover:border-black transition-colors"
          >
            <span>Select a college…</span>
            <ChevronDown className="w-4 h-4 shrink-0" />
          </button>
          {open && (
            <div className="absolute top-full left-0 right-0 z-30 bg-white border border-[#24341d] rounded-lg mt-1 shadow-lg overflow-hidden">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, type, city…"
                className="w-full px-4 py-3 text-sm border-b border-[#d1d5db] focus:outline-none"
              />
              <div className="max-h-64 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-[#969696]">No results</p>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { onSelect(c); setOpen(false); setSearch(""); }}
                      className="w-full px-4 py-3 text-left hover:bg-[#f8f4f0] flex items-center gap-3 border-b border-[#f0ede8] last:border-0"
                    >
                      <AvatarLogo
                        src={c.logoUrl || `/logos/${c.slug}.png`}
                        alt={c.name}
                        fallback={c.type.charAt(0)}
                        type={c.type}
                        size="sm"
                        rounded="full"
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-[#241f23] line-clamp-1">{c.name}</p>
                        <p className="text-[10px] text-[#969696]">{c.type} · {c.location}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Scorecard({ college, wins }: { college: College; wins: number }) {
  return (
    <div className="bg-white border border-[#24341d] rounded-lg p-4 flex items-center gap-3">
      <AvatarLogo
        src={college.logoUrl || `/logos/${college.slug}.png`}
        alt={college.name}
        fallback={college.type.charAt(0)}
        type={college.type}
        size="sm"
        rounded="full"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#241f23] line-clamp-1">{college.name}</p>
        <p className="text-xs text-[#969696]">{college.tagline || college.type}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xl font-medium text-[#241f23]">{wins}</p>
        <p className="text-[10px] text-[#969696] tracking-widest">WINS</p>
      </div>
    </div>
  );
}

export default function Compare() {
  const { data: colleges = [], isLoading } = useListColleges();
  const [left, setLeft] = useState<College | null>(null);
  const [right, setRight] = useState<College | null>(null);

  const verdicts = useMemo(() => {
    if (!left || !right) return null;
    return METRICS.map((m) => ({ ...m, result: m.verdict(left, right) }));
  }, [left, right]);

  const wins = useMemo(() => {
    if (!verdicts) return { left: 0, right: 0, tie: 0 };
    return verdicts.reduce(
      (acc, v) => {
        acc[v.result]++;
        return acc;
      },
      { left: 0, right: 0, tie: 0 }
    );
  }, [verdicts]);

  const winner: "left" | "right" | "tie" | null = useMemo(() => {
    if (!verdicts) return null;
    if (wins.left > wins.right) return "left";
    if (wins.right > wins.left) return "right";
    return "tie";
  }, [verdicts, wins]);

  const typedColleges = colleges as College[];

  return (
    <div className="bg-[#f8f4f0] min-h-screen">
      {/* Header */}
      <section className="pt-14 sm:pt-20 pb-10 px-4 border-b border-[#24341d]">
        <div className="container mx-auto max-w-4xl">
          <p className="text-xs font-bold text-[#969696] tracking-widest mb-3">COMPARE COLLEGES</p>
          <h1 className="text-3xl sm:text-5xl font-medium text-[#241f23] leading-tight mb-3">
            Side by side.<br className="sm:hidden" /> No guessing.
          </h1>
          <p className="text-sm sm:text-base text-[#969696] max-w-xl">
            Pick any two colleges and see every metric that matters — placements, cutoffs, NIRF rank, campus and more — in one clean comparison.
          </p>
        </div>
      </section>

      {/* Selectors */}
      <section className="py-8 px-4 bg-white border-b border-[#24341d]">
        <div className="container mx-auto max-w-4xl">
          {isLoading ? (
            <div className="h-16 bg-[#f4f0ec] rounded-lg animate-pulse" />
          ) : (
            <div className="flex gap-4 items-start flex-col sm:flex-row">
              <CollegeSelector
                colleges={typedColleges.filter((c) => c.id !== right?.id)}
                selected={left}
                onSelect={setLeft}
                label="COLLEGE A"
              />
              <div className="hidden sm:flex items-center justify-center pt-7 shrink-0">
                <span className="text-xl font-light text-[#969696]">vs</span>
              </div>
              <CollegeSelector
                colleges={typedColleges.filter((c) => c.id !== left?.id)}
                selected={right}
                onSelect={setRight}
                label="COLLEGE B"
              />
            </div>
          )}
        </div>
      </section>

      {/* Quick start examples */}
      {!left && !right && !isLoading && (
        <section className="py-8 px-4 border-b border-[#24341d]">
          <div className="container mx-auto max-w-4xl">
            <p className="text-xs text-[#969696] tracking-widest mb-4">POPULAR COMPARISONS</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["iit-bombay", "iit-delhi"],
                ["iit-madras", "iit-kharagpur"],
                ["nit-trichy", "nit-warangal"],
                ["iit-roorkee", "iit-guwahati"],
              ].map(([aSlug, bSlug]) => {
                const a = typedColleges.find((c) => c.slug === aSlug);
                const b = typedColleges.find((c) => c.slug === bSlug);
                if (!a || !b) return null;
                return (
                  <button
                    key={`${aSlug}-${bSlug}`}
                    onClick={() => { setLeft(a); setRight(b); }}
                    className="text-xs bg-white border border-[#d1d5db] hover:border-[#24341d] text-[#241f23] px-3 py-2 rounded-full transition-colors flex items-center gap-1.5"
                  >
                    {a.name.split(" ").slice(0, 2).join(" ")} vs {b.name.split(" ").slice(0, 2).join(" ")}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Comparison table */}
      {left && right && verdicts && (
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">

            {/* Scorecards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Scorecard college={left} wins={wins.left} />
              <Scorecard college={right} wins={wins.right} />
            </div>

            {/* Winner banner */}
            {winner !== "tie" && (
              <div className="mb-6 bg-[#241f23] text-white px-5 py-4 rounded-lg flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-[#beffcb] shrink-0" />
                <p className="text-sm font-medium">
                  <span className="text-[#d1beff]">
                    {winner === "left" ? left.name : right.name}
                  </span>
                  {" "}wins on {winner === "left" ? wins.left : wins.right} out of {METRICS.length} metrics
                </p>
              </div>
            )}
            {winner === "tie" && (
              <div className="mb-6 bg-[#f4f0ec] border border-[#24341d]/30 px-5 py-4 rounded-lg">
                <p className="text-sm font-medium text-[#241f23]">It's a tie — both colleges are evenly matched across these metrics.</p>
              </div>
            )}

            {/* Metrics table */}
            <div className="bg-white border border-[#24341d] rounded-lg overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_1fr] bg-[#241f23] text-white text-xs tracking-widest">
                <div className="px-4 py-3 font-medium truncate">{left.name.split(" ").slice(0, 3).join(" ")}</div>
                <div className="px-4 py-3 text-center text-[#969696] w-32 sm:w-48">METRIC</div>
                <div className="px-4 py-3 font-medium text-right truncate">{right.name.split(" ").slice(0, 3).join(" ")}</div>
              </div>

              {verdicts.map((row, i) => {
                const lVal = row.format((left as any)[row.key as string], left);
                const rVal = row.format((right as any)[row.key as string], right);
                const isLeftWin = row.result === "left";
                const isRightWin = row.result === "right";
                return (
                  <div
                    key={row.label}
                    className={`grid grid-cols-[1fr_auto_1fr] border-b border-[#f0ede8] last:border-0 ${row.highlight ? "bg-[#fafaf8]" : ""}`}
                  >
                    <div className={`px-4 py-3.5 flex items-center gap-2 ${isLeftWin ? "font-semibold text-[#241f23]" : "text-[#352d33]"}`}>
                      <VerdictIcon v={row.result} side="left" />
                      <span className="text-sm">{lVal}</span>
                    </div>
                    <div className="px-3 py-3.5 text-center w-32 sm:w-48 flex items-center justify-center">
                      <span className="text-[10px] text-[#969696] tracking-wider text-center leading-tight">{row.label}</span>
                    </div>
                    <div className={`px-4 py-3.5 flex items-center gap-2 justify-end ${isRightWin ? "font-semibold text-[#241f23]" : "text-[#352d33]"}`}>
                      <span className="text-sm">{rVal}</span>
                      <VerdictIcon v={row.result} side="right" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top recruiters */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[left, right].map((c, idx) => (
                <div key={idx} className="bg-white border border-[#24341d]/30 rounded-lg p-4">
                  <p className="text-[10px] text-[#969696] tracking-widest mb-3">
                    TOP RECRUITERS · {c.name.split(" ").slice(0, 2).join(" ").toUpperCase()}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(c.topRecruiters || []).slice(0, 8).map((r: string) => (
                      <span key={r} className="text-xs bg-[#f4f0ec] text-[#241f23] px-2 py-1 rounded-[4px]">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Deep dive links */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[left, right].map((c, idx) => (
                <Link
                  key={idx}
                  href={`/colleges/${c.slug}`}
                  className="flex items-center justify-between gap-3 bg-white border border-[#24341d]/30 hover:border-[#24341d] px-4 py-3 rounded-lg group transition-colors"
                >
                  <span className="text-sm font-medium text-[#241f23] line-clamp-1">
                    Full dashboard → {c.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#969696] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {(!left || !right) && (
        <section className="py-16 px-4 text-center">
          <div className="container mx-auto max-w-sm">
            <div className="w-14 h-14 bg-white border border-[#24341d] rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              ⚖️
            </div>
            <p className="text-base font-medium text-[#241f23] mb-2">
              {!left && !right ? "Select two colleges above" : "Select one more college"}
            </p>
            <p className="text-sm text-[#969696]">
              Compare placements, cutoffs, NIRF rank, campus stats and more — instantly.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
