import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListColleges } from "@workspace/api-client-react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  ClipboardCopy,
  RefreshCw,
  Sparkles,
  Trash2,
  Info,
} from "lucide-react";

/* ─── types ─── */
interface College {
  id: string;
  slug: string;
  name: string;
  type: string;
  location: string;
  state: string;
  nirfRank?: number;
}
interface Cutoff {
  id: string;
  collegeId: string;
  branch: string;
  branchCode: string;
  category: string;
  quota: string;
  openRank: number;
  closeRank: number;
  gender: string;
}
interface ListItem {
  key: string;
  college: College;
  branch: string;
  branchCode: string;
  openRank: number;
  closeRank: number;
  label: "Reach" | "Moderate" | "Safe";
  preferred: boolean;
}

/* ─── constants ─── */
const CATEGORIES = [
  { label: "General (OPEN)", value: "OPEN" },
  { label: "EWS", value: "EWS" },
  { label: "OBC-NCL", value: "OBC-NCL" },
  { label: "SC", value: "SC" },
  { label: "ST", value: "ST" },
];
const QUOTAS = [
  { label: "All India (AI)", value: "AI" },
  { label: "Home State (HS)", value: "HS" },
  { label: "Other State (OS)", value: "OS" },
];
const BRANCH_FAMILIES: Record<string, string[]> = {
  "CSE & IT": [
    "Computer Science",
    "Information Technology",
    "Artificial Intelligence",
    "Data Science",
    "Software",
  ],
  Electronics: ["Electronics", "Electrical", "Communication"],
  Mechanical: [
    "Mechanical",
    "Aerospace",
    "Production",
    "Industrial",
    "Manufacturing",
  ],
  Civil: ["Civil"],
  Chemical: ["Chemical", "Biotechnology"],
  "Maths & Physics": ["Mathematics", "Physics", "Engineering Physics"],
};

const LABEL_STYLE: Record<string, string> = {
  Reach: "bg-[#ffd6d6] text-[#9b2c2c]",
  Moderate: "bg-[#fff0b3] text-[#7a5e00]",
  Safe: "bg-[#beffcb] text-[#2a7a3b]",
};
const LABEL_ORDER: Record<string, number> = { Reach: 0, Moderate: 1, Safe: 2 };

/* ─── helpers ─── */
function classify(
  closeRank: number,
  userRank: number,
): "Reach" | "Moderate" | "Safe" {
  if (closeRank < userRank * 1.18) return "Reach";
  if (closeRank < userRank * 1.5) return "Moderate";
  return "Safe";
}

function isPreferredBranch(branch: string, families: string[]): boolean {
  if (families.length === 0) return true;
  return families.some((f) =>
    BRANCH_FAMILIES[f]?.some((kw) =>
      branch.toLowerCase().includes(kw.toLowerCase()),
    ),
  );
}

