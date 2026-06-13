import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListColleges } from "@workspace/api-client-react";
import { AvatarLogo } from "@/components/ui/avatar-logo";
import { ArrowRight, BookmarkCheck, Bookmark, Flame, Target, TrendingUp, RotateCcw, ChevronDown } from "lucide-react";

const CATEGORIES = ["General", "OBC-NCL", "SC", "ST", "EWS"];
const BRANCHES = ["CSE", "ECE", "Mechanical", "Civil", "Chemical", "Aerospace", "Electrical"];
const COUNSELLING_TYPES = ["JoSAA (IIT/NIT)", "State Counselling", "COMEDK", "Any"];

interface UserProfile {
  rank: string;
  category: string;
  branch: string;
  counsellingType: string;
}

type MatchLabel = "Safe" | "Moderate" | "Reach" | "Unlikely";

interface CollegeMatch {
  college: any;
  label: MatchLabel;
  gap: number;
  saved: boolean;
}

const LABEL_META: Record<MatchLabel, { color: string; bg: string; desc: string }> = {
  Safe:     { color: "text-[#2a7a3b]",  bg: "bg-[#beffcb]",  desc: "Your rank is comfortably better than last cutoff" },
  Moderate: { color: "text-[#7a5e00]",  bg: "bg-[#fff0b3]",  desc: "Your rank is within striking range" },
  Reach:    { color: "text-[#9b2c2c]",  bg: "bg-[#ffd6d6]",  desc: "Possible but rank may fall short" },
  Unlikely: { color: "text-[#969696]",  bg: "bg-[#f4f0ec]",  desc: "Cutoff is significantly lower than your rank" },
};

function classifyMatch(userRank: number, cutoff: number): MatchLabel {
  const ratio = userRank / cutoff;
  if (ratio <= 0.75) return "Safe";
  if (ratio <= 1.0)  return "Moderate";
  if (ratio <= 1.35) return "Reach";
  return "Unlikely";
}

function getStreakData() {
  try {
    const raw = localStorage.getItem("counseliq_streak");
    if (!raw) return { count: 0, lastDate: "" };
    return JSON.parse(raw) as { count: number; lastDate: string };
  } catch {
    return { count: 0, lastDate: "" };
  }
}

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const streak = getStreakData();
  if (streak.lastDate === today) return streak;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
  const updated = { count: newCount, lastDate: today };
  localStorage.setItem("counseliq_streak", JSON.stringify(updated));
  return updated;
}

function getSaved(): string[] {
  try { return JSON.parse(localStorage.getItem("counseliq_saved") || "[]"); }
  catch { return []; }
}

function toggleSave(id: string) {
  const saved = getSaved();
  const next = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id];
  localStorage.setItem("counseliq_saved", JSON.stringify(next));
  return next;
}

