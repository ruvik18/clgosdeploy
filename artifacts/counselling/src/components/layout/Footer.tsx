import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#241f23] text-white py-12 sm:py-16 border-t border-[#332f31]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-16">
          <div className="col-span-2 md:col-span-2">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-sans tracking-tight text-white mb-3 sm:mb-4 block"
            >
              Councilos
            </Link>
            <p className="text-[#969696] font-medium max-w-sm text-xs sm:text-sm leading-relaxed">
              India's most intelligent engineering college counselling guide.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white tracking-widest mb-4 sm:mb-6 uppercase">Explore</h3>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { label: "Colleges", href: "/colleges" },
                { label: "Counsellings", href: "/counsellings" },
                { label: "Compare", href: "/compare" },
                { label: "My Shortlist", href: "/shortlist" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#969696] hover:text-white transition-colors text-xs sm:text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white tracking-widest mb-4 sm:mb-6 uppercase">Resources</h3>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#969696] hover:text-white transition-colors text-xs sm:text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-[#332f31] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-medium text-[#969696]">
          <p className="text-center sm:text-left">
            © 2026 Councilos. Not affiliated with NTA, JoSAA or any government body.
          </p>
          <p>Data updated June 2026</p>
        </div>
      </div>
    </footer>
  );
}
