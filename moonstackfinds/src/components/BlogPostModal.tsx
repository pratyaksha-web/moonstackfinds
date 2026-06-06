import React, { useState } from 'react';
import { X, Calendar, Clock, Tag, ExternalLink, Star } from 'lucide-react';
import { BlogPost, Product } from '../types';

interface BlogPostModalProps {
  post: BlogPost;
  onClose: () => void;
  allProducts: Product[];
  onViewProductDetails: (product: Product) => void;
}

export default function BlogPostModal({
  post,
  onClose,
  allProducts,
  onViewProductDetails
}: BlogPostModalProps) {
  // Dynamically find products mentioned/linked in this blog post
  const featuredProducts = allProducts.filter((prod) =>
    post.productIds?.includes(prod.id)
  );

  // Helper to split text by lines and render beautiful custom styling for headings, lists, etc.
  // This simulates markdown parsing perfectly without adding heavy external dependencies
  const renderContentWithAesthetics = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      // Render custom bold title headers starting with ###
      if (trimmed.startsWith('###')) {
        return (
          <h3 
            key={index} 
            className="font-serif text-xl font-bold text-stone-900 mt-6 mb-3 flex items-center space-x-2"
          >
            <span className="w-1 h-5 bg-cozy-burgundy rounded-full inline-block" />
            <span>{trimmed.replace('###', '').trim()}</span>
          </h3>
        );
      }

      // Render custom title headers starting with ##
      if (trimmed.startsWith('##')) {
        return (
          <h2 
            key={index} 
            className="font-serif text-2xl font-bold text-cozy-burgundy mt-7 mb-4 border-b border-cozy-rose/20 pb-2"
          >
            {trimmed.replace('##', '').trim()}
          </h2>
        );
      }

      // Render custom styled lists starting with -
      if (trimmed.startsWith('-')) {
        const items = trimmed.split('\n').map(li => li.replace('-', '').trim());
        return (
          <ul key={index} className="list-disc pl-6 space-y-2 my-4 text-stone-700 text-sm">
            {items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        );
      }

      // Normal paragraph
      return (
        <p 
          key={index} 
          className="text-stone-700 text-sm sm:text-base leading-relaxed mb-4 text-justify font-sans"
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-stone-950/40 backdrop-blur-md p-3 sm:p-6">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative bg-cozy-cream rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-cozy-rose/20 z-10 animate-in fade-in duration-350"
        id={`blog-post-page-${post.id}`}
      >
        {/* Sticky close dismiss element */}
        <div className="sticky top-0 right-0 z-20 flex justify-end p-4 pointer-events-none">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-cozy-cream/90 backdrop-blur-md text-stone-800 hover:text-cozy-burgundy shadow-lg border border-cozy-rose/10 pointer-events-auto transition-transform hover:scale-105 cursor-pointer"
            id="close-blog-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-10 sm:px-10 -mt-10">
          
          {/* Post Header Metadata */}
          <div className="space-y-4 mb-6">
            <span className="bg-cozy-burgundy text-cozy-cream text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-cozy-rose/30">
              {post.category}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-xs text-cozy-brown font-medium items-center border-b border-cozy-rose/15 pb-4">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{post.date}</span>
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTime}</span>
              </span>
              <span className="text-stone-300">•</span>
              <span>By MoonStack Editors</span>
            </div>
          </div>

          {/* Large Editorial Image Cover */}
          <div className="relative overflow-hidden rounded-2.5xl shadow-sm mb-6 max-h-[350px] bg-white">
            <img
              src={post.image}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover max-h-[350px]"
            />
          </div>

          {/* Main Body Text Container */}
          <div className="prose prose-stone max-w-none mb-8">
            {renderContentWithAesthetics(post.content)}
          </div>

          {/* Social Tags Segment */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-b border-cozy-rose/10 py-4 my-6">
              {post.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center space-x-1 text-xs text-cozy-brown bg-cozy-beige/50 px-2.5 py-1 rounded-md border border-cozy-rose/10"
                >
                  <Tag className="w-3 h-3 text-cozy-rose" />
                  <span>#{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Featured Dynamic In-Blog Products Widget */}
          {featuredProducts.length > 0 && (
            <div className="bg-cozy-beige/30 rounded-2.5xl p-6 sm:p-8 border border-cozy-rose/25">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 flex items-center space-x-2">
                <span>🛍️</span>
                <span>Featured Finds mentioned in this article</span>
              </h3>
              <p className="text-xs text-cozy-brown font-medium mb-5">
                We independently select and thoroughly review every item we recommend. Click below to view our personal notes or grab yours directly from Amazon!
              </p>
              
              <div className="space-y-4">
                {featuredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl p-4 border border-cozy-rose/15 shadow-xs flex flex-col sm:flex-row items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={prod.image}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-stone-100"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <span className="text-[10px] text-cozy-brown font-semibold uppercase">
                        {prod.category} • {prod.subcategory}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-stone-900 line-clamp-1">
                        {prod.title}
                      </h4>
                      <p className="text-stone-500 text-xs line-clamp-1 mt-0.5">
                        {prod.description}
                      </p>
                      <div className="flex items-center justify-center sm:justify-start space-x-1.5 mt-1.5 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-semibold text-stone-700">{prod.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onViewProductDetails(prod)}
                        className="flex-1 text-center sm:text-right px-3 py-1.5 bg-stone-100 hover:bg-cozy-rose/20 text-stone-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Read Review
                      </button>
                      <a
                        href={prod.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-cozy-burgundy hover:bg-cozy-brown text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1"
                      >
                        <span>Buy on Amazon</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
