import React, { useState } from 'react';
import { Sparkles, Heart, CheckCircle2, Bookmark, Mail, Check } from 'lucide-react';

export default function AboutSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  const pillars = [
    {
      title: 'Aesthetic Standard first',
      description: 'We reject plastic clutter. Every item must elevate your visual space, whether it is a book spine or a ceramic dish.'
    },
    {
      title: 'Independently Tested',
      description: 'Zero automated scrapers. Every single item featured has been held, read, or brewed by our real lifestyle writers.'
    },
    {
      title: 'Cozy Living Focus',
      description: 'We believe your home should carry a warm security. Our selections embrace quiet rhythms, heavy fabrics, and amber lights.'
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-cozy-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand visual showcase column */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-1.5 bg-cozy-rose/20 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-cozy-burgundy uppercase border border-cozy-rose/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Behind The Pages</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
            Our Cozy Story
          </h1>
          <p className="text-cozy-brown italic text-sm sm:text-base tracking-wide font-serif">
            "Curating soft lights, quiet hours, and warm, tactile anchors for your daily life."
          </p>
        </div>

        {/* Narrative layout details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div className="relative overflow-hidden rounded-3xl shadow-md pb-4 bg-white">
            <img
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=500"
              alt="Living room aesthetic cozy"
              referrerPolicy="no-referrer"
              className="w-full h-80 object-cover rounded-t-3xl"
            />
            <div className="p-4 bg-white text-center">
              <span className="text-[11px] font-medium text-cozy-brown font-mono select-none">
                ✦ Established in June 2026 ✦
              </span>
            </div>
          </div>

          <div className="space-y-4.5 text-stone-700 text-sm sm:text-base leading-relaxed">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Where curation meets comfort
            </h3>
            <p>
              Hey there! We are the small, dedicated creative team of lifestyle editors behind <strong>MoonStackFinds</strong>. 
            </p>
            <p>
              In a digital era overrun with rapid drops, infinite scrolling, and sterile plastic packaging, we found ourselves craving a return to tactile beauty. We wanted books with sturdy, raw covers. We wanted desk mats made from real tree bark. We wanted warm, amber lights that let our eyes rest.
            </p>
            <p>
              So, we built MoonStackFinds. Think of this site as your interactive virtual scrapbook—a blend of <em>Pinterest visual beauty, Amazon functional reliability</em>, and <em>curated magazine reviews</em>. We do the digging, tests, and photography so you can gather gorgeous additions for your cozy sanctuary.
            </p>
          </div>
        </div>

        {/* Curation Pillars Grid */}
        <div className="bg-cozy-beige/40 rounded-3xl p-6 sm:p-10 border border-cozy-rose/20 mb-16">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-center text-cozy-burgundy mb-6">
            ✦ Our Tri-Fold Curation Standards ✦
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {pillars.map((pil) => (
              <div key={pil.title} className="bg-white rounded-2xl p-5 border border-cozy-rose/10 text-center space-y-2 flex flex-col items-center">
                <CheckCircle2 className="w-5.5 h-5.5 text-cozy-burgundy" />
                <h4 className="font-serif text-sm font-bold text-stone-950">
                  {pil.title}
                </h4>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {pil.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter subscription form section */}
        <div className="bg-cozy-burgundy text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-cozy-rose/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-lg mx-auto space-y-4">
            <Mail className="w-8 h-8 text-cozy-rose mx-auto animate-pulse" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold">
              Join Our Cozy Newsletter List
            </h3>
            <p className="text-cozy-rose text-xs sm:text-sm">
              We send out weekly roundups of books, beauty secrets, aesthetic desk drops, and exclusive Amazon discount links. No spam, only soft vibes.
            </p>

            {subscribed ? (
              <div className="bg-white/15 border border-white/20 p-4 rounded-2xl flex items-center justify-center space-x-2 text-sm sm:text-base font-semibold animate-in zoom-in-95 duration-200">
                <Check className="w-5 h-5 text-green-300" />
                <span className="text-green-100">Welcome to the MoonStack family! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-stone-900 border border-white/20 rounded-xl px-4 py-3 placeholder:text-stone-300 focus:placeholder:text-stone-400 outline-none text-sm transition-all focus:ring-2 focus:ring-cozy-rose/50"
                  required
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-cozy-rose text-cozy-burgundy hover:text-stone-950 font-bold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>Gather Links</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