export default function Shortlist() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try { return JSON.parse(localStorage.getItem("counseliq_profile") || "null") || { rank: "", category: "General", branch: "CSE", counsellingType: "Any" }; }
    catch { return { rank: "", category: "General", branch: "CSE", counsellingType: "Any" }; }
  });

  const [submitted, setSubmitted] = useState(() => {
    try { return !!localStorage.getItem("counseliq_profile"); }
    catch { return false; }
  });

  const [saved, setSaved] = useState<string[]>(() => getSaved());
  const [streak, setStreak] = useState(() => getStreakData());
  const [filterLabel, setFilterLabel] = useState<MatchLabel | "All">("All");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const { data: colleges, isLoading } = useListColleges();

  useEffect(() => {
    if (submitted) {
      const s = updateStreak();
      setStreak(s);
    }
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.rank || isNaN(Number(profile.rank))) return;
    localStorage.setItem("counseliq_profile", JSON.stringify(profile));
    setSubmitted(true);
  };

  const handleReset = () => {
    localStorage.removeItem("counseliq_profile");
    setProfile({ rank: "", category: "General", branch: "CSE", counsellingType: "Any" });
    setSubmitted(false);
  };

  const matches: CollegeMatch[] = (() => {
    if (!submitted || !colleges) return [];
    const userRank = Number(profile.rank);
    return colleges
      .filter((c) => c.cseCutoffRank)
      .map((c) => ({
        college: c,
        label: classifyMatch(userRank, c.cseCutoffRank as number),
        gap: (c.cseCutoffRank as number) - userRank,
        saved: saved.includes(c.id),
      }))
      .sort((a, b) => {
        const order: Record<MatchLabel, number> = { Safe: 0, Moderate: 1, Reach: 2, Unlikely: 3 };
        if (order[a.label] !== order[b.label]) return order[a.label] - order[b.label];
        return a.gap - b.gap;
      });
  })();

  const displayMatches = matches.filter((m) => {
    if (showSavedOnly && !m.saved) return false;
    if (filterLabel !== "All" && m.label !== filterLabel) return false;
    return true;
  });

  const counts = { Safe: 0, Moderate: 0, Reach: 0, Unlikely: 0 };
  matches.forEach((m) => counts[m.label]++);

  return (
    <div className="bg-[#f8f4f0] min-h-screen">
      {/* Header */}
      <section className="pt-14 sm:pt-20 pb-10 px-4 border-b border-[#24341d]">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-bold text-[#969696] tracking-widest mb-3">MY SHORTLIST</p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-5xl font-medium text-[#241f23] leading-tight">
                Your rank.<br />Your colleges.
              </h1>
              <p className="text-sm sm:text-base text-[#969696] mt-3 max-w-lg">
                Enter your JEE rank and get a personalized college shortlist — Safe, Moderate and Reach picks — updated every time you visit.
              </p>
            </div>
            {submitted && streak.count > 0 && (
              <div className="flex items-center gap-2 bg-white border border-[#24341d] rounded-lg px-4 py-3 shrink-0">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-lg font-medium text-[#241f23] leading-none">{streak.count}</p>
                  <p className="text-[10px] text-[#969696] tracking-widest mt-0.5">DAY STREAK</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Profile form */}
      <section className="py-10 px-4 border-b border-[#24341d] bg-white">
        <div className="container mx-auto max-w-3xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs font-bold text-[#969696] tracking-widest mb-4">ENTER YOUR DETAILS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#969696] tracking-wider mb-1.5">JEE RANK</label>
                  <input
                    type="number"
                    value={profile.rank}
                    onChange={(e) => setProfile((p) => ({ ...p, rank: e.target.value }))}
                    placeholder="e.g. 4500"
                    min={1}
                    max={1500000}
                    required
                    className="w-full h-11 px-4 border border-[#24341d] rounded-[4px] text-sm bg-[#f8f4f0] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#969696] tracking-wider mb-1.5">CATEGORY</label>
                  <div className="relative">
                    <select
                      value={profile.category}
                      onChange={(e) => setProfile((p) => ({ ...p, category: e.target.value }))}
                      className="w-full h-11 px-4 border border-[#24341d] rounded-[4px] text-sm bg-[#f8f4f0] appearance-none focus:outline-none focus:border-black"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#969696] tracking-wider mb-1.5">PREFERRED BRANCH</label>
                  <div className="relative">
                    <select
                      value={profile.branch}
                      onChange={(e) => setProfile((p) => ({ ...p, branch: e.target.value }))}
                      className="w-full h-11 px-4 border border-[#24341d] rounded-[4px] text-sm bg-[#f8f4f0] appearance-none focus:outline-none focus:border-black"
                    >
                      {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#969696] tracking-wider mb-1.5">COUNSELLING TYPE</label>
                  <div className="relative">
                    <select
                      value={profile.counsellingType}
                      onChange={(e) => setProfile((p) => ({ ...p, counsellingType: e.target.value }))}
                      className="w-full h-11 px-4 border border-[#24341d] rounded-[4px] text-sm bg-[#f8f4f0] appearance-none focus:outline-none focus:border-black"
                    >
                      {COUNSELLING_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696] pointer-events-none" />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#241f23] text-white px-8 py-3 rounded-[4px] text-sm font-medium hover:bg-black transition-colors"
              >
                Build My Shortlist →
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <div className="bg-[#f4f0ec] border border-[#24341d]/20 px-4 py-2 rounded-[4px]">
                  <p className="text-[10px] text-[#969696] tracking-widest">RANK</p>
                  <p className="text-base font-medium text-[#241f23]">{Number(profile.rank).toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-[#f4f0ec] border border-[#24341d]/20 px-4 py-2 rounded-[4px]">
                  <p className="text-[10px] text-[#969696] tracking-widest">CATEGORY</p>
                  <p className="text-base font-medium text-[#241f23]">{profile.category}</p>
                </div>
                <div className="bg-[#f4f0ec] border border-[#24341d]/20 px-4 py-2 rounded-[4px]">
                  <p className="text-[10px] text-[#969696] tracking-widest">BRANCH</p>
                  <p className="text-base font-medium text-[#241f23]">{profile.branch}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-xs text-[#969696] border border-[#d1d5db] px-4 py-2 rounded-[4px] hover:border-[#24341d] hover:text-[#241f23] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Change Details
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {submitted && (
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-3xl">

            {/* Summary pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {(["Safe", "Moderate", "Reach", "Unlikely"] as MatchLabel[]).map((label) => (
                <button
                  key={label}
                  onClick={() => setFilterLabel(filterLabel === label ? "All" : label)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    filterLabel === label
                      ? `${LABEL_META[label].bg} border-[#24341d]`
                      : "bg-white border-[#d1d5db] hover:border-[#24341d]"
                  }`}
                >
                  <p className={`text-xl font-medium ${LABEL_META[label].color}`}>{counts[label]}</p>
                  <p className="text-[10px] tracking-widest text-[#969696] mt-0.5">{label.toUpperCase()}</p>
                </button>
              ))}
            </div>

            {/* Filter bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-xs text-[#969696] tracking-widest">
                {filterLabel === "All" ? `${displayMatches.length} COLLEGES` : `${displayMatches.length} ${filterLabel.toUpperCase()}`}
                {showSavedOnly ? " · SAVED ONLY" : ""}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSavedOnly((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    showSavedOnly ? "bg-[#241f23] text-white border-[#241f23]" : "bg-white text-[#969696] border-[#d1d5db] hover:border-[#24341d]"
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  Saved ({saved.length})
                </button>
                {filterLabel !== "All" && (
                  <button
                    onClick={() => setFilterLabel("All")}
                    className="text-xs text-[#969696] hover:text-[#241f23] transition-colors"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>

            {/* College list */}
            {isLoading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-white border border-[#d1d5db] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : displayMatches.length === 0 ? (
              <div className="text-center py-16 text-[#969696]">
                <Target className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No colleges match this filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayMatches.map(({ college, label, gap, saved: isSaved }) => (
                  <div
                    key={college.id}
                    className="bg-white border border-[#d1d5db] hover:border-[#24341d] rounded-lg p-4 flex items-center gap-4 group transition-all"
                  >
                    {/* Logo */}
                    <AvatarLogo
                      src={college.logoUrl || `/logos/${college.slug}.png`}
                      alt={college.name}
                      fallback={college.type.charAt(0)}
                      type={college.type}
                      size="sm"
                      rounded="full"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[#241f23] leading-tight line-clamp-1">{college.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${LABEL_META[label].bg} ${LABEL_META[label].color}`}>
                          {label.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#969696] mt-0.5">{college.location} · {college.type}</p>
                      <p className="text-[10px] text-[#969696] mt-1">
                        {gap > 0
                          ? <span className="text-[#2a7a3b]">↑ {gap.toLocaleString("en-IN")} ranks better than cutoff</span>
                          : <span className="text-[#9b2c2c]">↓ {Math.abs(gap).toLocaleString("en-IN")} ranks short of cutoff</span>
                        }
                        {college.nirfRank && <span className="ml-2 text-[#969696]">· NIRF #{college.nirfRank}</span>}
                      </p>
                    </div>

                    {/* Cutoff */}
                    <div className="hidden sm:block text-right shrink-0">
                      <p className="text-xs text-[#969696] tracking-widest">CSE CUTOFF</p>
                      <p className="text-sm font-medium text-[#241f23]">{(college.cseCutoffRank as number).toLocaleString("en-IN")}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const updated = toggleSave(college.id);
                          setSaved(updated);
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${
                          isSaved
                            ? "bg-[#241f23] border-[#241f23] text-white"
                            : "bg-white border-[#d1d5db] text-[#969696] hover:border-[#24341d]"
                        }`}
                        aria-label={isSaved ? "Remove from saved" : "Save"}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                      <Link
                        href={`/colleges/${college.slug}`}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#d1d5db] bg-white text-[#969696] hover:border-[#24341d] hover:text-[#241f23] transition-colors"
                        aria-label="View college"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trend hint */}
            {submitted && matches.length > 0 && (
              <div className="mt-8 bg-white border border-[#24341d]/30 rounded-lg p-4 flex gap-3">
                <TrendingUp className="w-5 h-5 text-[#241f23] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-[#241f23] mb-1">Cutoffs change every round</p>
                  <p className="text-xs text-[#969696] leading-relaxed">
                    JoSAA runs 6 rounds. Come back daily — your Reach colleges today may become Moderate as later rounds open up seats. Your streak keeps you ahead.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty state before submit */}
      {!submitted && (
        <section className="py-16 px-4 text-center">
          <div className="container mx-auto max-w-md">
            <div className="w-14 h-14 bg-white border border-[#24341d] rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-[#241f23]" />
            </div>
            <p className="text-base font-medium text-[#241f23] mb-2">Build your personal shortlist</p>
            <p className="text-sm text-[#969696]">Enter your rank above to see Safe, Moderate, and Reach colleges matched from real JoSAA cutoff data.</p>
          </div>
        </section>
      )}
    </div>
  );
}
