import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  useListCounsellings,
  useListColleges,
  useGetPlatformStats,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarLogo } from "@/components/ui/avatar-logo";
import {
  Calendar,
  IndianRupee,
  Home as HomeIcon,
  Zap,
  ArrowRight,
  Search,
  ChevronRight,
} from "lucide-react";

const getColorForType = (type: string): string => {
  const colors: Record<string, string> = {
    IIT: "bg-red-500",
    NIT: "bg-blue-500",
    IIIT: "bg-purple-500",
    GFTI: "bg-green-600",
    BITS: "bg-gray-700",
    Default: "bg-gray-400",
  };
  return colors[type] || colors["Default"];
};

export function CollegeCard({ college }: { college: any }) {
  return (
    <div className="bg-white rounded-xl border border-[#24341d]/50 p-5 sm:p-6 hover:shadow-md transition-shadow relative group h-full flex flex-col">
      <div className="absolute top-4 right-4 bg-[#f8f4f0] text-[#241f23] text-data-base px-2 py-1 rounded-sm text-[10px] sm:text-xs">
        PEAK CTC ₹{college.peakPackageCR}Cr
      </div>
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        <AvatarLogo
          src={college.logoUrl || `/logos/${college.slug}.png`}
          alt={college.name}
          fallback={college.type.charAt(0)}
          type={college.type}
          size="md"
          rounded="full"
        />
        <div className="min-w-0">
          <h3 className="text-base-large text-base sm:text-xl leading-tight group-hover:underline text-[#241f23] line-clamp-1">
            {college.name}
          </h3>
          <p className="text-xs sm:text-sm text-[#969696]">
            {college.location} · {college.state}
          </p>
        </div>
      </div>
      <p className="text-lable-bold text-[#969696] mb-4 line-clamp-1 flex-1 text-xs sm:text-sm">
        {college.tagline || `${college.type} Institute`}
      </p>
      <div className="flex gap-2 mb-4">
        <span className="text-xs font-data-base bg-[#f4f0ec] px-2 py-1 rounded-[4px]">
          EST {college.established}
        </span>
        {college.naacGrade && (
          <span className="text-xs font-data-base bg-[#beffcb] text-[#241f23] px-2 py-1 rounded-[4px]">
            NAAC {college.naacGrade}
          </span>
        )}
      </div>
      <div className="flex justify-between items-end border-t pt-4 mb-4">
        <div>
          <p className="text-xs sm:text-sm font-sans text-[#969696] mb-1">
            CSE CUTOFF
          </p>
          <p className="text-xs sm:text-sm font-sans text-[#241f23]">
            {college.cseCutoffRank || "N/A"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs sm:text-sm font-sans text-[#969696] mb-1">
            AVG PKG
          </p>
          <p className="text-xs sm:text-sm font-sans text-[#241f23]">
            ₹{college.avgPackageLPA}L
          </p>
        </div>
      </div>
      <Link
        href={`/colleges/${college.slug}`}
        className="text-xs font-sans text-black border border-[#24341d]/50 flex items-center justify-center bg-[#d1beff] text-[#111111] hover:bg-[#352d33] hover:text-white gap-1.5 py-2 rounded-[4px] hover:bg-black hover:text-white transition-colors mt-auto"
      >
        <span>VIEW DASHBOARD</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

const JEE_ACTIVE_IDS = ["josaa", "csab"];

export function CounsellingCard({ counselling }: { counselling: any }) {
  const isActive = JEE_ACTIVE_IDS.includes(counselling.id);

  if (!isActive) {
    return (
      <div className="block h-full cursor-not-allowed">
        <div className="bg-white rounded-2xl border border-[#d1d5db]/50 p-5 sm:p-6 h-full flex flex-col relative opacity-60">
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-[#241f23] text-white text-[9px] tracking-widest font-sans px-2 py-1 rounded-full uppercase">
              Coming Soon
            </span>
          </div>
          <div className="mb-3 sm:mb-4">
            <AvatarLogo
              src={counselling.logoUrl || `/logos/${counselling.slug}.png`}
              alt={counselling.name}
              fallback={counselling.name.charAt(0)}
              size="sm"
              rounded="full"
            />
          </div>
          <h3 className="text-body-large mb-1 text-[#969696] text-sm sm:text-base">
            {counselling.name}
          </h3>
          <p className="text-[10px] tracking-wider font-sans text-[#969696] uppercase mb-4">
            {counselling.type} · {counselling.level}
          </p>
          <p className="text-[#969696] text-data-large font-medium mt-auto text-xs sm:text-sm">
            {counselling.startMonth.substring(0, 3).toUpperCase()} –{" "}
            {counselling.endMonth.substring(0, 3).toUpperCase()}{" "}
            {counselling.startYear}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/counsellings/${counselling.slug}`} className="block h-full">
      <div className="bg-white rounded-2xl border border-[#24341d]/50 p-5 sm:p-6 hover:shadow-md transition-shadow h-full flex flex-col group relative">
        <div className="mb-3 sm:mb-4">
          <AvatarLogo
            src={counselling.logoUrl || `/logos/${counselling.slug}.png`}
            alt={counselling.name}
            fallback={counselling.name.charAt(0)}
            size="sm"
            rounded="full"
          />
        </div>
        <h3 className="text-body-large mb-1 group-hover:underline text-[#241f23] text-sm sm:text-base">
          {counselling.name}
        </h3>
        <p className="text-[10px] tracking-wider font-sans text-[#969696] uppercase mb-4">
          {counselling.type} · {counselling.level}
        </p>
        <p className="text-[#969696] text-data-large font-medium mt-auto text-xs sm:text-sm">
          {counselling.startMonth.substring(0, 3).toUpperCase()} –{" "}
          {counselling.endMonth.substring(0, 3).toUpperCase()}{" "}
          {counselling.startYear}
        </p>
        <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 text-black opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Link>
  );
}

function ScrollHint() {
  return (
    <div className="flex items-center gap-1.5 mt-3 sm:hidden">
      <span className="text-[10px] text-[#969696] tracking-widest font-sans">
        SWIPE
      </span>
      <ChevronRight className="w-3 h-3 text-[#969696]" />
    </div>
  );
}

function StatsMobileStrip({
  stats,
  allColleges,
}: {
  stats: any;
  allColleges: any[] | undefined;
}) {
  const colleges =
    allColleges && allColleges.length > 0 ? allColleges.length : 35;
  return (
    <div className="border-y border-[#24341d] py-3 overflow-hidden md:hidden">
      <div className="relative overflow-hidden">
        <div className="flex gap-8 animate-marquee-stats whitespace-nowrap w-max">
          {[
            `${colleges}+ COLLEGES`,
            `${stats?.totalCounsellings || 12} COUNSELLINGS`,
            `${stats?.totalCutoffRecords || "3144"}+ CUTOFF RECORDS`,
            `UPDATED ${stats?.lastUpdated || "2026-06-11"}`,
            `${colleges}+ COLLEGES`,
            `${stats?.totalCounsellings || 12} COUNSELLINGS`,
            `${stats?.totalCutoffRecords || "3144"}+ CUTOFF RECORDS`,
            `UPDATED ${stats?.lastUpdated || "2026-06-11"}`,
          ].map((item, i) => (
            <span
              key={i}
              className="text-xs font-sans text-[#241f23] tracking-widest shrink-0"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CollegeLogo({ slug, name }: { slug: string; name: string }) {
  return (
    <img
      src={`/logos/${slug}.png`}
      alt={name}
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        el.style.display = "none";
        const fb = el.nextElementSibling as HTMLElement | null;
        if (fb) fb.style.display = "flex";
      }}
      className="w-9 h-9 rounded-full object-contain bg-white border border-[#e5e7eb] p-0.5 shrink-0"
    />
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: counsellings, isLoading: isCounsellingsLoading } =
    useListCounsellings();
  const { data: colleges, isLoading: isCollegesLoading } = useListColleges({
    featured: true,
  });
  const { data: allColleges } = useListColleges();
  const { data: stats } = useGetPlatformStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/colleges?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/colleges");
    }
  };

  return (
    <div className="bg-[#f8f4f0]">
      {/* ── Hero ── */}
      <section className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#241f23] mb-4 sm:mb-6 leading-tight">
            Find your college.
            <br />
            Own your rank.
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-black/80 mb-8 sm:mb-10 max-w-2xl mx-auto text-data-large px-2">
            India's most intelligent engineering college counselling guide.
            Precise data for JoSAA, CSAB, and state counsellings.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search colleges, counsellings, branches..."
                className="w-full h-12 sm:h-14 pl-11 pr-4 rounded-[4px] border border-[#24341d] focus:outline-none focus:border-black text-sm sm:text-base bg-white"
              />
            </div>
            <button
              type="submit"
              className="h-12 sm:h-14 px-6 sm:px-8 bg-[#d1beff] text-[#111111] hover:bg-[#352d33] hover:text-white border border-[#24341d] rounded-[4px] font-medium transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Quick links below search */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["IIT Bombay", "NIT Trichy", "BITS Pilani", "JoSAA 2025"].map(
              (q) => (
                <button
                  key={q}
                  onClick={() =>
                    navigate(`/colleges?q=${encodeURIComponent(q)}`)
                  }
                  className="text-xs text-[#969696] bg-white border border-[#24341d] px-3 py-1.5 rounded-full hover:border-[#24341d] hover:text-[#241f23] transition-colors"
                >
                  {q}
                </button>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <div className="border-y border-[#24341d] py-3 sm:py-4 overflow-hidden">
        {/* Mobile: scrolling marquee */}
        <div className="sm:hidden overflow-hidden">
          <div className="flex gap-10 animate-marquee-stats whitespace-nowrap w-max">
            {[
              `${allColleges?.length || 35}+ COLLEGES`,
              `${stats?.totalCounsellings || 12} COUNSELLINGS`,
              `${stats?.totalCutoffRecords || "3144"}+ CUTOFF RECORDS`,
              `UPDATED ${stats?.lastUpdated || "2026-06-11"}`,
              `${allColleges?.length || 35}+ COLLEGES`,
              `${stats?.totalCounsellings || 12} COUNSELLINGS`,
              `${stats?.totalCutoffRecords || "3144"}+ CUTOFF RECORDS`,
              `UPDATED ${stats?.lastUpdated || "2026-06-11"}`,
            ].map((item, i) => (
              <span
                key={i}
                className="text-xs font-sans text-[#241f23] tracking-widest shrink-0"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        {/* Desktop: static centered */}
        <div className="hidden sm:flex container mx-auto px-4 flex-wrap justify-center gap-x-8 lg:gap-x-12 gap-y-3 text-xs sm:text-sm font-sans text-[#241f23] tracking-widest">
          <span>{allColleges?.length || 35}+ COLLEGES</span>
          <span>{stats?.totalCounsellings || 12} COUNSELLINGS</span>
          <span>{stats?.totalCutoffRecords || "3144"}+ CUTOFF RECORDS</span>
          <span>UPDATED {stats?.lastUpdated || "2026-06-11"}</span>
        </div>
      </div>

      {/* ── Institution Logo Strip ── */}
      <div className="border-b border-[#24341d] py-6 sm:py-8 overflow-hidden">
        <div className="container mx-auto px-4 mb-4 sm:mb-5 flex items-center justify-center gap-2">
          <p className="text-xs font-sans text-[#969696] tracking-widest text-center">
            {allColleges && allColleges.length > 0 ? allColleges.length : 35}+
            COLLEGES COVERED
          </p>
          <span className="text-[10px] text-[#969696] sm:hidden">
            ← swipe →
          </span>
        </div>
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10"
            style={{
              background: "linear-gradient(to right, #f8f4f0, transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10"
            style={{
              background: "linear-gradient(to left, #f8f4f0, transparent)",
            }}
          />
          <div className="flex gap-4 sm:gap-6 animate-marquee whitespace-nowrap">
            {allColleges && allColleges.length > 0 ? (
              <>
                {allColleges
                  .slice(0, 40)
                  .concat(allColleges.slice(0, 20))
                  .map((c, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 group cursor-default"
                    >
                      <AvatarLogo
                        src={c.logoUrl || `/logos/${c.slug}.png`}
                        alt={c.name}
                        fallback={c.name.charAt(0)}
                        type={c.type}
                        size="md"
                        rounded="full"
                      />
                      <span className="text-xs font-sans text-[#969696] group-hover:text-[#241f23] transition-colors line-clamp-1 max-w-[72px] text-center">
                        {c.name.split(" ").slice(0, 2).join(" ")}
                      </span>
                    </div>
                  ))}
              </>
            ) : (
              <div className="text-sm text-[#969696] py-4 px-4">
                Loading colleges...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="py-14 sm:py-20 px-4 border-b border-[#24341d]">
        <div className="container mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="text-xs sm:text-sm font-bold text-[#969696] mb-2 tracking-widest text-data-large">
              01
            </p>
            <h2 className="text-3xl sm:text-4xl font-sans text-[#241f23]">
              How it works.
            </h2>
          </div>

          {/* Horizontal scrollable cards */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
            <div className="flex min-w-max">
              {[
                {
                  num: "01",
                  heading: "Enter your rank.",
                  body: "Input your JEE Main and JEE Advanced ranks, category, and home state. Takes 30 seconds.",
                },
                {
                  num: "02",
                  heading: "We scan 50,000+ cutoffs.",
                  body: "Our engine matches your rank against 6 years of official JoSAA, CSAB and state-level closing ranks.",
                },
                {
                  num: "03",
                  heading: "See your real options.",
                  body: "Get a precise list of institutes and branches you qualify for — sorted by NIRF rank and category eligibility.",
                },
                {
                  num: "04",
                  heading: "Deep-dive any college.",
                  body: "Tap any result to see full placement stats, hostel data, department breakdown and internship records.",
                },
                {
                  num: "04",
                  heading: "Deep-dive any college.",
                  body: "Tap any result to see full placement stats, hostel data, department breakdown and internship records.",
                },
              ].map((card, i, arr) => (
                <div key={i} className="flex">
                  <div className="w-64 sm:w-72 md:w-80 px-6 sm:px-8 py-5 sm:py-6 flex flex-col gap-3">
                    <span className="text-xs font-bold text-[#969696] tracking-widest">
                      {card.num}
                    </span>
                    <h3 className="text-lg sm:text-xl font-medium text-[#241f23] leading-snug">
                      {card.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#969696] font-medium leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px bg-[#24341d]/50 self-stretch my-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <ScrollHint />
        </div>
      </section>

      {/* ── Counsellings ── */}
      <section className="py-14 sm:py-20 px-4 border-b border-[#24341d]">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-8 sm:mb-10">
            <div>
              <p className="text-xs sm:text-sm text-data-large text-[#969696] mb-2 tracking-widest">
                02
              </p>
              <h2 className="text-3xl sm:text-4xl font-sans text-[#241f23]">
                Explore by counselling
              </h2>
            </div>
            <Link
              href="/counsellings"
              className="text-xs sm:text-sm font-bold text-black hover:text-primary flex items-center gap-1 transition-colors group shrink-0 ml-4"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="relative overflow-hidden py-4 -mx-4 px-4">
            {/* Fade edges */}
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10"
              style={{
                background: "linear-gradient(to right, #f8f4f0, transparent)",
              }}
            />
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10"
              style={{
                background: "linear-gradient(to left, #f8f4f0, transparent)",
              }}
            />
            <div className="flex gap-4 sm:gap-6 animate-marquee-medium hover:[animation-play-state:paused] w-max">
              {isCounsellingsLoading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-48 w-60 sm:w-72 rounded-xl shrink-0"
                    />
                  ))
              ) : counsellings && counsellings.length > 0 ? (
                counsellings.concat(counsellings).map((c, i) => (
                  <div key={i} className="w-60 sm:w-72 shrink-0">
                    <CounsellingCard counselling={c} />
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#969696] py-4">
                  No counsellings available.
                </div>
              )}
            </div>
          </div>
          <ScrollHint />
        </div>
      </section>

      {/* ── Top of every shortlist ── */}
      <section className="py-14 sm:py-20 px-4 border-b border-[#24341d]">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-8 sm:mb-10">
            <div>
              <p className="text-xs sm:text-sm text-data-large text-[#969696] mb-2 tracking-widest">
                03
              </p>
              <h2 className="text-3xl sm:text-4xl font-sans text-[#241f23]">
                Top of every shortlist
              </h2>
            </div>
            <Link
              href="/colleges"
              className="text-xs sm:text-sm font-bold text-black hover:text-primary flex items-center gap-1 transition-colors group shrink-0 ml-4"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="relative overflow-hidden py-4 -mx-4 px-4">
            {/* Fade edges */}
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10"
              style={{
                background: "linear-gradient(to right, #f8f4f0, transparent)",
              }}
            />
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10"
              style={{
                background: "linear-gradient(to left, #f8f4f0, transparent)",
              }}
            />
            <div className="flex gap-4 sm:gap-6 animate-marquee-medium hover:[animation-play-state:paused] w-max">
              {isCollegesLoading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-80 w-72 sm:w-80 rounded-xl shrink-0"
                    />
                  ))
              ) : colleges && colleges.length > 0 ? (
                colleges.concat(colleges).map((c, i) => (
                  <div key={i} className="w-72 sm:w-80 shrink-0">
                    <CollegeCard college={c} />
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#969696] py-4">
                  No colleges available.
                </div>
              )}
            </div>
          </div>
          <ScrollHint />
        </div>
      </section>

      {/* ── The data you actually need ── */}
      <section className="py-14 sm:py-20 px-4 border-b border-[#24341d]">
        <div className="container mx-auto">
          <div className="mb-8 sm:mb-12">
            <p className="text-xs sm:text-sm font-bold text-[#969696] mb-2 tracking-widest">
              § 04
            </p>
            <h2 className="text-3xl sm:text-4xl font-sans text-[#241f23]">
              The data you actually need.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#d1d5db] border border-[#24341d]">
            {[
              {
                icon: <Calendar className="w-5 h-5 text-primary" />,
                label: "Years of Cutoffs",
                desc: "JoSAA, CSAB, JAC Delhi, COMEDK and 8 other counsellings. Round-by-round data from 2020 to 2025.",
              },
              {
                icon: <IndianRupee className="w-5 h-5 text-primary" />,
                label: "Real Placement Numbers",
                desc: "Avg, median and peak packages. Sector-wise breakdown. Year-wise trends. Not marketing copy.",
              },
              {
                icon: <HomeIcon className="w-5 h-5 text-primary" />,
                label: "Hostel & Campus Life",
                desc: "Capacity, fees, room types and amenities for every hostel. Know what you're signing up for.",
              },
              {
                icon: <Zap className="w-5 h-5 text-primary" />,
                label: "Branch Intelligence",
                desc: "CSE cutoffs, placement rates and avg packages for each branch — not just the college overall.",
              },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 flex gap-4 sm:gap-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] text-black flex items-center justify-center font-bold text-lg shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-sans text-[#241f23] mb-1.5 sm:mb-2 text-base sm:text-lg">
                    {f.label}
                  </h3>
                  <p className="text-data-large text-[#969696] leading-relaxed text-xs sm:text-sm">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── College Fit Engine Banner ── */}
      <section className="py-14 sm:py-20 px-4 border-b border-[#24341d] ">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#d1beff] border border-[#24341d] px-3 py-1.5 rounded-full mb-5">
                <span className="text-xs">✦</span>
                <span className="text-xs text-lable-large text-[#241f23] tracking-widest">
                  Never Built before
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium text-[#241f23] leading-tight mb-4">
                Not just where your
                <br />
                rank can <em>get</em> you.
              </h2>
              <p className="text-sm sm:text-base text-[#969696] text-data-large mb-6 leading-relaxed max-w-lg">
                The{" "}
                <strong className="text-[#241f23]">College Fit Engine</strong>{" "}
                matches you to colleges based on your actual career goals and
                priorities — placements, research, prestige, campus life,
                location. Every college gets a personalised{" "}
                <strong className="text-[#241f23]">Fit Score 0–100%</strong>.
              </p>
              <div className="flex  flex-wrap  gap-2 mb-6">
                {[
                  "Big Tech",
                  "Finance",
                  "Core Engg",
                  "Research",
                  "Startup",
                  "MBA",
                ].map((g) => (
                  <span
                    key={g}
                    className="text-xs bg-[#f4f0ec] text-[#241f23] border border-[#24341d] px-3 py-1.5 rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <Link
                href="/fit"
                className="inline-flex items-center gap-2 bg-[#241f23] text-white px-6 py-3.5 rounded-[4px] text-sm font-medium hover:bg-black transition-colors group"
              >
                Find my perfect college
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="text-xs text-[#969696] mt-3">
                60 seconds · 100% private
              </p>
            </div>
            {/* Visual mock of fit results — real college logos */}
            <div className="space-y-2.5">
              {[
                {
                  name: "IIT Madras",
                  slug: "iit-madras",
                  score: 94,
                  label: "Safe",
                  why: "Top research output · NIRF #1",
                },
                {
                  name: "NIT Trichy",
                  slug: "nit-trichy",
                  score: 81,
                  label: "Moderate",
                  why: "Strong placements · South India",
                },
                {
                  name: "IIT Guwahati",
                  slug: "iit-guwahati",
                  score: 76,
                  label: "Safe",
                  why: "Elite brand · NIRF #8",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-[#f8f4f0] border border-[#24341d]/50 rounded-lg px-4 py-3"
                >
                  <CollegeLogo slug={c.slug} name={c.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#241f23]">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-[#969696]">{c.why}</p>
                  </div>
                  <span
                    className={`text-[10px] text-data-large px-2.5 py-1 rounded-full shrink-0 ${c.label === "Safe" ? "bg-[#beffcb] text-[#2a7a3b]" : "bg-[#fff0b3] text-[#7a5e00]"}`}
                  >
                    {c.label}
                  </span>
                  <div className="text-lg font-medium text-[#241f23] w-12 text-right shrink-0">
                    {c.score}%
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <p className="text-[10px] text-[#969696] tracking-widest">
                  PERSONALISED FOR YOUR GOALS · BASED ON REAL DATA
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Dark Section ── */}
      <section className="bg-[#241f23] py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white mb-4 sm:mb-6 leading-tight">
            Your rank. Your shortlist.
            <br />
            In 2 minutes.
          </h2>
          <p className="text-[#969696] font-medium text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto px-2">
            Tell us your JEE rank and we'll tell you exactly where you stand —
            without the guesswork.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/fit"
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#d1beff] text-[#111111] font-sans rounded-[4px] hover:bg-[#f4f0ec] transition-colors text-sm tracking-wide flex items-center justify-center gap-1.5 group"
            >
              <span>✦</span>
              <span>Try the Fit Engine</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/josaa-list"
              className="px-6 sm:px-8 py-3.5 sm:py-4 border bg-[#beffcb] text-[#111111] hover:bg-white hover:text-black border-[#332f31] font-sans rounded-[4px] hover:border-white transition-colors text-sm tracking-wide flex items-center justify-center gap-1.5"
            >
              Build JoSAA List
            </Link>
            <Link
              href="/colleges"
              className="px-6 sm:px-8 py-3.5 sm:py-4 border border-[#332f31] text-white hover:bg-white hover:text-black font-sans rounded-[4px] transition-colors text-sm tracking-wide text-center"
            >
              Browse Colleges
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
