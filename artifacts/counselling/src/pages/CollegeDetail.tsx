import { useState } from "react";
import { Link } from "wouter";
import {
  useGetCollege,
  useGetCollegePlacements,
  useGetCollegeCutoffs,
  useGetCollegeHostels,
  useGetCollegeDepartments,
  useGetCollegeInternships,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarLogo } from "@/components/ui/avatar-logo";
import { ArrowRight } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const TABS = [
  "PLACEMENTS",
  "OVERVIEW",
  "CUTOFFS",
  "ALL DEPARTMENTS",
  "INTERNSHIPS",
  "LABS & FACILITIES",
  "HOSTELS",
  "LINKEDIN & ALUMNI",
];

const COLORS = ["#beffcb", "#d1beff", "#241f23", "#d1d5db"];
const CATEGORIES = [
  "OPEN",
  "OBC-NCL",
  "SC",
  "ST",
  "EWS",
  "OBC-NCL-PWD",
  "SC-PWD",
  "ST-PWD",
  "EWS-PWD",
];
const GENDERS = ["Gender-Neutral", "Female-only"];
const YEARS = [2025, 2024, 2023, 2022, 2021];
const ROUNDS = [6, 5, 4, 3, 2, 1];

export default function CollegeDetail({
  params,
}: {
  params: { slug: string };
}) {
  const id = params.slug;
  const [activeTab, setActiveTab] = useState("PLACEMENTS");
  const [cutoffYear, setCutoffYear] = useState(2025);
  const [cutoffRound, setCutoffRound] = useState(6);
  const [cutoffCategory, setCutoffCategory] = useState("OPEN");
  const { data: college, isLoading } = useGetCollege(id);
  const { data: placements } = useGetCollegePlacements(id);
  const { data: cutoffs } = useGetCollegeCutoffs(id, {
    year: cutoffYear,
    round: cutoffRound,
    category: cutoffCategory,
  });
  const { data: hostels } = useGetCollegeHostels(id);
  const { data: departments } = useGetCollegeDepartments(id);
  const { data: internships } = useGetCollegeInternships(id);

  if (isLoading) {
    return (
      <div className="p-12">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!college)
    return (
      <div className="p-12 text-center text-[#969696]">College not found</div>
    );

  const selectCls =
    "border border-[#24341d] rounded-[4px] px-3 py-2 text-xs font-bold text-[#241f23] bg-white focus:outline-none focus:border-black cursor-pointer";

  return (
    <div className="bg-[#f8f4f0] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#24341d] sticky top-14 sm:top-16 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <AvatarLogo
            src={college.logoUrl || `/logos/${college.slug}.png`}
            alt={college.name}
            fallback={college.name.charAt(0)}
            type={college.type}
            size="md"
            rounded="full"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl md:text-2xl font-medium tracking-tight text-[#241f23] truncate">
              {college.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-[4px] bg-[#f4f0ec] text-[#241f23]">
                {college.type}
              </span>
              {college.nirfRank && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-[4px] border border-[#d1d5db] text-[#969696]">
                  NIRF #{college.nirfRank}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 border-b border-[#24341d]">
        <p className="text-sm font-sans text-[#969696]">
          Location: {college.location} · Admission: {college.admissionThrough}.
        </p>
      </div>

      {/* Marquee */}
      <div className="bg-[#beffcb] border-b border-[#24341d]/50 py-2 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee font-sans text-sm tracking-normal">
          {Array(6)
            .fill(
              `Avg Package ₹${college.avgPackageLPA} LPA · NIRF Engg #${college.nirfRank} · QS World #${college.qsWorldRank || "N/A"} · Placement % ${college.placementPercent || "N/A"}% · Total Offers ${college.totalOffers || "N/A"} · Highest PKG ₹${college.peakPackageCR} Cr · `,
            )
            .join("")}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-[#241f23] text-white">
        <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#332f31] border border-[#24341d]">
            {[
              { label: "HIGHEST PKG", value: `₹${college.peakPackageCR}Cr` },
              { label: "AVG PKG", value: `₹${college.avgPackageLPA}L` },
              { label: "NIRF", value: `#${college.nirfRank || "-"}` },
              { label: "QS WORLD", value: `#${college.qsWorldRank || "-"}` },
              { label: "PLACED", value: `${college.placementPercent || "-"}%` },
              { label: "OFFERS", value: college.totalOffers || "-" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-[#241f23] p-3 sm:p-6 text-center flex flex-col justify-center"
              >
                <div className="text-lg sm:text-2xl lg:text-3xl font-medium tracking-tight mb-1 sm:mb-2 text-white">
                  {s.value}
                </div>
                <div className="text-[9px] sm:text-xs font-sans tracking-widest text-[#969696]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="container mx-auto px-4 py-6 border-b border-[#24341d] flex gap-3 overflow-x-auto">
        {college.naacGrade && (
          <span className="whitespace-nowrap px-3 py-1 bg-[#beffcb] text-black text-xs font-sans rounded-[4px]">
            NAAC {college.naacGrade} Grade
          </span>
        )}
        {college.tags?.slice(0, 4).map((t, i) => (
          <span
            key={i}
            className="whitespace-nowrap px-3 py-1 bg-[#f4f0ec] text-[#241f23] text-xs font-sans rounded-[4px]"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="flex gap-5 sm:gap-8 border-b border-[#24341d] overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 sm:pb-4 text-[10px] sm:text-xs font-sans whitespace-nowrap tracking-wider transition-colors ${
                activeTab === tab
                  ? "text-[#241f23] border-b-2 border-[#24341d]"
                  : "text-[#969696] hover:text-[#241f23]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-12">
        {/* ── PLACEMENTS ── */}
        {activeTab === "PLACEMENTS" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-3xl font-sans">
                Placements {placements?.year || 2024}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-[#24341d]">
                  <h3 className="text-sm font-sans text-[#969696] mb-6 tracking-widest">
                    SECTOR BREAKDOWN
                  </h3>
                  <div className="h-64">
                    {placements?.sectorBreakdown ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={placements.sectorBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="firms"
                          >
                            {placements.sectorBreakdown.map((_, idx) => (
                              <Cell
                                key={idx}
                                fill={COLORS[idx % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#969696] text-sm font-medium bg-[#f4f0ec] rounded-lg">
                        No chart data
                      </div>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {placements?.sectorBreakdown?.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-medium"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="truncate">{s.sector}</span>
                        <span className="ml-auto text-lable-large text-[#241f23]">
                          {s.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#24341d] overflow-hidden">
                  <div className="p-4 border-b border-[#24341d] bg-[#f4f0ec]">
                    <h3 className="text-sm font-bold text-[#969696] tracking-widest">
                      KEY METRICS
                    </h3>
                  </div>
                  <div className="divide-y divide-[#24341d]/50">
                    {[
                      ["Total Offers Made", placements?.totalOffers || "-"],
                      [
                        "Companies Registered",
                        placements?.companiesRegistered || "-",
                      ],
                      [
                        "Companies Made Offers",
                        placements?.companiesOffered || "-",
                      ],
                      [
                        "International Offers",
                        placements?.internationalOffers || "-",
                      ],
                      [
                        "MBA Placed %",
                        placements?.mbdPlacedPercent
                          ? `${placements.mbdPlacedPercent}%`
                          : "-",
                      ],
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between p-4 text-sm">
                        <span className="font-medium text-[#969696]">
                          {row[0]}
                        </span>
                        <span className="font-bold text-[#241f23]">
                          {row[1]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Year-wise trend */}
              {placements?.yearWiseTrend &&
                placements.yearWiseTrend.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-[#24341d]">
                    <h3 className="text-sm font-sans text-[#969696] mb-6 tracking-widest">
                      YEAR-WISE TREND
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={placements.yearWiseTrend}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f4f0ec"
                          />
                          <XAxis
                            dataKey="year"
                            tick={{
                              fontSize: 11,
                              fontFamily: "PP Neue Montreal",
                            }}
                          />
                          <YAxis
                            tick={{
                              fontSize: 11,
                              fontFamily: "PP Neue Montreal",
                            }}
                          />
                          <RechartsTooltip />
                          <Area
                            type="monotone"
                            dataKey="avgPackageLPA"
                            stroke="#241f23"
                            fill="#beffcb"
                            name="Avg PKG (LPA)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-sans mb-4">Top Recruiters</h2>
                <div className="flex flex-wrap gap-2">
                  {(
                    college.topRecruiters ||
                    placements?.topRecruiters ||
                    []
                  ).map((c, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-white border border-[#24341d] rounded-[4px] text-sm font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-sans mb-4">Cutoffs Preview</h2>
                <div className="bg-white rounded-xl border border-[#24341d] overflow-hidden">
                  <div className="p-4 border-b border-[#24341d] bg-[#f4f0ec]">
                    <span className="text-sm font-lable-base">
                      Open Category · Round 6 · 2025
                    </span>
                  </div>
                  <div className="divide-y divide-[#24341d]/40">
                    {cutoffs?.slice(0, 5).map((c, i) => (
                      <div
                        key={i}
                        className="p-4 flex justify-between items-center text-sm"
                      >
                        <span className="font-medium truncate pr-4">
                          {c.branch}
                        </span>
                        <span className="font-lable-base bg-[#beffcb] px-2 py-0.5 rounded-[2px] shrink-0">
                          {c.closeRank}
                        </span>
                      </div>
                    )) || (
                      <div className="p-4 text-sm text-[#969696]">
                        No cutoff data
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-[#f4f0ec] text-center border-t border-[#d1d5db]">
                    <button
                      onClick={() => setActiveTab("CUTOFFS")}
                      className="text-sm font-bold text-black hover:text-primary transition-colors flex items-center justify-center gap-1.5 w-full group"
                    >
                      <span>VIEW ALL CUTOFFS</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === "OVERVIEW" && (
          <div className="max-w-4xl space-y-12">
            <div>
              <h2 className="text-3xl font-sans mb-6">About {college.name}</h2>
              <p className="text-[#969696] text-data-large text-lg leading-relaxed">
                {college.about ||
                  college.description ||
                  `${college.name} is a premier ${college.type} institute located in ${college.location}, ${college.state}. Established in ${college.established}, it is one of India's top engineering institutions.`}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "CAMPUS AREA",
                  value: college.campusAreaAcres
                    ? `${college.campusAreaAcres} Acres`
                    : "—",
                },
                {
                  label: "TOTAL STUDENTS",
                  value: college.totalStudents?.toLocaleString("en-IN") || "—",
                },
                {
                  label: "TOTAL FACULTY",
                  value: college.totalFaculty?.toLocaleString("en-IN") || "—",
                },
                { label: "ESTABLISHED", value: college.established || "—" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-[#24341d] text-center"
                >
                  <div className="text-2xl font-sans text-[#241f23] mb-1 tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs text-data-base text-[#969696] tracking-widest">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-[#24341d] overflow-hidden">
                <div className="p-4 border-b border-[#24341d] bg-[#f4f0ec]">
                  <h3 className="text-sm font-sans text-[#969696] tracking-widest">
                    ADMISSION & LINKS
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-[#969696] mb-1">
                      ADMITTED THROUGH
                    </p>
                    <p className="font-medium text-[#241f23]">
                      {college.admissionThrough}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#969696] mb-1">
                      LOCATION
                    </p>
                    <p className="font-medium text-[#241f23]">
                      {college.location}, {college.state}
                    </p>
                  </div>
                  {college.website && (
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-sans bg-[#d1beff] text-[#111111] hover:bg-[#352d33] hover:text-white border border-[#24341d] px-4 py-2 rounded-[4px] transition-colors group"
                    >
                      <span>VISIT OFFICIAL WEBSITE</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#24341d] overflow-hidden">
                <div className="p-4 border-b border-[#24341d] bg-[#f4f0ec]">
                  <h3 className="text-sm font-sans text-[#969696] tracking-widest">
                    TAGS & ACCREDITATION
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {college.naacGrade && (
                      <span className="px-3 py-1 bg-[#beffcb] text-black text-xs font-sans rounded-[4px]">
                        NAAC {college.naacGrade}
                      </span>
                    )}
                    {college.tags?.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#f4f0ec] text-[#241f23] text-xs font-sans rounded-[4px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CUTOFFS ── */}
        {activeTab === "CUTOFFS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-display-s">Cutoff Data</h2>
              <span className="text-sm text-[#969696] font-sans">
                {cutoffs?.length || 0} records found
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={cutoffYear}
                onChange={(e) => setCutoffYear(Number(e.target.value))}
                className={selectCls}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={cutoffRound}
                onChange={(e) => setCutoffRound(Number(e.target.value))}
                className={selectCls}
              >
                {ROUNDS.map((r) => (
                  <option key={r} value={r}>
                    Round {r}
                  </option>
                ))}
              </select>
              <select
                value={cutoffCategory}
                onChange={(e) => setCutoffCategory(e.target.value)}
                className={selectCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {/* Gender filter removed - API does not support gender param for cutoffs */}
            </div>

            <div className="bg-white rounded-xl border border-[#24341d] overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] text-xs font-bold text-[#969696] tracking-widest bg-[#f4f0ec] border-b border-[#24341d]">
                {[
                  "BRANCH",
                  "CATEGORY",
                  "QUOTA",
                  "OPEN RANK",
                  "CLOSE RANK",
                  "ROUND",
                ].map((h, i) => (
                  <div key={i} className={`p-4 ${i > 2 ? "text-right" : ""}`}>
                    {h}
                  </div>
                ))}
              </div>
              <div className="divide-y divide-[#24341d]/50">
                {cutoffs && cutoffs.length > 0 ? (
                  cutoffs.map((c, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] text-sm hover:bg-[#f8f4f0] transition-colors"
                    >
                      <div className="p-4 font-medium text-[#241f23]">
                        {c.branch}
                      </div>
                      <div className="p-4 font-bold text-center">
                        <span className="bg-[#f4f0ec] px-2 py-0.5 rounded-[2px] text-xs">
                          {c.category}
                        </span>
                      </div>
                      <div className="p-4 text-[#969696] font-medium text-center">
                        {c.quota || "AI"}
                      </div>
                      <div className="p-4 text-right text-[#969696]">
                        {c.openRank?.toLocaleString("en-IN")}
                      </div>
                      <div className="p-4 text-right font-sans text-[#241f23]">
                        <span className="bg-[#beffcb] px-2 py-0.5 rounded-[2px]">
                          {c.closeRank?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="p-4 text-right text-[#969696]">
                        R{c.round}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-[#969696] font-medium">
                    No cutoff data for these filters. Try changing the year,
                    round, or category.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ALL DEPARTMENTS ── */}
        {activeTab === "ALL DEPARTMENTS" && (
          <div className="space-y-6">
            <h2 className="text-display-s">All Departments & Branches</h2>
            {departments && departments.length > 0 ? (
              <div className="bg-white rounded-xl border border-[#24341d] overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] text-xs font-bold text-[#969696] tracking-widest bg-[#f4f0ec] border-b border-[#24341d]">
                  {[
                    "DEPARTMENT",
                    "SEATS",
                    "AVG PKG",
                    "PEAK PKG",
                    "CUTOFF RANK",
                  ].map((h, i) => (
                    <div key={i} className={`p-4 ${i > 0 ? "text-right" : ""}`}>
                      {h}
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-[#24341d]/50">
                  {departments.map((d, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] text-sm hover:bg-[#f8f4f0] transition-colors items-center"
                    >
                      <div className="p-4">
                        <div className="font-sans text-[#241f23]">{d.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-[#f4f0ec] px-2 py-0.5 rounded-[2px] font-sans">
                            {d.code}
                          </span>
                          <span className="text-xs text-[#969696]">
                            {d.duration}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 text-right font-sans text-[#969696]">
                        {d.seats}
                      </div>
                      <div className="p-4 text-right font-sans text-[#241f23]">
                        {d.avgPackageLPA ? `₹${d.avgPackageLPA}L` : "—"}
                      </div>
                      <div className="p-4 text-right font-sans text-[#241f23]">
                        {d.peakPackageLPA ? `₹${d.peakPackageLPA}L` : "—"}
                      </div>
                      <div className="p-4 text-right">
                        {d.cseCutoffRank ? (
                          <span className="bg-[#beffcb] px-2 py-0.5 rounded-[2px] font-sans">
                            {d.cseCutoffRank.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-xl border border-[#d1d5db] text-[#969696] font-medium">
                Department data not yet available for this college.
              </div>
            )}
          </div>
        )}

        {/* ── INTERNSHIPS ── */}
        {activeTab === "INTERNSHIPS" && (
          <div className="space-y-8">
            <h2 className="text-display-s">
              Internships {internships?.year || 2024}
            </h2>
            {internships ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "TOTAL INTERNS",
                      value:
                        internships.totalInterns?.toLocaleString("en-IN") ||
                        "—",
                    },
                    {
                      label: "AVG STIPEND/MO",
                      value: internships.avgStipendPerMonth
                        ? `₹${(internships.avgStipendPerMonth / 1000).toFixed(0)}K`
                        : "—",
                    },
                    {
                      label: "PEAK STIPEND/MO",
                      value: internships.peakStipendPerMonth
                        ? `₹${(internships.peakStipendPerMonth / 1000).toFixed(0)}K`
                        : "—",
                    },
                    {
                      label: "INTERNATIONAL",
                      value: internships.internationalInternships ?? "—",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-xl border border-[#24341d] text-center"
                    >
                      <div className="text-2xl font-sans text-[#241f23] mb-1 tracking-tight">
                        {s.value}
                      </div>
                      <div className="text-data-base text-[#969696] tracking-widest">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
                {internships.conversionToFullTime !== null && (
                  <div className="bg-[#beffcb] rounded-xl p-6 border border-[#24341d]">
                    <p className="text-sm font-sans text-[#241f23]">
                      {internships.conversionToFullTime}% of interns received a
                      full-time Pre-Placement Offer (PPO).
                    </p>
                  </div>
                )}
                {internships.topCompanies &&
                  internships.topCompanies.length > 0 && (
                    <div>
                      <h3 className="text-xl font-sans mb-4">Top Companies</h3>
                      <div className="flex flex-wrap gap-2">
                        {internships.topCompanies.map((c, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-white border border-[#24341d] rounded-[4px] text-sm font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <div className="p-12 text-center bg-white rounded-xl border border-[#d1d5db] text-[#969696] font-medium">
                Internship data not yet available for this college.
              </div>
            )}
          </div>
        )}

        {/* ── LABS & FACILITIES ── */}
        {activeTab === "LABS & FACILITIES" && (
          <div className="space-y-8">
            <h2 className="text-display-s">Labs & Facilities</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-lable-large text-[#969696] tracking-widest mb-4">
                  RESEARCH LABS
                </h3>
                {college.labs && college.labs.length > 0 ? (
                  <div className="space-y-4">
                    {college.labs.map((lab, i) => (
                      <div
                        key={i}
                        className="bg-white p-5 rounded-xl border border-[#24341d]"
                      >
                        <h4 className="font-sans text-[#241f23] mb-1">
                          {lab.name}
                        </h4>
                        {lab.description && (
                          <p className="text-sm text-[#969696] font-medium">
                            {lab.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-[#d1d5db] text-[#969696] font-medium text-sm">
                    Lab data not yet listed.
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-sans text-[#969696] tracking-widest mb-4">
                  CAMPUS FACILITIES
                </h3>
                {college.facilities && college.facilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {college.facilities.map((f, i) => (
                      <span
                        key={i}
                        className="px-3 py-2 bg-white border border-[#24341d] rounded-[4px] text-sm font-medium text-[#241f23]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-[#d1d5db] text-[#969696] font-medium text-sm">
                    Facilities data not yet listed.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HOSTELS ── */}
        {activeTab === "HOSTELS" && (
          <div className="space-y-8">
            <h2 className="text-display-s">Hostel & Accommodation</h2>
            {hostels ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "TOTAL HOSTELS", value: hostels.totalHostels },
                    { label: "BOYS HOSTELS", value: hostels.boysHostels },
                    { label: "GIRLS HOSTELS", value: hostels.girlsHostels },
                    {
                      label: "TOTAL CAPACITY",
                      value:
                        hostels.totalCapacity?.toLocaleString("en-IN") || "—",
                    },
                    {
                      label: "FEE / YEAR",
                      value: hostels.feePerYear
                        ? `₹${(hostels.feePerYear / 1000).toFixed(0)}K`
                        : "—",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-white p-5 rounded-xl border border-[#24341d] text-center"
                    >
                      <div className="text-2xl font-sans text-[#241f23] mb-1">
                        {s.value}
                      </div>
                      <div className="text-xs font-data-base text-[#969696] tracking-widest">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {hostels.amenities && hostels.amenities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-sans text-[#969696] tracking-widest mb-3">
                      AMENITIES
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hostels.amenities.map((a, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-[#beffcb] rounded-[4px] text-sm font-sans text-[#241f23]"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hostels.hostels && hostels.hostels.length > 0 && (
                  <div>
                    <h3 className="text-display-s mb-4">Individual Hostels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hostels.hostels.map((h, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-xl border border-[#24341d] p-5"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-sans text-[#241f23]">
                              {h.name}
                            </h4>
                            <span
                              className={`text-xs font-sans px-2 py-1 rounded-[4px] ${h.type === "Girls" ? "bg-[#d1beff]" : "bg-[#beffcb]"} text-[#241f23]`}
                            >
                              {h.type}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <div className="font-sans text-[#241f23]">
                                {h.capacity}
                              </div>
                              <div className="text-xs text-[#969696]">
                                Capacity
                              </div>
                            </div>
                            <div>
                              <div className="font-sans text-[#241f23]">
                                {h.floors || "—"}
                              </div>
                              <div className="text-xs text-[#969696]">
                                Floors
                              </div>
                            </div>
                            <div>
                              <div className="font-sans text-[#241f23]">
                                {h.feePerYear
                                  ? `₹${(h.feePerYear / 1000).toFixed(0)}K`
                                  : "—"}
                              </div>
                              <div className="text-xs text-[#969696]">
                                Fee/yr
                              </div>
                            </div>
                          </div>
                          {h.amenities && h.amenities.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {h.amenities.map((a, j) => (
                                <span
                                  key={j}
                                  className="text-xs bg-[#f4f0ec] px-2 py-0.5 rounded-[2px] font-medium"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center bg-white rounded-xl border border-[#d1d5db] text-[#969696] font-medium">
                Hostel data not yet available for this college.
              </div>
            )}
          </div>
        )}

        {/* ── LINKEDIN & ALUMNI ── */}
        {activeTab === "LINKEDIN & ALUMNI" && (
          <div className="space-y-8 max-w-2xl">
            <h2 className="text-display-s">LinkedIn & Alumni Network</h2>
            {college.linkedinAlumni ? (
              <div className="bg-[#241f23] text-white rounded-xl p-10 text-center">
                <div className="text-6xl font-sans tracking-tight mb-2">
                  {college.linkedinAlumni?.toLocaleString("en-IN")}
                </div>
                <div className="text-[#969696] text-sm font-sans tracking-widest">
                  ALUMNI ON LINKEDIN
                </div>
              </div>
            ) : null}
            <div className="bg-white rounded-xl border border-[#24341d] p-6 space-y-4">
              <p className="text-[#969696] font-sans leading-relaxed">
                Alumni of {college.name} are spread across{" "}
                {college.topRecruiters?.slice(0, 5).join(", ")} and more. The
                network continues to grow every year.
              </p>
              <p className="text-sm text-[#969696] font-sans">
                LinkedIn & Alumni data is continuously updated. Connect via the
                college's official alumni portal or LinkedIn alumni search.
              </p>
              {college.website && (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-sans border border-[#241f23] px-4 py-2 rounded-[4px] bg-[#d1beff] text-[#111111] hover:bg-[#352d33] hover:text-black transition-colors group"
                >
                  <span>VISIT OFFICIAL ALUMNI PORTAL</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
