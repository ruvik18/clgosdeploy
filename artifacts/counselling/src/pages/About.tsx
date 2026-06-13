export default function About() {
  return (
    <div className="min-h-screen bg-[#f8f4f0] pt-12 sm:pt-20 md:pt-24 pb-16 sm:pb-32">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#241f23] mb-4 sm:mb-6">
          About Councilos.
        </h1>
        <p className="text-base sm:text-xl text-[#969696] font-medium mb-10 sm:mb-16">
          We built the tool we wish existed when we needed it.
        </p>

        <div className="space-y-10 sm:space-y-16">
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight">Our mission</h2>
            <p className="text-sm sm:text-base lg:text-lg text-[#241f23] leading-relaxed mb-4">
              Engineering admissions in India shouldn't require a spreadsheet degree. Every year, lakhs of students guess their way through JoSAA, CSAB, and state counsellings relying on outdated PDFs, hearsay, and scattered forum posts.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-[#241f23] leading-relaxed">
              Councilos was built to organize the chaos. We ingest millions of rows of official cutoffs, placement reports, and college data to give you exact, data-backed insights on where your rank can take you.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight">What we cover</h2>
            <p className="text-sm sm:text-base lg:text-lg text-[#241f23] leading-relaxed mb-4">
              We track the top 400+ engineering institutes across India — including every IIT, NIT, IIIT, and GFTI, alongside premier state and private colleges.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-[#241f23] leading-relaxed">
              Our predictor covers JoSAA, CSAB, JAC Delhi, COMEDK, MHT-CET, WBJEE, and 10+ other counselling authorities.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight">The data</h2>
            <p className="text-sm sm:text-base lg:text-lg text-[#241f23] leading-relaxed mb-4">
              We don't use predictive models or AI guesses for cutoffs. Our cutoffs are 100% based on historical official closing ranks published by the authorities.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-[#241f23] leading-relaxed">
              Placement figures are sourced from verified NIRF reports, RTI data, and official college placement cells. We separate marketing from reality.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
