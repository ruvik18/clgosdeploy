import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { useListColleges } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CollegeCard } from "@/pages/Home";
import { Search, X } from "lucide-react";

const FILTERS = ["All", "IIT", "NIT", "IIIT", "GFTI"];

export default function Colleges() {
  const searchParams = new URLSearchParams(useSearch());
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: colleges, isLoading } = useListColleges();

  const filtered = useMemo(() => {
    if (!colleges) return [];
    let list = colleges;
    if (activeFilter !== "All") {
      list = list.filter((c) => c.type === activeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.state?.toLowerCase().includes(q) ||
          c.type?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [colleges, query, activeFilter]);

  return (
    <div className="bg-[#f8f4f0] min-h-screen py-8 sm:py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#241f23] mb-2">
            Every rank. Every branch.
          </h1>
          <p className="text-sm text-[#969696] font-medium">
            {filtered.length > 0
              ? `${filtered.length} colleges found`
              : "Browse all engineering colleges"}
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-3 mb-6 sm:mb-8">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleges, cities, states..."
              className="w-full h-11 pl-10 pr-10 rounded-[4px] border border-[#d1d5db] focus:border-[#24341d] focus:outline-none bg-white text-sm text-[#241f23] placeholder-[#969696] transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#969696] hover:text-[#241f23] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-[4px] whitespace-nowrap transition-colors ${
                  activeFilter === f
                    ? "bg-[#241f23] text-white"
                    : "bg-white border border-[#d1d5db] text-[#241f23] hover:bg-[#f4f0ec]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {isLoading ? (
            Array(12)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)
          ) : filtered.length > 0 ? (
            filtered.map((c) => <CollegeCard key={c.id} college={c} />)
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-[#969696] font-medium text-lg mb-2">
                No colleges found
              </p>
              <p className="text-[#969696] text-sm">
                Try a different search term or filter
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveFilter("All");
                }}
                className="mt-4 text-sm font-bold text-[#241f23] underline hover:no-underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
