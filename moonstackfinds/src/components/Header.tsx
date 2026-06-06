import React, { useState } from 'react';
import { Search, Heart, Menu, X, BookOpen, Sparkles, Home, Settings, Info, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  favoritesCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdminLoggedIn: boolean;
}

export default function Header({
  currentView,
  setView,
  favoritesCount,
  searchQuery,
  setSearchQuery,
  isAdminLoggedIn
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: ShoppingBag },
    { id: 'favorites', label: `Wishlist ${favoritesCount > 0 ? `(${favoritesCount})` : ''}`, icon: Heart },
    { id: 'blog', label: 'Cozy Blog', icon: BookOpen },
    { id: 'about', label: 'Our Story', icon: Info },
  ];

  const handleNavClick = (viewId: string) => {
    setView(viewId);
    setIsMobileMenuOpen(false);
    // Clear search when navigating unless staying on home/categories to prevent confusing visual states
    if (viewId !== 'home' && viewId !== 'categories') {
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cozy-cream/95 backdrop-blur-md border-b border-cozy-rose/20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Styled with elegant playfair display and burgundy accent */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex flex-col items-start cursor-pointer group text-left"
            id="header-logo-btn"
          >
            <span className="font-serif text-2xl font-bold tracking-tight text-cozy-burgundy group-hover:text-cozy-brown transition-colors duration-300">
              MoonStack<span className="text-cozy-brown font-serif italic font-normal">Finds</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase font-sans font-medium text-cozy-brown/80 -mt-0.5">
              Cozy reads & curation
            </span>
          </button>

          {/* Desktop Interactive Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className={`relative flex items-center transition-all duration-300 rounded-full border ${isSearchFocused ? 'border-cozy-burgundy ring-2 ring-cozy-rose/20 bg-white' : 'border-cozy-rose/30 bg-cozy-beige/40'}`}>
              <Search className="absolute left-4 w-4 h-4 text-cozy-brown/60" />
              <input
                type="text"
                placeholder="Search products by title, rating, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (currentView !== 'home' && currentView !== 'categories') {
                    setView('home');
                  }
                }}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-11 pr-4 py-2 bg-transparent text-sm text-stone-800 placeholder-cozy-brown/50 outline-none rounded-full"
                id="global-search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-cozy-brown/50 hover:text-cozy-burgundy hover:bg-cozy-beige transition-colors text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Link Cluster */}
          <nav className="hidden lg:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-item-${item.id}`}
                  className={`flex items-center space-x-1 px-1.5 py-2.5 transition-all duration-300 cursor-pointer text-[11px] font-bold uppercase tracking-widest ${isActive ? 'border-b-2 border-cozy-burgundy text-cozy-burgundy' : 'text-cozy-brown hover:text-cozy-burgundy'}`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons (Favorites, Admin) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Favorites Icon Button with Live Badge count */}
            <button
              onClick={() => handleNavClick('favorites')}
              id="view-favorites-btn"
              className={`relative p-2.5 rounded-full transition-all duration-300 cursor-pointer ${currentView === 'favorites' ? 'bg-cozy-rose/30 text-cozy-burgundy animate-pulse' : 'text-cozy-burgundy hover:bg-cozy-rose/20'}`}
              title="View saved favorites"
            >
              <Heart className={`w-5.5 h-5.5 ${favoritesCount > 0 ? 'fill-cozy-burgundy text-cozy-burgundy' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cozy-burgundy text-cozy-cream text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {favoritesCount}
                </span>
              )}
            </button>


            {/* Mobile Menu Icon toggler */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              id="mobile-menu-toggle"
              className="lg:hidden p-2 rounded-full text-cozy-brown hover:bg-cozy-beige transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Instant Filtering Search Row */}
      <div className="block md:hidden px-4 pb-4 border-t border-cozy-rose/10 pt-2 bg-cozy-cream">
        <div className="relative flex items-center rounded-full border border-cozy-rose/20 bg-cozy-beige/40">
          <Search className="absolute left-3 w-4 h-4 text-cozy-brown/60" />
          <input
            type="text"
            placeholder="Search our cozy collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (currentView !== 'home' && currentView !== 'categories') setView('home');
            }}
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm text-stone-800 outline-none"
            id="mobile-global-search"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-cozy-brown/80"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute top-20 right-0 w-64 bg-cozy-cream shadow-2xl border-l border-cozy-rose/20 p-6 flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-sm font-semibold tracking-wider text-cozy-brown uppercase mb-2">
              Navigation
            </h3>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-3 p-3 rounded-xl text-left text-sm transition-all ${isActive ? 'bg-cozy-burgundy/10 text-cozy-burgundy font-bold border-l-4 border-cozy-burgundy pl-2' : 'text-cozy-brown hover:bg-cozy-beige hover:text-cozy-burgundy'}`}
                >
                  <IconComp className="w-5 h-5 text-cozy-burgundy" />
                  <span>{item.label}</span>
                </button>
              );
            })}

          </div>
        </div>
      )}
    </header>
  );
}
