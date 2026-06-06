import React from 'react';
import { BookOpen, Sparkles, Heart, Search, BookmarkCheck } from 'lucide-react';

interface AestheticHeroProps {
  onCategorySelect: (categoryName: string) => void;
  setSearchQuery: (query: string) => void;
}

export default function AestheticHero({ onCategorySelect, setSearchQuery }: AestheticHeroProps) {
  const quickCategories = [
    { name: 'Books', emoji: '📚', color: 'hover:bg-cozy-burgundy hover:text-white border-cozy-burgundy/30 text-cozy-burgundy' },
    { name: 'Home Decor', emoji: '🏺', color: 'hover:bg-cozy-brown hover:text-white border-cozy-brown/30 text-cozy-brown' },
    { name: 'Fashion', emoji: '🧣', color: 'hover:bg-cozy-rose hover:text-stone-900 border-cozy-rose/30 text-cozy-burgundy' },
    { name: 'Desk Setup', emoji: '💻', color: 'hover:bg-amber-800 hover:text-white border-amber-800/30 text-amber-900' },
    { name: 'Beauty', emoji: '🧴', color: 'hover:bg-pink-800 hover:text-white border-pink-800/30 text-pink-900' },
    { name: 'Kitchen Finds', emoji: '☕', color: 'hover:bg-emerald-800 hover:text-white border-emerald-800/30 text-emerald-950' }
  ];

  return (
    <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-b from-cozy-cream to-cozy-beige">
      {/* Absolute Decorative Floating Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-cozy-rose/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cozy-brown/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Block - Typographic and branding */}
          <div className="col-span-1 lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-cozy-rose/20 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-cozy-burgundy uppercase self-center lg:self-start border border-cozy-rose/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curation with Love & Aesthetic Grace</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6.5xl font-extrabold tracking-tight text-stone-900 leading-[1.1]">
              Curated Finds, <br className="hidden sm:block" />
              <span className="text-cozy-burgundy italic font-serif font-semibold">Cozy Reads</span> & <br />
              <span className="text-cozy-brown">Everyday Favorites</span>
            </h1>

            <p className="text-stone-700 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Welcome to <strong className="text-cozy-burgundy font-medium">MoonStackFinds</strong>—an elegant digital scrapbook filled with aesthetic Amazon finds, cozy book recommendations, functional workspace set-ups, and genuine personal reviews. Save your favorites, explore our collections, and style your everyday routines.
            </p>

            {/* Quick Filter Pill Buttons */}
            <div className="flex flex-col space-y-3 pt-2">
              <span className="text-xs font-medium uppercase tracking-widest text-cozy-brown text-center lg:text-left">
                ✦ Tap a niche to start exploring:
              </span>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {quickCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => onCategorySelect(cat.name)}
                    className={`inline-flex items-center space-x-1.5 px-4 py-2 border rounded-full text-xs font-semibold tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer bg-white/60 backdrop-blur-xs ${cat.color}`}
                    id={`quick-cat-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Block - Graphic collage in Pinterest Style */}
          <div className="col-span-1 lg:col-span-5 grid grid-cols-2 gap-4">
            
            {/* Collage Column 1 */}
            <div className="space-y-4">
              <div className="relative group overflow-hidden rounded-2xl shadow-md transform hover:-rotate-1 hover:scale-101 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400"
                  alt="Cozy reading setup"
                  referrerPolicy="no-referrer"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs text-white font-medium">Cozy Autumn Reading ☕</span>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl shadow-md transform hover:rotate-1 hover:scale-101 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400"
                  alt="Home decor setup"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs text-white font-medium">Earthy Living Corners 🏺</span>
                </div>
              </div>
            </div>

            {/* Collage Column 2 */}
            <div className="space-y-4 pt-8">
              <div className="relative group overflow-hidden rounded-2xl shadow-md transform hover:rotate-1 hover:scale-101 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=400"
                  alt="Aesthetic stationary"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs text-white font-medium">Desk Stationary 📚</span>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl shadow-md transform hover:-rotate-1 hover:scale-101 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400"
                  alt="Warm cable knit fashion"
                  referrerPolicy="no-referrer"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs text-white font-medium">Cosy Knitwear Style 🧣</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
