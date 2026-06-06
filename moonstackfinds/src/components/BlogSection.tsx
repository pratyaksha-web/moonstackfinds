import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight, BookOpen, Coffee, Sparkles } from 'lucide-react';
import { BlogPost, Product } from '../types';

interface BlogSectionProps {
  blogs: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  allProducts: Product[];
}

export default function BlogSection({ blogs, onSelectPost, allProducts }: BlogSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Books', 'Home Decor', 'Desk Setup', 'Fashion', 'Beauty'];

  const filteredBlogs = selectedCategory === 'All'
    ? blogs
    : blogs.filter(b => b.category === selectedCategory);

  return (
    <section className="py-12 bg-gradient-to-b from-cozy-beige to-cozy-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 bg-cozy-rose/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-cozy-burgundy uppercase mb-3 border border-cozy-rose/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>The Hearth & Page</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Our Lifestyle Curation Blog
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2.5 leading-relaxed font-sans">
            Pour a warm drink, get comfortable, and delve into our deep-dive reviews, seasonal aesthetics, home-styling journals, and thoughtful product guides.
          </p>
        </div>

        {/* Filter Categories Row */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${selectedCategory === cat ? 'bg-cozy-burgundy text-white shadow-xs' : 'bg-white hover:bg-cozy-rose/25 text-stone-700'}`}
              id={`blog-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat === 'All' ? '✦ All Articles' : cat}
            </button>
          ))}
        </div>

        {/* Dynamic Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-cozy-rose/10 shadow-sm space-y-3">
            <Coffee className="w-12 h-12 text-cozy-rose mx-auto animate-bounce" />
            <p className="font-serif text-lg font-bold text-stone-900">Articles are currently brewing!</p>
            <p className="text-stone-500 text-xs">No entries match this category right now. Check back shortly for our fresh curation notes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
            {filteredBlogs.map((post, idx) => {
              // Dynamically fetch how many products are linked in this post (for the sticker tag)
              const countProducts = post.productIds?.length || 0;

              // Visually alternate card sizes/columns to represent a rich editorial layouts
              const isLargeIndex = idx === 0 && selectedCategory === 'All';

              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className={`bg-white rounded-3.5xl overflow-hidden border border-cozy-rose/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer ${isLargeIndex ? 'md:col-span-2 md:flex-row' : ''}`}
                  id={`blog-card-${post.id}`}
                >
                  {/* Photo Section */}
                  <div className={`relative overflow-hidden ${isLargeIndex ? 'md:w-1/2 aspect-video md:aspect-auto' : 'aspect-video'}`}>
                    <img
                      src={post.image}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 min-h-[220px]"
                    />
                    <div className="absolute top-4 left-4 z-10 flex flex-col space-y-1.5">
                      <span className="bg-cozy-cream text-cozy-burgundy text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full shadow-xs border border-cozy-rose/20">
                        {post.category}
                      </span>
                      {countProducts > 0 && (
                        <span className="bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs w-max">
                          📦 Features {countProducts} {countProducts === 1 ? 'Find' : 'Finds'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 bg-white">
                    <div className="space-y-3.5">
                      
                      {/* Meta dates row */}
                      <div className="flex items-center space-x-3 text-xs text-cozy-brown font-semibold">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-cozy-rose" />
                          <span>{post.date}</span>
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-cozy-rose" />
                          <span>{post.readTime}</span>
                        </span>
                      </div>

                      {/* Title heading */}
                      <h3 className={`font-serif font-extrabold text-stone-900 tracking-tight leading-snug group-hover:text-cozy-burgundy transition-colors duration-200 ${isLargeIndex ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
                        {post.title}
                      </h3>

                      {/* Excerpt text */}
                      <p className="text-stone-600 text-sm leading-relaxed font-sans line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* View article footer button */}
                    <div className="pt-6 border-t border-cozy-rose/10 mt-6 flex items-center justify-between">
                      <span className="text-xs font-semibold text-cozy-brown italic">
                        Author Notes Included ✦
                      </span>
                      <button className="text-cozy-burgundy hover:text-cozy-brown hover:scale-103 transition-all inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest cursor-pointer">
                        <span>Read Journal</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
