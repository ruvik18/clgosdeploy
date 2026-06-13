import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListColleges } from "@workspace/api-client-react";
import { AvatarLogo } from "@/components/ui/avatar-logo";
import { ArrowRight, ChevronDown, ChevronRight, RefreshCw, Sparkles, Monitor, TrendingUp, Settings2, BookOpen, Zap, BarChart3 } from "lucide-react";

/* ─────────────── types ─────────────── */
interface College {
  id: string; name: string; slug: string; type: string; location: string; state: string;
  established?: number; naacGrade?: string; logoUrl?: string | null;
  avgPackageLPA?: number; medianPackageLPA?: number; peakPackageCR?: number;
  cseCutoffRank?: number; nirfRank?: number; placementPercent?: number;
  totalStudents?: number; totalFaculty?: number; campusAreaAcres?: number;
  admissionThrough?: string; website?: string; topRecruiters?: string[];
  tagline?: string; qsWorldRank?: number; totalOffers?: number;
}

interface Priorities { placement: number; prestige: number; research: number; campus: number; location: number; }
interface FitResult { score: number; career: number; placementS: number; researchS: number; prestigeS: number; locationS: number; whyFits: string[]; label: "Safe" | "Moderate" | "Reach" | "Out"; }

/* ─────────────── constants ─────────────── */
const GOAL_ICONS = {
  tech:     Monitor,
  finance:  TrendingUp,
  core:     Settings2,
  research: BookOpen,
  startup:  Zap,
  mba:      BarChart3,
} as const;

const GOALS = [
  { id: "tech",     title: "Big Tech",         sub: "Google · Microsoft · Amazon",    desc: "Land a SWE or product role at a top tech company" },
  { id: "finance",  title: "Finance & Quant",  sub: "Goldman · DE Shaw · JP Morgan",  desc: "IB, quant, or FinTech with top package" },
  { id: "core",     title: "Core Engineering", sub: "PSUs · L&T · DRDO · ISRO",       desc: "Mechanical, electrical or civil sector roles" },
  { id: "research", title: "Research / PhD",   sub: "IISc · MIT · Stanford admits",   desc: "Graduate school, labs, or R&D career" },
  { id: "startup",  title: "Startup / Product",sub: "Build your own thing",           desc: "Entrepreneurship, product management, design" },
  { id: "mba",      title: "MBA & Consulting", sub: "IIMs · McKinsey · BCG",          desc: "Corporate leadership, strategy, consulting" },
] as const;
type GoalId = (typeof GOALS)[number]["id"];

const PRIORITY_LABELS = [
  { key: "placement", label: "Placements & Salary",   lo: "I don't care about money", hi: "Package is everything"     },
  { key: "prestige",  label: "Brand & Prestige",       lo: "Brand doesn't matter",     hi: "NIRF rank obsessed"        },
  { key: "research",  label: "Research & Innovation",  lo: "Not interested in research",hi: "Want a research powerhouse"},
  { key: "campus",    label: "Campus Life & Culture",  lo: "Campus doesn't matter",    hi: "Huge campus & culture"     },
  { key: "location",  label: "Location Preference",    lo: "Anywhere in India",        hi: "My region only"            },
] as const;

const REGIONS = [
  { id: "any",     label: "Anywhere" },
  { id: "north",   label: "North India" },
  { id: "south",   label: "South India" },
  { id: "east",    label: "East India" },
  { id: "west",    label: "West India" },
  { id: "central", label: "Central India" },
];

const CATEGORIES = ["General", "OBC-NCL", "SC", "ST", "EWS"];

const TECH_R  = new Set(["Google","Apple","Microsoft","Amazon","Meta","Flipkart","Adobe","Uber","Qualcomm","Nvidia","Oracle","Samsung","Accenture","Infosys","Wipro","TCS"]);
const FIN_R   = new Set(["Goldman Sachs","JP Morgan Chase","JP Morgan","Deutsche Bank","HSBC","Nomura","DE Shaw","Jane Street"]);
const CORE_R  = new Set(["NTPC","GAIL","IOCL","BPCL","DRDO","HAL","BEL","L&T","Bosch","Hero Moto Corp","Airbus","BHEL"]);
const STARTUP_R = new Set(["Uber","Flipkart","Adobe","Qualcomm","Nvidia","Razorpay","Paytm","CRED","Swiggy","Zomato"]);

