import { Link } from "wouter";
import {
  useGetCounselling,
  useGetCounsellingRounds,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CollegeCard } from "@/pages/Home";
import { AvatarLogo } from "@/components/ui/avatar-logo";
import { ArrowRight } from "lucide-react";

export default function CounsellingDetail({
  params,
}: {
  params: { slug: string };
}) {
  const { data: counselling, isLoading: isCounsellingLoading } =
    useGetCounselling(params.slug);
  const { data: rounds, isLoading: isRoundsLoading } = useGetCounsellingRounds(
    params.slug,
  );

  if (isCounsellingLoading) {
    return (
      <div className="p-12">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!counselling)
    return (
      <div className="p-12 text-center text-[#969696]">
        Counselling not found
      </div>
    );

  return (
    <div className="bg-[#f8f4f0] min-h-screen pb-24">
      <div className="">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="shrink-0">
              <AvatarLogo
                src={counselling.logoUrl || `/logos/${counselling.slug}.png`}
                alt={counselling.name}
                fallback={counselling.name.charAt(0)}
                size="xl"
                rounded="full"
              />
            </div>
            <div>
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="text-xs font-lable bg-[#f4f0ec] text-[#969696] px-2 py-1 rounded-[4px] uppercase tracking-wider">
                  {counselling.type}
                </span>
                <span className="text-xs font-lable bg-[#f4f0ec] text-[#969696] px-2 py-1 rounded-[4px] uppercase tracking-wider">
                  {counselling.level}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#241f23] mb-3 sm:mb-4">
                {counselling.name}
              </h1>
              <p className="text-black/60 font-sans max-w-3xl text-sm sm:text-base lg:text-lg leading-relaxed">
                {counselling.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictor CTA Banner */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-[#beffcb] border border-[#24341d] rounded-xl mx-6 md:mx-2 px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-sans text-[#241f23] text-sm ">
              Know your chances.
            </p>
            <p className="text-sm text-[#241f23] font-sans">
              Enter your rank to see every college and branch you qualify for.
            </p>
          </div>
          <Link
            href={`/counsellings/${counselling.slug}/predict`}
            className="shrink-0 px-6 py-2.5  bg-[#d1beff] text-[#111111] hover:bg-[#352d33] hover:text-white  border  border-[#24341d] text-sm font-sans rounded-[4px] hover:bg-black transition-colors whitespace-nowrap flex items-center gap-1.5 group"
          >
            <span>Start Predictor</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="lg:col-span-2 space-y-8 sm:space-y-12">
            <section>
              <h2 className="text-xl sm:text-2xl font-sans tracking-tight mb-4 sm:mb-6">
                Participating Institutes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {counselling.colleges?.map((college) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-[#24341d]">
              <h3 className="text-sm font-sans text-[#969696] tracking-widest mb-6">
                QUICK FACTS
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-[#969696] tracking-wider mb-1">
                    TOTAL COLLEGES
                  </p>
                  <p className="font-medium text-[#241f23]">
                    {counselling.totalColleges || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#969696] tracking-wider mb-1">
                    TOTAL SEATS
                  </p>
                  <p className="font-medium text-[#241f23]">
                    {counselling.totalSeats
                      ? counselling.totalSeats.toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#969696] tracking-wider mb-1">
                    STATES
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {counselling.states.map((state) => (
                      <span
                        key={state}
                        className="text-xs font-medium bg-[#f4f0ec] px-2 py-1 rounded-[4px]"
                      >
                        {state}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#24341d]">
              <h3 className="text-sm font-sans text-[#969696] tracking-widest mb-6">
                COUNSELLING SCHEDULE
              </h3>
              {isRoundsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="space-y-6">
                  {rounds?.map((round, i) => (
                    <div
                      key={round.id}
                      className="relative pl-6 border-l-2 border-[#f4f0ec]"
                    >
                      <div className="absolute w-3 h-3 bg-black rounded-full -left-[7px] top-1"></div>
                      <h4 className="font-bold text-[#241f23] mb-1">
                        Round {round.roundNumber}{" "}
                        {round.name ? `- ${round.name}` : ""}
                      </h4>
                      <p className="text-sm text-[#969696] mb-2 font-medium">
                        Result:{" "}
                        {new Date(round.resultDate).toLocaleDateString()}
                      </p>
                      {round.notes && (
                        <p className="text-xs text-[#969696]">{round.notes}</p>
                      )}
                    </div>
                  ))}
                  {(!rounds || rounds.length === 0) && (
                    <p className="text-sm text-[#969696] font-medium">
                      Schedule pending announcement.
                    </p>
                  )}
                </div>
              )}
            </div>

            {counselling.importantDates &&
              counselling.importantDates.length > 0 && (
                <div className="bg-white rounded-xl border border-[#24341d] overflow-hidden">
                  <div className="p-4 border-b border-[#24341d] bg-[#f4f0ec]">
                    <h3 className="text-sm font-bold text-[#969696] tracking-widest">
                      IMPORTANT DATES
                    </h3>
                  </div>
                  <div className="divide-y divide-[#24341d]/50">
                    {counselling.importantDates.map((d, i) => (
                      <div key={i} className="flex justify-between p-4 text-sm">
                        <span className="font-medium text-[#969696]">
                          {d.event}
                        </span>
                        <span className="font-bold text-[#241f23]">
                          {d.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