/* ─── step progress bar ─── */
function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full flex-1 transition-all ${i < current ? "bg-[#241f23]" : "bg-[#d1d5db]"}`}
        />
      ))}
      <span className="text-xs text-[#969696] shrink-0">
        Step {current} of {total}
      </span>
    </div>
  );
}

/* ─── main page ─── */
export default function JosaaList() {
  const { data: colleges = [] } = useListColleges();

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [quota, setQuota] = useState("AI");
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([
    "CSE & IT",
  ]);
  const [collegeType, setCollegeType] = useState<
    "Any" | "IIT" | "NIT" | "IIIT"
  >("Any");
  const [loading, setLoading] = useState(false);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [copied, setCopied] = useState(false);

  const collegeMap = useMemo(() => {
    const m: Record<string, College> = {};
    (colleges as College[]).forEach((c) => {
      m[c.slug] = c;
      m[c.id] = c;
    });
    return m;
  }, [colleges]);

  const toggleFamily = (f: string) =>
    setSelectedFamilies((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );

  async function generate() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        quota,
        gender: "Gender-Neutral",
        year: "2026",
      });
      const res = await fetch(`/api/cutoffs?${params}`);
      const data: Cutoff[] = await res.json();
      const userRank = Number(rank);

      let eligible = data.filter((c) => c.closeRank >= userRank);
      if (collegeType !== "Any") {
        eligible = eligible.filter(
          (c) => collegeMap[c.collegeId]?.type === collegeType,
        );
      }

      const seen = new Set<string>();
      const items: ListItem[] = [];
      for (const c of eligible) {
        const col = collegeMap[c.collegeId];
        if (!col) continue;
        const key = `${c.collegeId}__${c.branch}`;
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({
          key,
          college: col,
          branch: c.branch,
          branchCode: c.branchCode,
          openRank: c.openRank,
          closeRank: c.closeRank,
          label: classify(c.closeRank, userRank),
          preferred: isPreferredBranch(c.branch, selectedFamilies),
        });
      }

      items.sort((a, b) => {
        const ao = LABEL_ORDER[a.label] * 2 + (a.preferred ? 0 : 1);
        const bo = LABEL_ORDER[b.label] * 2 + (b.preferred ? 0 : 1);
        if (ao !== bo) return ao - bo;
        return (a.college.nirfRank ?? 999) - (b.college.nirfRank ?? 999);
      });

      setListItems(items.slice(0, 35));
      setStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const moveUp = (i: number) => {
    if (i === 0) return;
    setListItems((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };
  const moveDown = (i: number) => {
    setListItems((prev) => {
      if (i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };
  const removeItem = (i: number) =>
    setListItems((prev) => prev.filter((_, idx) => idx !== i));

  const copyList = () => {
    const text = listItems
      .map((item, i) => `${i + 1}. ${item.college.name} – ${item.branch}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const reset = () => {
    setStep(0);
    setRank("");
    setCategory("OPEN");
    setQuota("AI");
    setSelectedFamilies(["CSE & IT"]);
    setCollegeType("Any");
    setListItems([]);
  };

  const profileSummary = (
    <div className="mt-6 p-4 bg-white border border-[#d1d5db] rounded-lg">
      <p className="text-xs font-bold text-[#969696] tracking-widest mb-2">
        YOUR PROFILE
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>
          Rank{" "}
          <strong className="text-[#241f23]">
            {Number(rank).toLocaleString("en-IN")}
          </strong>
        </span>
        <span className="text-[#969696]">·</span>
        <span>
          <strong className="text-[#241f23]">
            {CATEGORIES.find((c) => c.value === category)?.label}
          </strong>
        </span>
        <span className="text-[#969696]">·</span>
        <span>
          <strong className="text-[#241f23]">
            {QUOTAS.find((q) => q.value === quota)?.label}
          </strong>
        </span>
      </div>
    </div>
  );

  /* ── STEP 0: Landing ── */
  if (step === 0)
    return (
      <div className="bg-[#f8f4f0] min-h-screen">
        <section className="pt-16 sm:pt-28 pb-16 px-4 border-b border-[#24341d]/30">
          <div className="container mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#beffcb] border border-[#24341d] px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#2a7a3b]" />
              <span className="text-xs font-sans tracking-widest text-[#2a7a3b]">
                INDIA'S FIRST
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-medium text-[#241f23] mb-6 leading-none tracking-tight">
              Build your
              <br />
              JoSAA list.
            </h1>
            <p className="text-data-large  mb-4 max-w-2xl leading-relaxed">
              The hardest part of JoSAA isn't finding a college — it's{" "}
              <em>ordering your 25 preferences correctly</em>. One wrong order
              can cost you your dream seat.
            </p>
            <p className="text-[#241f23] font-medium text-lg mb-10">
              We generate the optimal list for you. Ranked Reach → Moderate →
              Safe, sorted by prestige. Yours to edit and copy straight to the
              portal.
            </p>
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 bg-[#241f23] text-white px-8 py-4 rounded-sm text-base font-medium hover:bg-[#352d33] transition-colors"
            >
              Build my preference list <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-[#969696] mt-4">
              Free · JoSAA 2025 data · Takes 60 seconds
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <p className="text-display-s tracking-widest  mb-8">How it works</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-16">
              {[
                {
                  n: "01",
                  title: "Enter your JEE profile",
                  desc: "Rank, category, quota",
                },
                {
                  n: "02",
                  title: "Set branch priorities",
                  desc: "Which branches & college types you prefer",
                },
                {
                  n: "03",
                  title: "Get your optimal list",
                  desc: "Edit, reorder, then copy to JoSAA portal",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="bg-white border border-[#24341d] rounded-lg p-6"
                >
                  <span className="text-4xl font-medium text-[#ece8e3]">
                    {s.n}
                  </span>
                  <p className="font-medium text-[#241f23] mt-3 mb-1">
                    {s.title}
                  </p>
                  <p className="text-data-base text-[#969696]">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#241f23] text-white rounded-lg p-6 sm:p-8">
              <p className="text-xs font-bold tracking-widest text-[#969696] mb-4">
                WHY ORDER MATTERS
              </p>
              <p className="text-base leading-relaxed text-[#f8f4f0]/80 mb-3">
                JoSAA's algorithm scans your list from preference #1 downward.
                The moment it finds a seat you qualify for, it allots it to you
                — and stops scanning.
              </p>
              <p className="text-base leading-relaxed text-white font-medium">
                If you put NIT Trichy CSE at #3 but IIT Roorkee CSE at #7 — and
                you qualify for both — you'll get NIT Trichy. Not IIT Roorkee.
                The order is everything.
              </p>
            </div>
          </div>
        </section>
      </div>
    );

  /* ── STEP 1: Profile ── */
  if (step === 1)
    return (
      <div className="bg-[#f8f4f0] min-h-screen">
        <section className="pt-16 pb-24 px-4">
          <div className="container mx-auto max-w-2xl">
            <Steps current={1} total={2} />
            <h2 className="text-3xl sm:text-4xl font-medium text-[#241f23] mb-2">
              Your JEE profile.
            </h2>
            <p className="text-[#969696] font-sans  mb-10">
              Enter the details exactly as they appear in your JoSAA
              registration.
            </p>

            <div className="space-y-7">
              <div>
                <label className="block text-sm font-medium text-[#241f23] mb-2">
                  Your JEE Rank
                </label>
                <input
                  type="number"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full border-2 border-[#24341d]/50 focus:border-[#24341d]/50 rounded-lg px-4 py-3.5 text-[#241f23] bg-white outline-none transition-colors text-xl font-medium"
                />
                <p className="text-xs text-[#969696] mt-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Enter your All India Rank (CRL). For category-specific seats,
                  enter your category rank.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#241f23] mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-medium text-left transition-all ${
                        category === c.value
                          ? "border-[#241f23] bg-[#241f23] text-white"
                          : "border-[#d1d5db] bg-white text-[#241f23] hover:border-[#241f23]/50"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#241f23] mb-3">
                  Quota
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {QUOTAS.map((q) => (
                    <button
                      key={q.value}
                      onClick={() => setQuota(q.value)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        quota === q.value
                          ? "border-[#241f23] bg-[#241f23] text-white"
                          : "border-[#d1d5db] bg-white text-[#241f23] hover:border-[#241f23]/50"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#969696] mt-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  HS = home state NITs · OS = other state NITs · AI = all IITs +
                  some NITs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={() => setStep(0)}
                className="text-sm text-[#969696] hover:text-[#241f23] transition-colors"
              >
                ← Back
              </button>
              <button
                disabled={!rank || Number(rank) < 1}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-[#241f23] text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-[#352d33] disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-auto"
              >
                Next: Branch preferences <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    );

  /* ── STEP 2: Preferences ── */
  if (step === 2)
    return (
      <div className="bg-[#f8f4f0] min-h-screen">
        <section className="pt-16 pb-24 px-4">
          <div className="container mx-auto max-w-2xl">
            <Steps current={2} total={2} />
            <h2 className="text-3xl sm:text-4xl font-medium text-[#241f23] mb-2">
              Your priorities.
            </h2>
            <p className="text-[#969696] mb-10">
              Preferred branches appear first within each safety tier. You can
              always reorder the final list manually.
            </p>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-[#241f23] mb-1">
                  Preferred branches
                </label>
                <p className="text-xs text-[#969696] mb-3">
                  Select all that interest you. These appear at the top of each
                  tier.
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(BRANCH_FAMILIES).map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFamily(f)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                        selectedFamilies.includes(f)
                          ? "border-[#241f23] bg-[#241f23] text-white"
                          : "border-[#d1d5db] bg-white text-[#241f23] hover:border-[#241f23]/50"
                      }`}
                    >
                      {selectedFamilies.includes(f) && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      {f}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#969696] mt-2">
                  Leave empty to show all branches without preference
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#241f23] mb-3">
                  Show only
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Any", "IIT", "NIT", "IIIT"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCollegeType(t)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        collegeType === t
                          ? "border-[#241f23] bg-[#241f23] text-white"
                          : "border-[#d1d5db] bg-white text-[#241f23] hover:border-[#241f23]/50"
                      }`}
                    >
                      {t === "Any" ? "All colleges" : `${t}s only`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {profileSummary}

            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-[#969696] hover:text-[#241f23] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={generate}
                disabled={loading}
                className="flex items-center gap-2 bg-[#241f23] text-white px-6 py-3.5 rounded-sm text-sm font-medium hover:bg-[#352d33] disabled:opacity-50 transition-colors ml-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate my list
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    );

  /* ── STEP 3: The List ── */
  const reachCount = listItems.filter((i) => i.label === "Reach").length;
  const moderateCount = listItems.filter((i) => i.label === "Moderate").length;
  const safeCount = listItems.filter((i) => i.label === "Safe").length;

  return (
    <div className="bg-[#f8f4f0] min-h-screen">
      <section className="pt-10 pb-28 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-bold text-[#969696] tracking-widest mb-2">
                RANK {Number(rank).toLocaleString("en-IN")} · {category} ·{" "}
                {quota} {collegeType !== "Any" ? `· ${collegeType}s only` : ""}
              </p>
              <h2 className="text-3xl sm:text-4xl font-medium text-[#241f23]">
                Your preference list.
              </h2>
              <p className="text-sm text-[#969696] mt-1">
                {listItems.length} choices · {reachCount} reach ·{" "}
                {moderateCount} moderate · {safeCount} safe
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-[#969696] border border-[#d1d5db] px-3 py-2 rounded-[4px] hover:border-[#24341d] hover:text-[#241f23] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Start over
              </button>
              <button
                onClick={copyList}
                className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-[4px] font-medium transition-all ${
                  copied
                    ? "bg-[#beffcb] text-[#2a7a3b] border border-[#2a7a3b]"
                    : "bg-[#241f23] text-white hover:bg-[#352d33]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="w-3.5 h-3.5" /> Copy for JoSAA
                    Portal
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            {(["Reach", "Moderate", "Safe"] as const).map((l) => (
              <span
                key={l}
                className={`px-2.5 py-1 rounded-full font-medium ${LABEL_STYLE[l]}`}
              >
                {l}
              </span>
            ))}
            <span className="text-[#969696] hidden sm:inline">
              · Use ↑↓ to reorder · Hover to remove
            </span>
          </div>

          {/* List */}
          {listItems.length === 0 ? (
            <div className="text-center py-20 text-[#969696]">
              <p className="text-xl font-medium mb-2 text-[#241f23]">
                No seats found
              </p>
              <p className="text-sm mb-6">
                Your rank may be too high for this category/quota combination,
                or no colleges match your filters.
              </p>
              <button
                onClick={() => setStep(1)}
                className="text-sm underline text-[#241f23]"
              >
                Adjust your profile
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {listItems.map((item, i) => {
                const showGroupHeader =
                  i === 0 || item.label !== listItems[i - 1].label;

                return (
                  <div key={item.key}>
                    {showGroupHeader && (
                      <div
                        className={`flex items-center gap-3 px-1 pt-5 pb-2 ${i === 0 ? "pt-0" : ""}`}
                      >
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${LABEL_STYLE[item.label]}`}
                        >
                          {item.label.toUpperCase()}
                        </span>
                        <div className="h-px flex-1 bg-[#e5e0da]" />
                        <span className="text-xs text-[#969696]">
                          {
                            listItems.filter((x) => x.label === item.label)
                              .length
                          }{" "}
                          options
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 bg-white border border-[#e5e0da] rounded-lg px-3 sm:px-4 py-3 group hover:border-[#241f23]/30 hover:shadow-sm transition-all">
                      {/* Position */}
                      <span className="text-sm font-medium text-[#c4bfba] w-5 shrink-0 text-right tabular-nums">
                        {i + 1}
                      </span>

                      {/* Up / Down */}
                      <div className="flex flex-col gap-0 shrink-0">
                        <button
                          onClick={() => moveUp(i)}
                          disabled={i === 0}
                          className="w-5 h-4 flex items-center justify-center text-[#969696] hover:text-[#241f23] disabled:opacity-20 transition-colors"
                          aria-label="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveDown(i)}
                          disabled={i === listItems.length - 1}
                          className="w-5 h-4 flex items-center justify-center text-[#969696] hover:text-[#241f23] disabled:opacity-20 transition-colors"
                          aria-label="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* College name + branch */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#241f23] truncate">
                          {item.college.name}
                        </p>
                        <p className="text-xs text-[#969696] truncate">
                          {item.branch}
                        </p>
                      </div>

                      {/* Closing rank */}
                      <div className="hidden sm:block text-right shrink-0">
                        <p className="text-xs font-medium text-[#241f23]">
                          CR {item.closeRank.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-[#969696]">
                          OR {item.openRank.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* College type */}
                      <span className="hidden sm:inline-flex text-xs text-[#969696] border border-[#e5e7eb] px-2 py-0.5 rounded shrink-0">
                        {item.college.type}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(i)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-[#969696] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom copy button */}
          {listItems.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={copyList}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 text-sm px-8 py-4 rounded-sm font-medium transition-all ${
                  copied
                    ? "bg-[#beffcb] text-[#2a7a3b]"
                    : "bg-[#241f23] text-white hover:bg-[#352d33]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> List copied to clipboard!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="w-4 h-4" /> Copy all{" "}
                    {listItems.length} preferences for JoSAA Portal
                  </>
                )}
              </button>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-[#969696] hover:text-[#241f23] transition-colors"
              >
                ← Adjust filters
              </button>
            </div>
          )}

          {/* Strategy Tip */}
          <div className="mt-10 p-5 sm:p-7 bg-[#241f23] text-white rounded-lg">
            <p className="text-xs font-bold tracking-widest text-[#6b7280] mb-4">
              JoSAA PREFERENCE STRATEGY
            </p>
            <div className="space-y-3 text-sm leading-relaxed text-[#f8f4f0]/80">
              <p>
                <strong className="text-white">
                  Always put your dream college first
                </strong>
                , even if it's a reach. JoSAA allots the best seat it finds
                scanning down your list — you can only do better by putting
                better options higher.
              </p>
              <p>
                <strong className="text-white">Do not leave gaps.</strong> Fill
                all 25 slots. If you qualify for a seat lower on your list,
                JoSAA will allot it — having more options is never harmful.
              </p>
              <p>
                <strong className="text-white">Freeze vs. Float</strong> — in
                later rounds, if you got a lower-preference seat, JoSAA will try
                to upgrade you to a higher preference. Only freeze once you're
                happy with what you have.
              </p>
            </div>
          </div>

          {/* Link to Colleges */}
          <p className="text-center text-sm text-[#969696] mt-8">
            Want to explore colleges in detail?{" "}
            <Link
              href="/colleges"
              className="text-[#241f23] underline font-medium"
            >
              Browse all colleges →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