const REGION_STATES: Record<string, string[]> = {
  north:   ["Delhi","Uttar Pradesh","Punjab","Haryana","Himachal Pradesh","Uttarakhand","Jammu","Kashmir","Rajasthan","Bihar"],
  south:   ["Tamil Nadu","Kerala","Karnataka","Andhra Pradesh","Telangana"],
  east:    ["West Bengal","Odisha","Bihar","Jharkhand","Assam","Tripura","Meghalaya","Manipur","Nagaland"],
  west:    ["Maharashtra","Gujarat","Goa"],
  central: ["Madhya Pradesh","Chhattisgarh"],
};

/* ─────────────── scoring functions ─────────────── */
function norm(val: number, min: number, max: number): number {
  if (!val || max === min) return 0;
  return Math.max(0, Math.min(1, (val - min) / (max - min)));
}

function getPlacementScore(c: College): number {
  return norm(c.avgPackageLPA || 0, 12, 36) * 0.4
       + norm(c.placementPercent || 0, 40, 100) * 0.35
       + norm(c.peakPackageCR || 0, 0.5, 3) * 0.25;
}

function getResearchScore(c: College): number {
  const nirfS = c.nirfRank ? norm(1 / c.nirfRank, 1 / 85, 1 / 1) : 0;
  const qsS   = c.qsWorldRank ? norm(1 / c.qsWorldRank, 0, 1 / 150) : 0;
  return nirfS * 0.6 + qsS * 0.4;
}

function getPrestigeScore(c: College): number {
  return c.nirfRank ? norm(1 / c.nirfRank, 1 / 85, 1 / 1) : 0.2;
}

function getCampusScore(c: College): number {
  return norm(c.campusAreaAcres || 0, 50, 1000) * 0.6
       + norm(c.totalStudents || 0, 1000, 15000) * 0.4;
}

function getLocationScore(c: College, region: string): number {
  if (region === "any") return 0.5;
  const states = REGION_STATES[region] || [];
  const match = states.some(s => (c.state || "").toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes((c.state || "").toLowerCase()));
  return match ? 1.0 : 0.2;
}

function getCareerScore(c: College, goal: GoalId): number {
  const r = c.topRecruiters || [];
  switch (goal) {
    case "tech":     return norm(r.filter(x => TECH_R.has(x)).length, 0, 9);
    case "finance":  return norm(r.filter(x => FIN_R.has(x)).length, 0, 5);
    case "core":     return norm(r.filter(x => CORE_R.has(x)).length, 0, 8);
    case "startup":  return norm(r.filter(x => STARTUP_R.has(x)).length, 0, 4) * 0.6 + norm(c.placementPercent || 0, 50, 100) * 0.4;
    case "research": return getResearchScore(c) * 0.7 + (c.type === "IIT" ? 0.3 : 0);
    case "mba":      return getPrestigeScore(c) * 0.8 + norm(c.avgPackageLPA || 0, 12, 36) * 0.2;
    default:         return 0.5;
  }
}

function getMatchLabel(rank: number, cutoff: number): FitResult["label"] {
  const r = rank / cutoff;
  if (r <= 0.75) return "Safe";
  if (r <= 1.0)  return "Moderate";
  if (r <= 1.35) return "Reach";
  return "Out";
}

function computeFit(c: College, priorities: Priorities, goal: GoalId, region: string, userRank: number): FitResult {
  const placementS = getPlacementScore(c);
  const researchS  = getResearchScore(c);
  const prestigeS  = getPrestigeScore(c);
  const campusS    = getCampusScore(c);
  const locationS  = getLocationScore(c, region);
  const careerS    = getCareerScore(c, goal);

  const weights = { placement: priorities.placement, prestige: priorities.prestige, research: priorities.research, campus: priorities.campus, location: priorities.location, career: 8 };
  const scores  = { placement: placementS, prestige: prestigeS, research: researchS, campus: campusS, location: locationS, career: careerS };
  const totalW  = Object.values(weights).reduce((a, b) => a + b, 0);
  const weighted = (Object.keys(weights) as (keyof typeof weights)[]).reduce((sum, k) => sum + scores[k] * weights[k], 0);
  const raw = weighted / totalW;
  const score = Math.min(99, Math.round(raw * 100));

  const whyFits: string[] = [];
  if (careerS   > 0.55) whyFits.push(`${GOALS.find(g => g.id === goal)?.sub?.split("·")[0].trim()} recruiters present`);
  if (placementS > 0.6) whyFits.push(`Strong placements — ₹${c.avgPackageLPA}L avg, ${c.placementPercent}% placed`);
  if (prestigeS  > 0.7) whyFits.push(`Elite brand — NIRF #${c.nirfRank}`);
  if (locationS >= 1.0) whyFits.push(`In your preferred region`);
  if (researchS  > 0.65) whyFits.push(`Top research output, QS #${c.qsWorldRank || "N/A"}`);
  if (campusS    > 0.5) whyFits.push(`Large ${c.campusAreaAcres}-acre campus`);

  const label = c.cseCutoffRank ? getMatchLabel(userRank, c.cseCutoffRank) : "Out";

  return { score, career: Math.round(careerS * 100), placementS: Math.round(placementS * 100), researchS: Math.round(researchS * 100), prestigeS: Math.round(prestigeS * 100), locationS: Math.round(locationS * 100), whyFits, label };
}

