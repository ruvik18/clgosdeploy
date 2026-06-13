import { Link } from "wouter";
import { useListCounsellings } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CounsellingCard } from "@/pages/Home";

export default function Counsellings() {
  const { data: counsellings, isLoading } = useListCounsellings();

  return (
    <div className="bg-[#f8f4f0] min-h-screen py-8 sm:py-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#241f23] mb-3 sm:mb-4 tracking-tight">
            Explore by counselling.
          </h1>
          <p className="text-sm sm:text-base text-[#969696] max-w-2xl font-medium leading-relaxed">
            From national level admissions like JoSAA and CSAB to state specific ones like JAC Delhi, MHT CET, and more.
            Track dates, rounds, and participating institutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
          ) : (
            counsellings?.map((c) => <CounsellingCard key={c.id} counselling={c} />)
          )}
        </div>
      </div>
    </div>
  );
}
