import React, { useState } from 'react';
import { X, Heart, Star, ExternalLink, BookmarkCheck, ShoppingBag, Pin, Twitter, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  isFavorite,
  onToggleFavorite,
  allProducts,
  onSelectProduct
}: ProductDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  // Dynamic automatic calculation of related products in the same category
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // Sharing links
  const pageUrl = window.location.href;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(`You must see this: "${product.title}" shared from MoonStackFinds!`);
  const encodedImage = encodeURIComponent(product.image);

  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-stone-900/40 backdrop-blur-md p-3 sm:p-6">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container */}
      <div 
        className="relative bg-cozy-cream rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-cozy-rose/20 z-10 animate-in fade-in zoom-in-95 duration-300"
        id={`product-details-modal-${product.id}`}
      >
        {/* Sticky Close button for easier mobile dismissal */}
        <div className="sticky top-0 right-0 z-20 flex justify-end p-4 pointer-events-none">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-cozy-cream/90 backdrop-blur-md text-stone-800 hover:text-cozy-burgundy shadow-lg border border-cozy-rose/10 pointer-events-auto transition-transform hover:scale-105 cursor-pointer"
            id="close-details-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-10 -mt-12">
          {/* Main Detail Grid splits image and textual review assets */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Image wrapper & Action clusters */}
            <div className="md:col-span-5 flex flex-col space-y-4">
              <div className="relative overflow-hidden rounded-2.5xl shadow-sm bg-white border border-cozy-rose/10">
                <img
                  src={product.image}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover max-h-[440px] md:max-h-[380px] rounded-2.5xl"
                />
                
                {/* Wishlist toggle overlapping image */}
                <button
                  onClick={(e) => onToggleFavorite(product.id, e)}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer ${isFavorite ? 'bg-cozy-burgundy text-white scale-110' : 'bg-white/90 text-cozy-burgundy hover:bg-cozy-burgundy hover:text-white'}`}
                  title={isFavorite ? "Saved in wish list" : "Save to my wishlist scrapbook"}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Share links cluster */}
              <div className="bg-cozy-beige/40 p-4 rounded-2xl border border-cozy-rose/10 flex flex-col space-y-2.5">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-cozy-brown/80 text-center">
                  ✦ Share Curated Favorite
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={pinterestShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white hover:bg-red-50 border border-cozy-rose/20 text-stone-700 hover:text-cozy-burgundy transition-all text-xs font-semibold gap-1"
                  >
                    <Pin className="w-4 h-4 text-cozy-burgundy fill-current" />
                    <span>Pins</span>
                  </a>
                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white hover:bg-stone-50 border border-cozy-rose/20 text-stone-700 hover:text-blue-500 transition-all text-xs font-semibold gap-1"
                  >
                    <Twitter className="w-4 h-4 text-blue-400 fill-current" />
                    <span>Post</span>
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white hover:bg-cozy-beige border border-cozy-rose/20 text-stone-700 hover:text-stone-900 transition-all text-xs font-semibold gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 text-cozy-brown" />
                        <span>Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Title, ratings, description, and editorial custom review */}
            <div className="md:col-span-7 flex flex-col space-y-5">
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-cozy-rose/20 text-cozy-burgundy text-xs font-bold px-3.5 py-1 rounded-full border border-cozy-rose/30">
                    {product.category}
                  </span>
                  <span className="text-cozy-brown/80 font-semibold text-xs tracking-wide">
                    {product.subcategory}
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight pt-1.5">
                  {product.title}
                </h2>
              </div>

              {/* Verified Editorial Rating Indicator */}
              <div className="flex items-center space-x-3 bg-white/60 p-2.5 rounded-xl border border-cozy-rose/10 w-fit">
                <div className="flex items-center text-amber-500 space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {product.rating} / 5
                </span>
                <span className="text-[11px] font-medium text-cozy-brown tracking-wide uppercase">
                  ✦ Veracity Approved
                </span>
              </div>

              {/* Standard Merchant Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cozy-brown">
                  Product Overview
                </h4>
                <p className="text-stone-700 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Personal Editorial Review with bespoke layout aesthetics */}
              <div className="bg-gradient-to-tr from-[#FFFDF9] to-[#F7F1EB] border-t-4 border-l-4 border-cozy-burgundy/80 p-5 rounded-r-2xl shadow-xs relative overflow-hidden">
                <div className="absolute -bottom-8 -right-8 text-stone-200/50 pointer-events-none select-none font-serif italic text-7xl font-bold">
                  “
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-cozy-burgundy text-cozy-cream text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase">
                    Our Honest Notes
                  </span>
                  <span className="text-[10px] italic font-semibold text-cozy-brown/80">
                    By MoonStack Curation Team
                  </span>
                </div>
                <p className="text-stone-800 text-sm leading-relaxed italic relative z-10 font-sans">
                  "{product.review}"
                </p>
              </div>

              {/* Call to action affiliate anchor button and Wishlist toggle button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={product.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center space-x-2 bg-cozy-burgundy hover:bg-cozy-brown text-white font-bold text-sm px-6 py-4 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-center"
                  id={`affiliate-button-${product.id}`}
                >
                  <ShoppingBag className="w-5 h-5 text-cozy-rose fill-current" />
                  <span>Buy on Amazon</span>
                </a>
                <button
                  onClick={(e) => onToggleFavorite(product.id, e)}
                  className={`flex-1 inline-flex items-center justify-center space-x-2 font-bold text-sm px-6 py-4 rounded-2xl transition-all duration-300 border shadow-md hover:-translate-y-0.5 cursor-pointer ${isFavorite ? 'bg-cozy-rose/25 text-cozy-burgundy border-cozy-rose' : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50'}`}
                  id={`wishlist-toggle-detail-${product.id}`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current text-cozy-burgundy' : 'text-stone-400'}`} />
                  <span>{isFavorite ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Related Curated Finds Section */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-cozy-rose/20 pt-8 mt-10">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-5 flex items-center space-x-2">
                <span className="w-1.5 h-6 bg-cozy-burgundy rounded-full" />
                <span>Related Curated Treasures</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.map((relProduct) => (
                  <div
                    key={relProduct.id}
                    onClick={() => onSelectProduct(relProduct)}
                    className="bg-white rounded-2xl p-3 border border-cozy-rose/10 shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 text-left flex flex-col group"
                  >
                    <div className="relative overflow-hidden rounded-xl aspect-video mb-3">
                      <img
                        src={relProduct.image}
                        alt={relProduct.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] text-cozy-brown uppercase font-semibold">
                      {relProduct.subcategory}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-cozy-burgundy transition-colors duration-200 line-clamp-1 mt-0.5">
                      {relProduct.title}
                    </h4>
                    <div className="flex items-center space-x-1 text-amber-500 mt-2">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-semibold text-stone-700">{relProduct.rating}</span>
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
