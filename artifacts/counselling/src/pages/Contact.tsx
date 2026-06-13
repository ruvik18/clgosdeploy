export default function Contact() {
  return (
    <div className="min-h-screen bg-[#f8f4f0] pt-12 sm:pt-20 md:pt-24 pb-16 sm:pb-32">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#241f23] mb-8 sm:mb-12">
          Get in touch.
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-2">Data Corrections</h2>
              <p className="text-[#969696] font-medium mb-1">Found an outdated cutoff or placement stat?</p>
              <a href="mailto:data@counseliq.in" className="text-black font-bold hover:underline">data@counseliq.in</a>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2">Partnerships</h2>
              <p className="text-[#969696] font-medium mb-1">For API access, integrations, or media inquiries.</p>
              <a href="mailto:hello@counseliq.in" className="text-black font-bold hover:underline">hello@counseliq.in</a>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-2">Support</h2>
              <p className="text-[#969696] font-medium mb-1">Need help with your predictor results?</p>
              <a href="mailto:support@counseliq.in" className="text-black font-bold hover:underline">support@counseliq.in</a>
            </div>
          </div>

          <form className="bg-white p-8 rounded-xl border border-[#d1d5db] space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-[#241f23]">Name</label>
              <input type="text" className="w-full h-12 px-4 rounded-[4px] border border-[#d1d5db] focus:outline-none focus:border-black" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-[#241f23]">Email</label>
              <input type="email" className="w-full h-12 px-4 rounded-[4px] border border-[#d1d5db] focus:outline-none focus:border-black" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-[#241f23]">Message</label>
              <textarea className="w-full h-32 p-4 rounded-[4px] border border-[#d1d5db] focus:outline-none focus:border-black resize-none" placeholder="How can we help?"></textarea>
            </div>
            <button type="button" className="w-full h-12 bg-black text-white font-bold rounded-[4px] hover:bg-black/90 transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