/* ─────────────── sub-components ─────────────── */
function FitCircle({ score, size = 80 }: { score: number; size?: number }) {
  const color = score >= 75 ? "#2a7a3b" : score >= 55 ? "#b45309" : "#6b7280";
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.22} fontWeight="600" fill={color}
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
        className="rotate-90">
        {score}%
      </text>
    </svg>
  );
}

const LABEL_STYLE: Record<string, string> = {
  Safe:     "bg-[#beffcb] text-[#2a7a3b]",
  Moderate: "bg-[#fff0b3] text-[#7a5e00]",
  Reach:    "bg-[#ffd6d6] text-[#9b2c2c]",
  Out:      "bg-[#f4f0ec] text-[#969696]",
};

/* ─────────────── main page ─────────────── */
export default function Fit() {
  const { data: colleges = [], isLoading } = useListColleges();

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [goal, setGoal] = useState<GoalId>("tech");
  const [priorities, setPriorities] = useState<Priorities>({ placement: 7, prestige: 6, research: 5, campus: 4, location: 4 });
  const [region, setRegion] = useState("any");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("General");
  const [filterLabel, setFilterLabel] = useState<string>("All");
  const [showAll, setShowAll] = useState(false);

  const results = useMemo(() => {
    if (step !== 4 || !rank) return [];
    const userRank = Number(rank);
    return (colleges as College[])
      .filter(c => c.cseCutoffRank)
      .map(c => ({ college: c, fit: computeFit(c, priorities, goal, region, userRank) }))
      .filter(x => x.fit.label !== "Out")
      .sort((a, b) => b.fit.score - a.fit.score);
  }, [step, rank, colleges, priorities, goal, region]);

  const displayed = useMemo(() => {
    let base = results;
    if (filterLabel !== "All") base = base.filter(x => x.fit.label === filterLabel);
    return showAll ? base : base.slice(0, 12);
  }, [results, filterLabel, showAll]);

  const goalObj = GOALS.find(g => g.id === goal)!;

  const handleReset = () => { setStep(0); setGoal("tech"); setRank(""); setPriorities({ placement: 7, prestige: 6, research: 5, campus: 4, location: 4 }); setRegion("any"); setFilterLabel("All"); setShowAll(false); };

  return (
    <div className="bg-[#f8f4f0] min-h-screen">

      {/* ── STEP 0: Landing ── */}
      {step === 0 && (
        <>
          <section className="pt-16 sm:pt-24 pb-12 px-4 border-b border-[#24341d]">
            <div className="container mx-auto max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-[#d1beff] border border-[#24341d] px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#241f23]" />
                <span className="text-xs font-bold text-[#241f23] tracking-widest">NEVER BUILT BEFORE</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-medium text-[#241f23] leading-tight mb-4">
                College Fit Engine.
              </h1>
              <p className="text-base sm:text-xl text-[#969696] max-w-2xl mb-2">
                Every counselling site tells you where your rank can <em>get</em> you.
              </p>
              <p className="text-base sm:text-xl font-medium text-[#241f23] max-w-2xl mb-10">
                We tell you which college is actually <em>right</em> for you.
              </p>
              <p className="text-sm text-[#969696] mb-8 max-w-xl">
                Set your career goal, tune 5 priority sliders, enter your rank — and get a personalised <strong>Fit Score</strong> for every college you can get into. Not just "you qualify". But "this is the one."
              </p>
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-3 bg-[#241f23] text-white px-8 py-4 rounded-[4px] text-base font-medium hover:bg-black transition-colors"
              >
                Find my perfect college
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-[#969696] mt-4">Takes 60 seconds · No login · 100% private</p>
            </div>
          </section>

          {/* How it's different */}
          <section className="py-12 px-4 border-b border-[#24341d]">
            <div className="container mx-auto max-w-3xl">
              <p className="text-xs font-bold text-[#969696] tracking-widest mb-6">HOW IT WORKS</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#24341d] border border-[#24341d]">
                {[
                  { n: "01", t: "Pick your goal", d: "Big Tech, Finance, Core, Research, Startup, or MBA. We optimise scoring for your actual ambition." },
                  { n: "02", t: "Set your priorities", d: "5 sliders — placements, prestige, research, campus life, location. You decide what matters." },
                  { n: "03", t: "Get your Fit Score", d: "Every eligible college gets a 0–100% score. See exactly why each one matches (or doesn't)." },
                ].map(c => (
                  <div key={c.n} className="bg-white p-6">
                    <span className="text-xs text-[#969696] tracking-widest">{c.n}</span>
                    <h3 className="text-base font-medium text-[#241f23] mt-2 mb-2">{c.t}</h3>
                    <p className="text-xs text-[#969696] leading-relaxed">{c.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── STEP 1: Career Goal ── */}
      {step === 1 && (
        <section className="pt-14 sm:pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <StepHeader step={1} total={3} onBack={() => setStep(0)} />
            <h2 className="text-2xl sm:text-4xl font-medium text-[#241f23] mt-4 mb-2">What's your career goal?</h2>
            <p className="text-sm text-[#969696] mb-8">Pick the path that excites you most. This shapes how we score each college.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`text-left p-5 rounded-lg border-2 transition-all ${
                    goal === g.id
                      ? "border-[#241f23] bg-white shadow-sm"
                      : "border-[#d1d5db] bg-white hover:border-[#24341d]/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {(() => { const Icon = GOAL_ICONS[g.id as keyof typeof GOAL_ICONS]; return <div className="w-8 h-8 rounded-md bg-[#f4f0ec] flex items-center justify-center shrink-0 mt-0.5"><Icon className="w-4 h-4 text-[#241f23]" /></div>; })()}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#241f23]">{g.title}</p>
                      <p className="text-xs text-[#969696] mt-0.5">{g.sub}</p>
                      <p className="text-xs text-[#241f23]/70 mt-1.5 leading-relaxed">{g.desc}</p>
                    </div>
                    {goal === g.id && (
                      <div className="w-5 h-5 rounded-full bg-[#241f23] flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-8 inline-flex items-center gap-2 bg-[#241f23] text-white px-8 py-3.5 rounded-[4px] font-medium hover:bg-black transition-colors"
            >
              Next — Set priorities <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 2: Priority Sliders ── */}
      {step === 2 && (
        <section className="pt-14 sm:pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <StepHeader step={2} total={3} onBack={() => setStep(1)} />
            <h2 className="text-2xl sm:text-4xl font-medium text-[#241f23] mt-4 mb-2">What matters to you?</h2>
            <p className="text-sm text-[#969696] mb-8">Drag each slider to set how much each factor matters. This directly changes your fit scores.</p>

            <div className="space-y-6 bg-white border border-[#24341d] rounded-lg p-6">
              {PRIORITY_LABELS.map(({ key, label, lo, hi }) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#241f23]">{label}</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8,9,10].map(v => (
                        <div key={v} className={`w-2 h-4 rounded-sm transition-colors ${v <= priorities[key as keyof Priorities] ? "bg-[#241f23]" : "bg-[#e5e7eb]"}`} />
                      ))}
                    </div>
                  </div>
                  <input
                    type="range" min={1} max={10} value={priorities[key as keyof Priorities]}
                    onChange={e => setPriorities(p => ({ ...p, [key]: +e.target.value }))}
                    className="w-full accent-[#241f23]"
                  />
                  <div className="flex justify-between text-[10px] text-[#969696] mt-1">
                    <span>{lo}</span>
                    <span>{hi}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white border border-[#24341d] rounded-lg p-5">
              <p className="text-xs font-bold text-[#969696] tracking-widest mb-3">PREFERRED REGION</p>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRegion(r.id)}
                    className={`px-3 py-2 text-xs rounded-[4px] border font-medium transition-colors ${
                      region === r.id ? "bg-[#241f23] text-white border-[#241f23]" : "bg-white text-[#241f23] border-[#d1d5db] hover:border-[#24341d]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="mt-8 inline-flex items-center gap-2 bg-[#241f23] text-white px-8 py-3.5 rounded-[4px] font-medium hover:bg-black transition-colors"
            >
              Next — Enter your rank <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 3: Rank + Category ── */}
      {step === 3 && (
        <section className="pt-14 sm:pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-xl">
            <StepHeader step={3} total={3} onBack={() => setStep(2)} />
            <h2 className="text-2xl sm:text-4xl font-medium text-[#241f23] mt-4 mb-2">Your rank & category.</h2>
            <p className="text-sm text-[#969696] mb-8">We'll filter to only colleges you're eligible for, then score them by fit.</p>

            <div className="bg-white border border-[#24341d] rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-xs text-[#969696] tracking-widest mb-2">JEE RANK</label>
                <input
                  type="number" value={rank} min={1} max={1500000}
                  onChange={e => setRank(e.target.value)}
                  placeholder="e.g. 4500"
                  className="w-full h-12 px-4 border border-[#24341d] rounded-[4px] text-lg focus:outline-none focus:border-black bg-[#f8f4f0]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#969696] tracking-widest mb-2">CATEGORY</label>
                <div className="relative">
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full h-12 px-4 border border-[#24341d] rounded-[4px] text-base bg-[#f8f4f0] appearance-none focus:outline-none focus:border-black">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Profile summary */}
            <div className="mt-4 bg-[#241f23] text-white rounded-lg p-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {(() => { const Icon = GOAL_ICONS[goalObj.id as keyof typeof GOAL_ICONS]; return <Icon className="w-4 h-4" />; })()}
                <span className="text-sm font-medium">{goalObj.title}</span>
              </div>
              <span className="text-[#969696]">·</span>
              <span className="text-sm text-[#969696]">
                Top priority: {PRIORITY_LABELS.reduce((best, p) =>
                  priorities[p.key as keyof Priorities] > priorities[best.key as keyof Priorities] ? p : best
                ).label}
              </span>
              <span className="text-[#969696]">·</span>
              <span className="text-sm text-[#969696]">{REGIONS.find(r => r.id === region)?.label}</span>
            </div>

            <button
              disabled={!rank || isNaN(Number(rank)) || isLoading}
              onClick={() => setStep(4)}
              className="mt-8 w-full inline-flex items-center justify-center gap-2 bg-[#241f23] disabled:opacity-40 text-white px-8 py-4 rounded-[4px] font-medium hover:bg-black transition-colors text-base"
            >
              <Sparkles className="w-5 h-5" />
              {isLoading ? "Loading colleges…" : "Generate my Fit Scores"}
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 4: Results ── */}
      {step === 4 && (
        <section className="pt-14 sm:pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-3xl">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  {(() => { const Icon = GOAL_ICONS[goalObj.id as keyof typeof GOAL_ICONS]; return <Icon className="w-4 h-4 text-[#969696]" />; })()}
                  <span className="text-xs font-bold text-[#969696] tracking-widest">{goalObj.title.toUpperCase()} · RANK {Number(rank).toLocaleString("en-IN")} · {category}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-medium text-[#241f23]">Your college matches.</h2>
                <p className="text-sm text-[#969696] mt-1">{results.length} eligible colleges scored by how well they fit <em>your</em> goals.</p>
              </div>
              <button onClick={handleReset} className="flex items-center gap-2 text-xs text-[#969696] border border-[#d1d5db] px-3 py-2 rounded-[4px] hover:border-[#24341d] hover:text-[#241f23] transition-colors shrink-0">
                <RefreshCw className="w-3.5 h-3.5" /> Start over
              </button>
            </div>

            {/* Top match hero */}
            {results.length > 0 && (
              <div className="mb-6 bg-[#241f23] rounded-lg p-5 flex items-center gap-4">
                <AvatarLogo
                  src={results[0].college.logoUrl || `/logos/${results[0].college.slug}.png`}
                  alt={results[0].college.name} fallback={results[0].college.type.charAt(0)}
                  type={results[0].college.type} size="md" rounded="full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#d1beff] tracking-widest mb-1">✦ YOUR BEST MATCH</p>
                  <p className="text-lg font-medium text-white line-clamp-1">{results[0].college.name}</p>
                  <p className="text-sm text-[#969696]">{results[0].fit.whyFits[0]}</p>
                </div>
                <div className="shrink-0">
                  <FitCircle score={results[0].fit.score} size={72} />
                </div>
              </div>
            )}

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["All", "Safe", "Moderate", "Reach"].map(l => (
                <button key={l} onClick={() => setFilterLabel(l)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filterLabel === l ? "bg-[#241f23] text-white border-[#241f23]" : "bg-white text-[#969696] border-[#d1d5db] hover:border-[#24341d]"
                  }`}
                >
                  {l}
                  {l !== "All" && <span className="ml-1 opacity-60">({results.filter(x => x.fit.label === l).length})</span>}
                </button>
              ))}
            </div>

            {/* Results cards */}
            {displayed.length === 0 ? (
              <p className="text-sm text-[#969696] py-8 text-center">No colleges match this filter.</p>
            ) : (
              <div className="space-y-3">
                {displayed.map(({ college, fit }, idx) => (
                  <div key={college.id} className="bg-white border border-[#d1d5db] hover:border-[#24341d] rounded-lg transition-all group">
                    <div className="p-4 flex items-start gap-4">
                      {/* Rank badge */}
                      <div className="hidden sm:flex w-8 h-8 rounded-full bg-[#f4f0ec] items-center justify-center text-xs font-bold text-[#969696] shrink-0 mt-1">
                        {idx + 1}
                      </div>
                      {/* Logo */}
                      <AvatarLogo
                        src={college.logoUrl || `/logos/${college.slug}.png`}
                        alt={college.name} fallback={college.type.charAt(0)}
                        type={college.type} size="sm" rounded="full"
                      />
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <p className="text-sm font-medium text-[#241f23] line-clamp-1">{college.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${LABEL_STYLE[fit.label]}`}>{fit.label}</span>
                        </div>
                        <p className="text-xs text-[#969696] mt-0.5">{college.location} · {college.type}{college.nirfRank ? ` · NIRF #${college.nirfRank}` : ""}</p>
                        {/* Why fits */}
                        {fit.whyFits.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {fit.whyFits.slice(0, 2).map((w, i) => (
                              <span key={i} className="text-[10px] bg-[#f4f0ec] text-[#352d33] px-2 py-0.5 rounded-full">{w}</span>
                            ))}
                          </div>
                        )}
                        {/* Sub scores */}
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-[10px] text-[#969696]">Career {fit.career}%</span>
                          <span className="text-[10px] text-[#969696]">Placement {fit.placementS}%</span>
                          <span className="text-[10px] text-[#969696]">Prestige {fit.prestigeS}%</span>
                        </div>
                      </div>
                      {/* Fit circle + link */}
                      <div className="flex items-center gap-2 shrink-0">
                        <FitCircle score={fit.score} size={60} />
                        <Link href={`/colleges/${college.slug}`}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-[#d1d5db] text-[#969696] hover:border-[#24341d] hover:text-[#241f23] transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showAll && results.filter(x => filterLabel === "All" || x.fit.label === filterLabel).length > 12 && (
              <button onClick={() => setShowAll(true)} className="mt-4 w-full py-3 border border-[#24341d] rounded-lg text-sm text-[#241f23] hover:bg-white transition-colors">
                Show all {results.filter(x => filterLabel === "All" || x.fit.label === filterLabel).length} colleges
              </button>
            )}

            {results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-base font-medium text-[#241f23] mb-2">No colleges found for rank {Number(rank).toLocaleString("en-IN")}</p>
                <p className="text-sm text-[#969696] mb-4">Your rank may be outside the range of our current dataset.</p>
                <button onClick={handleReset} className="text-sm border border-[#24341d] px-4 py-2 rounded-[4px] hover:bg-white transition-colors">Try a different rank</button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ─────────────── step header ─────────────── */
function StepHeader({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <button onClick={onBack} className="text-xs text-[#969696] hover:text-[#241f23] flex items-center gap-1 transition-colors">
        ← Back
      </button>
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i < step ? "w-8 bg-[#241f23]" : i === step - 1 ? "w-8 bg-[#241f23]" : "w-4 bg-[#d1d5db]"}`} />
        ))}
      </div>
      <span className="text-xs text-[#969696]">Step {step} of {total}</span>
    </div>
  );
}
