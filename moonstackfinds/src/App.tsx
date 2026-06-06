import React, { useState, useEffect } from 'react';
import { 
  INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BLOGS 
} from './data';
import { Product, Category, BlogPost, Subcategory } from './types';
import Header from './components/Header';
import AestheticHero from './components/AestheticHero';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import BlogSection from './components/BlogSection';
import BlogPostModal from './components/BlogPostModal';
import AboutSection from './components/AboutSection';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { firebaseService } from './lib/firebaseService';
import { getSlug } from './lib/utils';
import { 
  Star, Heart, BookOpen, Sparkles, Home, Settings, Info, ShoppingBag, 
  Gift, Trash2, Moon, Sun, ArrowRight, ArrowUpRight, Compass, RefreshCw 
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const cached = localStorage.getItem('moonstack_favorites');
    return cached ? JSON.parse(cached) : [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const cached = localStorage.getItem('moonstack_recent');
    return cached ? JSON.parse(cached) : [];
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('moonstack_dark') === 'true';
  });

  // --- Firebase Authentication States ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // --- Path Parser for Client-Side Routing ---
  const parsePath = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    
    if (parts[0] === 'admin') return { view: 'admin' };
    if (parts[0] === 'login') return { view: 'login' };
    if (parts[0] === 'favorites') return { view: 'favorites' };
    if (parts[0] === 'categories') return { view: 'categories' };
    if (parts[0] === 'category') {
      if (parts[1] && parts[2]) {
        return { view: 'subcategory-detail', categoryId: parts[1], subcategorySlug: parts[2] };
      } else if (parts[1]) {
        return { view: 'category-detail', categoryId: parts[1] };
      }
      return { view: 'categories' };
    }
    if (parts[0] === 'product' && parts[1]) {
      return { view: 'product-detail', productSlug: parts[1] };
    }
    if (parts[0] === 'trending') return { view: 'trending' };
    if (parts[0] === 'blog') return { view: 'blog' };
    if (parts[0] === 'about') return { view: 'about' };
    return { view: 'home' };
  };

  // --- Navigation & Routing States ---
  const [currentView, setView] = useState<string>(() => {
    return parsePath(window.location.pathname).view;
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
    return parsePath(window.location.pathname).categoryId || '';
  });

  const [activeSubcategorySlug, setActiveSubcategorySlug] = useState<string>(() => {
    return parsePath(window.location.pathname).subcategorySlug || '';
  });

  const [activeProductSlug, setActiveProductSlug] = useState<string>(() => {
    return parsePath(window.location.pathname).productSlug || '';
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  // Load state lists from Firestore on mount & seed if empty
  useEffect(() => {
    async function loadDatabase() {
      setIsLoading(true);
      try {
        const data = await firebaseService.ensureSeedData();
        setProducts(data.products);
        setCategories(data.categories);
        setBlogs(data.blogs);
        setSubcategories(data.subcategories);
      } catch (e) {
        console.error('Failed to load real-time Firebase lists:', e);
        // Fallback
        setProducts(INITIAL_PRODUCTS.map(p => ({ ...p, tags: [] })));
        setCategories(INITIAL_CATEGORIES);
        setBlogs(INITIAL_BLOGS);
      } finally {
        setIsLoading(false);
      }
    }
    loadDatabase();
  }, []);

  // --- Navigation Change Event Handler ---
  const handleSetView = (
    view: string, 
    extra?: { categoryId?: string; subcategorySlug?: string; productSlug?: string }
  ) => {
    setView(view);
    let path = '/';
    if (view === 'admin') path = '/admin';
    else if (view === 'login') path = '/login';
    else if (view === 'favorites') path = '/favorites';
    else if (view === 'categories') path = '/categories';
    else if (view === 'trending') path = '/trending';
    else if (view === 'blog') path = '/blog';
    else if (view === 'about') path = '/about';
    else if (view === 'category-detail' && extra?.categoryId) {
      path = `/category/${extra.categoryId}`;
      setActiveCategoryId(extra.categoryId);
    }
    else if (view === 'subcategory-detail' && extra?.categoryId && extra?.subcategorySlug) {
      path = `/category/${extra.categoryId}/${extra.subcategorySlug}`;
      setActiveCategoryId(extra.categoryId);
      setActiveSubcategorySlug(extra.subcategorySlug);
    }
    else if (view === 'product-detail' && extra?.productSlug) {
      path = `/product/${extra.productSlug}`;
      setActiveProductSlug(extra.productSlug);
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  // --- Firebase Authentication Effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email && user.email.toLowerCase() === 'workly244@gmail.com') {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // --- Navigation Popstate Event Handler ---
  useEffect(() => {
    const handlePopState = () => {
      const route = parsePath(window.location.pathname);
      setView(route.view);
      setActiveCategoryId(route.categoryId || '');
      setActiveSubcategorySlug(route.subcategorySlug || '');
      setActiveProductSlug(route.productSlug || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Route Access Guard: Redirect non-admin from /admin ---
  useEffect(() => {
    if (currentView === 'admin' && !isAuthLoading && !isAdminLoggedIn) {
      setView('home');
      window.history.replaceState({}, '', '/');
    }
  }, [currentView, isAuthLoading, isAdminLoggedIn]);

  // --- Login Page Direct Redirect to admin if already logged in ---
  useEffect(() => {
    if (currentView === 'login' && isAdminLoggedIn) {
      setView('admin');
      window.history.replaceState({}, '', '/admin');
    }
  }, [currentView, isAdminLoggedIn]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdminLoggedIn(false);
      handleSetView('home');
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  // --- Sync State back to Local Storage Cache ---
  useEffect(() => {
    localStorage.setItem('moonstack_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('moonstack_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('moonstack_dark', String(isDarkMode));
  }, [isDarkMode]);

  // --- Heart Toggle Favorites scrapbook ---
  const handleToggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // --- Inspect Details Page Trigger ---
  const handleInspectProduct = (product: Product) => {
    // Navigate straight to full page Product link!
    handleSetView('product-detail', { productSlug: getSlug(product.title) });
    
    // Add to Recently Viewed queue
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== product.id);
      return [product.id, ...filtered].slice(0, 6);
    });
  };

  // --- Dynamic Category selection Shortcuts deep-link ---
  const handleCategorySelection = (categoryName: string) => {
    // Look up category id
    const found = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (found) {
      handleSetView('category-detail', { categoryId: found.id });
    } else {
      setActiveCategoryFilter(categoryName);
      setView('categories');
    }
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // --- Global searching computations ---
  const getFilteredProducts = () => {
    let list = products;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (activeCategoryFilter !== 'All') {
      const matchCat = categories.find(c => c.name.toLowerCase() === activeCategoryFilter.toLowerCase());
      if (matchCat) {
        list = list.filter(p => p.category === matchCat.id);
      } else {
        list = list.filter(p => p.category.toLowerCase() === activeCategoryFilter.toLowerCase());
      }
    }

    return list;
  };

  const filteredProducts = getFilteredProducts();

  // --- Segregated Homepage niche divisions ---
  const trendingThisWeek = products.filter(p => p.trending);
  const cozyReads = products.filter(p => p.category === 'books').slice(0, 4);
  const fashionFinds = products.filter(p => p.category === 'fashion').slice(0, 4);
  const homeDecorFavorites = products.filter(p => p.category === 'home-decor').slice(0, 4);
  const giftIdeas = products.filter(p => p.category === 'gift-guides').slice(0, 4);
  const amazonBestSellers = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const recentItems = products.filter(p => recentlyViewed.includes(p.id));

  // Switch dark/light CSS tokens manually to maintain pristine layouts
  const rootThemeClass = isDarkMode 
    ? 'bg-stone-950 text-stone-100 dark-theme' 
    : 'bg-stone-50 text-stone-900 light-theme';

  return (
    <div className={`min-h-screen text-sans transition-colors duration-300 ${rootThemeClass}`}>
      
      {/* Header element */}
      <Header 
        currentView={currentView}
        setView={handleSetView}
        favoritesCount={favorites.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Embedded Floating Dark/Light Mode Switcher */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl bg-cozy-burgundy text-white hover:bg-cozy-brown hover:scale-105 transition-all cursor-pointer border border-cozy-rose/30"
        title={isDarkMode ? 'Toggle Warm Light theme' : 'Toggle Cozy Midnight theme'}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Loading Screen Overlay */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <RefreshCw className="w-8 h-8 text-cozy-burgundy animate-spin" />
          <p className="font-serif italic text-xs text-cozy-brown">Loading MoonStack finds catalog...</p>
        </div>
      ) : (
        <main className="pb-16 text-stone-800">
          
          {/* VIEW: HOME VIEW */}
          {currentView === 'home' && (
            <div className="space-y-12">
              
              <AestheticHero 
                onCategorySelect={handleCategorySelection}
                setSearchQuery={setSearchQuery}
              />

              {searchQuery.trim() ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                    <h2 className="font-serif text-2.5xl font-bold text-stone-900">
                      Showing results for: <span className="text-cozy-burgundy italic">"{searchQuery}"</span>
                    </h2>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-xs bg-cozy-rose/20 text-cozy-burgundy font-bold px-3 py-1.5 rounded-full hover:bg-cozy-rose/40 cursor-pointer"
                    >
                      Clear Search Check
                    </button>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center max-w-sm mx-auto border border-stone-200 text-stone-500">
                      <span className="text-3xl block font-serif">🕵️‍♀️</span>
                      <h3 className="font-serif text-lg font-bold text-stone-900 mt-2">No Cozy Treasures Found</h3>
                      <p className="text-stone-500 text-xs leading-relaxed mt-1">No products matched "{searchQuery}" in titles, categories, tags, or descriptions.</p>
                    </div>
                  ) : (
                    <div className="pinterest-masonry">
                      {filteredProducts.map(p => (
                        <ProductCard 
                          key={p.id}
                          product={p}
                          onViewDetails={handleInspectProduct}
                          isFavorite={favorites.includes(p.id)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-16">

                  {/* 1. Trending This Week - Masonry Collage Grid */}
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-stone-200 pb-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-cozy-burgundy uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>The Crowds Choice</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-4xl italic font-bold tracking-tight text-stone-900">
                          Trending This Week
                        </h2>
                      </div>
                      <button
                        onClick={() => { setView('trending'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-xs font-bold uppercase tracking-widest text-cozy-burgundy hover:text-cozy-brown mt-2 sm:mt-0 flex items-center space-x-1 hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        <span>Explore all trending finds</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pinterest-masonry">
                      {trendingThisWeek.map(p => (
                        <ProductCard 
                          key={p.id}
                          product={p}
                          onViewDetails={handleInspectProduct}
                          isFavorite={favorites.includes(p.id)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  </section>

                  {/* 2. Cozy Reads (Books Section showcase) */}
                  {cozyReads.length > 0 && (
                    <section className="bg-white py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cozy-rose/10 rounded-bl-3xl pointer-events-none" />
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-100">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-[#8A6A56]">Segment 01</span>
                          <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-stone-900">Cozy Reads</h2>
                          <p className="text-stone-500 text-xs font-medium">Cardamom tea, warm blankets, and psychological page-turners.</p>
                        </div>
                        <button
                          onClick={() => handleCategorySelection('Books')}
                          className="text-xs font-bold uppercase text-[#8B0E2D] hover:text-[#8A6A56] mt-2 sm:mt-0 cursor-pointer"
                        >
                          View All Books →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {cozyReads.map(p => (
                          <ProductCard 
                            key={p.id}
                            product={p}
                            onViewDetails={handleInspectProduct}
                            isFavorite={favorites.includes(p.id)}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 3. Fashion Finds */}
                  {fashionFinds.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-200">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-[#8A6A56]">Segment 02</span>
                          <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-stone-900">Fashion Finds</h2>
                          <p className="text-stone-500 text-xs font-medium">Timeless oversized knits, neutral drapes, and capsule staples.</p>
                        </div>
                        <button
                          onClick={() => handleCategorySelection('Fashion')}
                          className="text-xs font-bold uppercase text-[#8B0E2D] hover:text-[#8A6A56] mt-2 sm:mt-0 cursor-pointer"
                        >
                          View All Fashion →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {fashionFinds.map(p => (
                          <ProductCard 
                            key={p.id}
                            product={p}
                            onViewDetails={handleInspectProduct}
                            isFavorite={favorites.includes(p.id)}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 4. Home Decor Favorites */}
                  {homeDecorFavorites.length > 0 && (
                    <section className="bg-white py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl border border-stone-200 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-100">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-[#8A6A56]">Segment 03</span>
                          <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-stone-900">Home Decor Favorites</h2>
                          <p className="text-stone-500 text-xs font-medium">Sculptural clay accents, warm table glow fixtures, and double wick soy candles.</p>
                        </div>
                        <button
                          onClick={() => handleCategorySelection('Home Decor')}
                          className="text-xs font-bold uppercase text-[#8B0E2D] hover:text-[#8A6A56] mt-2 sm:mt-0 cursor-pointer"
                        >
                          View All Decor →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {homeDecorFavorites.map(p => (
                          <ProductCard 
                            key={p.id}
                            product={p}
                            onViewDetails={handleInspectProduct}
                            isFavorite={favorites.includes(p.id)}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 5. Gift Ideas */}
                  {giftIdeas.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-200">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-[#8A6A56]">Segment 04</span>
                          <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-stone-900">Gift Ideas</h2>
                          <p className="text-stone-500 text-xs font-medium">Curated boxes, wellness gift cards, and premium stationery journals.</p>
                        </div>
                        <button
                          onClick={() => handleCategorySelection('Gift Guides')}
                          className="text-xs font-bold uppercase text-[#8B0E2D] hover:text-[#8A6A56] mt-2 sm:mt-0 cursor-pointer"
                        >
                          View All Gift Guides →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {giftIdeas.map(p => (
                          <ProductCard 
                            key={p.id}
                            product={p}
                            onViewDetails={handleInspectProduct}
                            isFavorite={favorites.includes(p.id)}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 6. Amazon Best Sellers */}
                  {amazonBestSellers.length > 0 && (
                    <section className="bg-white py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-cozy-burgundy/5 rounded-br-3xl pointer-events-none" />
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-100">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-[#8A6A56]">Segment 05</span>
                          <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-stone-900">Amazon Best Sellers</h2>
                          <p className="text-stone-500 text-xs font-medium">Veracity-approved Amazon treasures boasting our high editor scores.</p>
                        </div>
                        <span className="text-xs font-bold text-cozy-burgundy font-serif italic">Rating Descending ✦</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {amazonBestSellers.map(p => (
                          <ProductCard 
                            key={p.id}
                            product={p}
                            onViewDetails={handleInspectProduct}
                            isFavorite={favorites.includes(p.id)}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Recently Viewed scrapbook section if items exist */}
                  {recentItems.length > 0 && (
                    <section className="bg-white py-12 border-t border-stone-200">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="font-serif text-lg font-bold text-stone-900 mb-6 flex items-center space-x-2">
                          <span>🕒</span>
                          <span>Recently Visited Finds</span>
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                          {recentItems.map(p => (
                            <div
                              key={p.id}
                              onClick={() => handleInspectProduct(p)}
                              className="bg-stone-50 p-2.5 rounded-2xl cursor-pointer border border-[#8B0E2D]/5 text-center hover:bg-stone-100 transition-all text-xs"
                            >
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-24 object-cover rounded-xl"
                              />
                              <h4 className="font-serif font-bold text-stone-900 line-clamp-1 mt-1.5 pr-1 pl-1">
                                {p.title}
                              </h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                </div>
              )}
            </div>
          )}

          {/* VIEW: CATEGORIES */}
          {currentView === 'categories' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
              
              <div className="text-center max-w-xl mx-auto space-y-3">
                <span className="bg-cozy-burgundy text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-max mx-auto">
                  Directory Filter
                </span>
                <h1 className="font-serif text-3xl sm:text-4.5xl font-extrabold text-stone-900 leading-tight">
                  Inspect Niche Collections
                </h1>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Click a category below to filter our high-fidelity scrapbook. Every addition has been handselected.
                </p>
              </div>

              {/* Comprehensive category tabs chooser with visual cover thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
                <button
                  onClick={() => setActiveCategoryFilter('All')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${activeCategoryFilter === 'All' ? 'border-2 border-cozy-burgundy bg-white shadow-sm' : 'border-stone-250/30 bg-white hover:bg-stone-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-cozy-burgundy/10 flex items-center justify-center text-cozy-burgundy text-lg font-bold mb-2">
                    ✦
                  </div>
                  <span className="text-[11px] font-bold text-stone-950 text-center leading-tight">All Finds</span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSetView('category-detail', { categoryId: cat.id })}
                    className={`flex flex-col items-center justify-start p-2.5 rounded-2xl border text-center transition-all cursor-pointer border-stone-250/30 bg-white hover:bg-stone-50`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-10 h-10 object-cover rounded-full border border-stone-100 mb-2 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[11px] font-bold text-stone-950 text-center leading-none mt-1">{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Filter outputs */}
              <div className="border-t border-stone-200 pt-8 mt-4">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-stone-600 text-xs font-semibold">
                    Showing <strong>{filteredProducts.length} curations</strong> classified in "<strong>{activeCategoryFilter}</strong>"
                  </span>
                  {activeCategoryFilter !== 'All' && (
                    <button
                      onClick={() => setActiveCategoryFilter('All')}
                      className="text-xs text-cozy-burgundy hover:text-cozy-brown font-bold"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center max-w-sm mx-auto border border-stone-200 text-stone-500">
                    <span className="text-3xl block">🧺</span>
                    <p className="font-serif font-bold text-stone-950 mt-2.5">Category empty</p>
                    <p className="text-xs mt-1 leading-relaxed">No products are currently under this classification. Add products inside the Admin Dashboard to see them live!</p>
                  </div>
                ) : (
                  <div className="pinterest-masonry">
                    {filteredProducts.map(p => (
                      <ProductCard 
                        key={p.id}
                        product={p}
                        onViewDetails={handleInspectProduct}
                        isFavorite={favorites.includes(p.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* DYNAMIC CATEGORIES DETAILS PAGE */}
          {currentView === 'category-detail' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 text-xs text-cozy-brown font-semibold mb-2">
                <button onClick={() => handleSetView('home')} className="hover:underline">Home</button>
                <span>/</span>
                <button onClick={() => handleSetView('categories')} className="hover:underline">Categories</button>
                <span>/</span>
                <span className="text-[#8B0E2D]">{categories.find(c => c.id === activeCategoryId)?.name || activeCategoryId}</span>
              </div>

              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xs text-center max-w-4xl mx-auto space-y-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-stone-50/20 pointer-events-none" />
                <h1 className="font-serif text-3.5xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
                  {categories.find(c => c.id === activeCategoryId)?.name || activeCategoryId} Finds
                </h1>
                <p className="text-stone-600 text-sm max-w-xl mx-auto leading-relaxed font-medium">
                  {categories.find(c => c.id === activeCategoryId)?.description || "Curated dynamic finds collection."}
                </p>

                {subcategories.filter(s => s.categoryId === activeCategoryId).length > 0 && (
                  <div className="pt-5 border-t border-stone-100 flex flex-wrap justify-center gap-2">
                    {subcategories.filter(s => s.categoryId === activeCategoryId).map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSetView('subcategory-detail', { categoryId: activeCategoryId, subcategorySlug: getSlug(sub.name) })}
                        className="px-4 py-1.5 bg-stone-50 hover:bg-cozy-rose/10 text-stone-750 font-bold text-xs rounded-full border border-stone-200 transition-all cursor-pointer"
                      >
                        ✦ {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6 pt-6">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  All Products ({products.filter(p => p.category === activeCategoryId).length})
                </h3>
                
                {products.filter(p => p.category === activeCategoryId).length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center max-w-sm mx-auto border border-stone-200 shadow-xs">
                    <span className="text-3xl block">📦</span>
                    <h4 className="font-serif text-base font-bold text-stone-900 mt-2">Section is currently empty</h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">Products added in administrative dashboard under this group will appear here.</p>
                  </div>
                ) : (
                  <div className="pinterest-masonry">
                    {products.filter(p => p.category === activeCategoryId).map(p => (
                      <ProductCard 
                        key={p.id}
                        product={p}
                        onViewDetails={handleInspectProduct}
                        isFavorite={favorites.includes(p.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC SUBCATEGORY DETAILS PAGE */}
          {currentView === 'subcategory-detail' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 text-xs text-cozy-brown font-semibold mb-2">
                <button onClick={() => handleSetView('home')} className="hover:underline">Home</button>
                <span>/</span>
                <button onClick={() => handleSetView('categories')} className="hover:underline">Categories</button>
                <span>/</span>
                <button onClick={() => handleSetView('category-detail', { categoryId: activeCategoryId })} className="hover:underline text-cozy-burgundy">
                  {categories.find(c => c.id === activeCategoryId)?.name || activeCategoryId}
                </button>
                <span>/</span>
                <span className="text-[#8B0E2D]">
                  {subcategories.find(s => s.categoryId === activeCategoryId && getSlug(s.name) === activeSubcategorySlug)?.name || activeSubcategorySlug}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xs text-center max-w-4xl mx-auto space-y-2 relative overflow-hidden">
                <span className="text-[10px] bg-cozy-burgundy/10 text-cozy-burgundy font-extrabold uppercase px-3 py-1 rounded-full border border-cozy-rose/25 w-max mx-auto block tracking-widest mb-1.5">
                  Sub-niche filter locked
                </span>
                <h1 className="font-serif text-3xl sm:text-4.5xl font-extrabold text-stone-900 leading-tight">
                  {subcategories.find(s => s.categoryId === activeCategoryId && getSlug(s.name) === activeSubcategorySlug)?.name || activeSubcategorySlug}
                </h1>
                <p className="text-stone-500 text-xs sm:text-sm">
                  Editorial finds under parent classification of <strong className="text-stone-850">{categories.find(c => c.id === activeCategoryId)?.name || activeCategoryId}</strong>.
                </p>
              </div>

              <div className="space-y-6 pt-6">
                {(() => {
                  const matchedSubName = subcategories.find(s => s.categoryId === activeCategoryId && getSlug(s.name) === activeSubcategorySlug)?.name || '';
                  const sublist = products.filter(p => p.category === activeCategoryId && (p.subcategory?.toLowerCase() === matchedSubName.toLowerCase() || getSlug(p.subcategory) === activeSubcategorySlug));

                  return (
                    <>
                      <h3 className="font-serif text-xl font-bold text-stone-900">
                        Dynamic curation matches ({sublist.length})
                      </h3>
                      {sublist.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center max-w-sm mx-auto border border-stone-200 shadow-xs">
                          <span className="text-3xl block">🏷️</span>
                          <h4 className="font-serif text-base font-bold text-stone-900 mt-2">Subsection is currently empty</h4>
                          <p className="text-xs text-stone-500 mt-1 leading-relaxed">No products are recorded into this dynamic subcategory yet. Head to Admin CMS to link items!</p>
                        </div>
                      ) : (
                        <div className="pinterest-masonry">
                          {sublist.map(p => (
                            <ProductCard 
                              key={p.id}
                              product={p}
                              onViewDetails={handleInspectProduct}
                              isFavorite={favorites.includes(p.id)}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* DYNAMIC PRODUCT DETAILS FULL PAGE */}
          {currentView === 'product-detail' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
              {(() => {
                const matchedProduct = products.find(p => p.id === activeProductSlug || getSlug(p.title) === activeProductSlug);
                
                if (!matchedProduct) {
                  return (
                    <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-xs max-w-sm mx-auto p-8 space-y-4">
                      <span className="text-4xl block">🕵️‍♀️</span>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Product Pin Not Found</h2>
                      <p className="text-stone-500 text-xs leading-relaxed">This product might have been unpinned or modified. Return home to browse our latest finds!</p>
                      <button onClick={() => handleSetView('home')} className="px-5 py-2.5 bg-cozy-burgundy text-white text-xs font-bold rounded-xl cursor-pointer">Return to Homepage</button>
                    </div>
                  );
                }

                const matchedCat = categories.find(c => c.id === matchedProduct.category);
                const relatedFinds = products.filter(p => p.category === matchedProduct.category && p.id !== matchedProduct.id).slice(0, 4);

                return (
                  <div className="space-y-12">
                    <div className="flex items-center space-x-2 text-xs text-cozy-brown font-semibold">
                      <button onClick={() => handleSetView('home')} className="hover:underline">Home</button>
                      <span>/</span>
                      <button onClick={() => handleSetView('category-detail', { categoryId: matchedProduct.category })} className="hover:underline text-cozy-burgundy font-bold">
                        {matchedCat ? matchedCat.name : matchedProduct.category}
                      </button>
                      <span>/</span>
                      <span className="text-[#8B0E2D] line-clamp-1">{matchedProduct.title}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-3.5xl p-6 sm:p-10 border border-stone-200/50 shadow-sm relative">
                      <div className="relative rounded-3xl overflow-hidden bg-cozy-cream flex items-center justify-center max-h-[560px] border border-stone-100 p-4">
                        <img
                          src={matchedProduct.image}
                          alt={matchedProduct.title}
                          className="w-full h-auto object-cover max-h-[540px] hover:scale-[1.01] transition-transform duration-500 rounded-2xl shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={(e) => handleToggleFavorite(matchedProduct.id, e)}
                          className={`absolute top-6 right-6 p-3 rounded-full shadow-lg cursor-pointer transition-all ${favorites.includes(matchedProduct.id) ? 'bg-cozy-burgundy text-white scale-110' : 'bg-white/95 text-cozy-burgundy hover:bg-cozy-burgundy hover:text-white'}`}
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="bg-cozy-burgundy/10 text-cozy-burgundy font-extrabold uppercase px-3 py-1 rounded-full text-[10px] tracking-widest border border-cozy-rose/20">
                              {matchedCat ? matchedCat.name : matchedProduct.category}
                            </span>
                            <span className="text-xs text-cozy-brown font-mono font-bold uppercase tracking-wider">{matchedProduct.subcategory}</span>
                          </div>

                          <h1 className="font-serif text-2.5xl sm:text-4xl leading-tight font-extrabold text-[#1c1c1b] tracking-tight">
                            {matchedProduct.title}
                          </h1>

                          <div className="flex items-center space-x-1.5 text-amber-500 font-bold text-xs sm:text-sm">
                            <Star className="w-4.5 h-4.5 fill-current" />
                            <span className="text-stone-700">{matchedProduct.rating} / 5.0 Editor Score</span>
                          </div>

                          <div className="pt-3 border-t border-stone-100">
                            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                              {matchedProduct.description}
                            </p>
                          </div>

                          <div className="bg-[#FFFDF9] border-l-4 border-cozy-burgundy/80 p-4 rounded-xl shadow-xs mt-4">
                            <span className="text-xs font-bold text-cozy-burgundy tracking-widest uppercase block mb-1">✦ Editor's Review notes</span>
                            <p className="text-stone-700 text-xs leading-relaxed italic">
                              " {matchedProduct.review} "
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-stone-100">
                          <a
                            href={matchedProduct.affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-cozy-burgundy hover:bg-cozy-brown text-[#FFFDF9] font-bold text-center py-4 rounded-xl transition-transform shadow-sm flex items-center justify-center space-x-2 text-sm cursor-pointer hover:scale-101"
                          >
                            <ShoppingBag className="w-5 h-5" />
                            <span>Buy Now on Amazon (Affiliate Link)</span>
                          </a>

                          <p className="text-[10px] text-center text-cozy-brown font-semibold leading-relaxed">
                            Clicking "Buy Now" will direct you to the Amazon product page using our curation link. Thank you for supporting MoonStackFinds!
                          </p>
                        </div>
                      </div>
                    </div>

                    {relatedFinds.length > 0 && (
                      <div className="space-y-6 pt-10 border-t border-stone-200">
                        <div className="text-left">
                          <h3 className="font-serif text-2xl font-bold text-stone-900">More finds from {matchedCat?.name || matchedProduct.category}</h3>
                          <p className="text-stone-500 text-xs mt-0.5 font-medium">Continue scanning related aesthetic pins curated by our team.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {relatedFinds.map(p => (
                            <ProductCard 
                              key={p.id}
                              product={p}
                              onViewDetails={handleInspectProduct}
                              isFavorite={favorites.includes(p.id)}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW: TRENDING */}
          {currentView === 'trending' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
              <div className="text-center max-w-md mx-auto space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B0E2D]">Hot Selections</span>
                <h1 className="font-serif text-3xl sm:text-4.5xl font-extrabold text-stone-900 leading-none">
                  Trending This Week
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  Our viral lifestyle selections currently generating waves among home organizers, creative writers, and readers.
                </p>
              </div>

              <div className="pinterest-masonry">
                {products.filter(p => p.trending).map(p => (
                  <ProductCard 
                    key={p.id}
                    product={p}
                    onViewDetails={handleInspectProduct}
                    isFavorite={favorites.includes(p.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}

          {/* VIEW: COZY BLOG */}
          {currentView === 'blog' && (
            <BlogSection 
              blogs={blogs}
              onSelectPost={(post) => setSelectedBlogPost(post)}
              allProducts={products}
            />
          )}

          {/* VIEW: OUR STORY */}
          {currentView === 'about' && (
            <AboutSection />
          )}

          {/* VIEW: LOGIN PAGE */}
          {currentView === 'login' && (
            <LoginPage 
              onBackToHome={() => handleSetView('home')} 
              onLoginSuccess={() => handleSetView('admin')} 
            />
          )}

          {/* VIEW: WORKSPACE ADMIN DASHBOARD */}
          {currentView === 'admin' && (
            <AdminDashboard 
              products={products}
              setProducts={setProducts}
              categories={categories}
              setCategories={setCategories}
              subcategories={subcategories}
              setSubcategories={setSubcategories}
              blogs={blogs}
              setBlogs={setBlogs}
              onLogout={handleLogout}
            />
          )}

          {/* VIEW: WISHLIST BOOKMARK SCRAPBOOK */}
          {currentView === 'favorites' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
              <div className="text-center max-w-md mx-auto space-y-2">
                <span className="inline-flex p-3 bg-cozy-rose/20 text-cozy-burgundy rounded-full text-xs">
                  ❤️
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900">
                  My Favorites Scrapbook
                </h1>
                <p className="text-cozy-brown text-xs font-semibold">
                  Your beautiful custom wishlist containing items pinned from your search filters.
                </p>
              </div>

              {favorites.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 border border-stone-200 max-w-sm mx-auto text-center space-y-4">
                  <Compass className="w-12 h-12 text-cozy-rose mx-auto animate-spin" />
                  <h4 className="font-serif text-base font-bold text-stone-900">Scrapbook is clean for now</h4>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    You haven't pinned any items to your cozy collection yet. Browse our books or home decor finds and click the heart icon on any collage cards!
                  </p>
                  <button
                    onClick={() => { setView('home'); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                    className="px-5 py-2.5 bg-cozy-burgundy text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Start Curation Hunt
                  </button>
                </div>
              ) : (
                <div className="pinterest-masonry">
                  {products.filter(p => favorites.includes(p.id)).map(p => (
                    <ProductCard 
                      key={p.id}
                      product={p}
                      onViewDetails={handleInspectProduct}
                      isFavorite={true}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      )}

      {/* --- FLOATING DETAILED LAYOUT DIALOG OVERLAYS (FALLBACKS) --- */}
      
      {/* Product Inspect Modal */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isFavorite={favorites.includes(selectedProduct.id)}
          onToggleFavorite={handleToggleFavorite}
          allProducts={products}
          onSelectProduct={handleInspectProduct}
        />
      )}

      {/* Blog Inspect Modal */}
      {selectedBlogPost && (
        <BlogPostModal 
          post={selectedBlogPost}
          onClose={() => setSelectedBlogPost(null)}
          allProducts={products}
          onViewProductDetails={(prod) => {
            setSelectedBlogPost(null);
            handleInspectProduct(prod);
          }}
        />
      )}

      {/* Cozy Footer Section */}
      <footer className="bg-white border-t border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="font-serif text-xl font-bold text-stone-900">
            MoonStack<span className="text-cozy-burgundy font-serif">Finds</span>
          </p>
          <p className="text-xs text-cozy-brown font-semibold tracking-wide">
            Curated Finds, Cozy Reads & Everyday Favorites
          </p>
          <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
            <button onClick={() => handleSetView('home')} className="hover:text-cozy-burgundy cursor-pointer">Home</button>
            <span>•</span>
            <button onClick={() => handleSetView('categories')} className="hover:text-cozy-burgundy cursor-pointer">Categories</button>
            <span>•</span>
            <button onClick={() => handleSetView('blog')} className="hover:text-cozy-burgundy text-xs font-bold text-red-955 cursor-pointer">Read Our Insights</button>
            <span>•</span>
            <button onClick={() => handleSetView('about')} className="hover:text-cozy-burgundy cursor-pointer">About Us</button>
            <span>•</span>
            <button onClick={() => handleSetView(isAdminLoggedIn ? 'admin' : 'login')} className="hover:text-cozy-burgundy cursor-pointer text-xs uppercase tracking-wider font-semibold opacity-70">
              {isAdminLoggedIn ? 'Admin Panel' : 'Admin Area'}
            </button>
          </div>
          <div className="pt-6 border-t border-stone-200 text-[11px] text-cozy-brown">
            <p>© 2026 MoonStackFinds. All rights reserved. Features may contain outbound Amazon affiliate links. We make a modest commission upon checkout with zero extra cost to you.</p>
            <p className="mt-1">Proudly synchronized securely with persistent relational Firestore and Cloud Storage.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
