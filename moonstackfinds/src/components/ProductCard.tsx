import React, { useState } from 'react';
import { Heart, ExternalLink, Eye, Star, Share2, Pin, Twitter, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onViewDetails: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  isFavorite,
  onToggleFavorite
}: ProductCardProps) {
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Deep-linked dynamic social sharing templates
  const pageUrl = window.location.href;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(`I fell in love with this: "${product.title}" on MoonStackFinds!`);
  const encodedImage = encodeURIComponent(product.image);

  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="pinterest-item group bg-cozy-cream rounded-3xl overflow-hidden border border-cozy-rose/10 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col cursor-pointer transform hover:-translate-y-1.5 hover:scale-[1.02]"
      onClick={() => onViewDetails(product)}
      id={`product-card-${product.id}`}
    >
      {/* Product Image Stage with category overlay tag and Pinterest controls */}
      <div className="relative overflow-hidden aspect-auto max-h-[460px]">
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-auto object-cover object-center max-h-[420px] group-hover:scale-103 transition-transform duration-500 rounded-t-3xl"
        />

        {/* Dynamic Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1 z-10">
          <span className="bg-cozy-cream/95 backdrop-blur-xs text-cozy-burgundy text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-cozy-rose/20">
            {product.category}
          </span>
          {product.trending && (
            <span className="bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs w-max">
              🔥 Trending
            </span>
          )}
          {product.featured && (
            <span className="bg-cozy-burgundy text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs w-max">
              ✦ Highlight
            </span>
          )}
        </div>

        {/* Pinterest Savable Favorite button */}
        <button
          onClick={(e) => onToggleFavorite(product.id, e)}
          id={`fav-btn-${product.id}`}
          className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md z-10 transition-all duration-300 cursor-pointer ${isFavorite ? 'bg-cozy-burgundy text-white scale-110' : 'bg-cozy-cream/90 text-cozy-burgundy hover:bg-cozy-burgundy hover:text-white hover:scale-105'}`}
          title={isFavorite ? "Remove from my favorites scrapbook" : "Pin to my favorites scrapbook"}
        >
          <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick action control panel visible on hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={() => onViewDetails(product)}
            className="p-3 bg-cozy-cream/95 text-stone-900 rounded-full hover:bg-cozy-burgundy hover:text-white shadow-lg transition-all duration-300 cursor-pointer transform translate-y-3 group-hover:translate-y-0"
            title="Inspect Details"
          >
            <Eye className="w-5 h-5 focus:animate-ping" />
          </button>
          
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-3 bg-cozy-burgundy text-white rounded-full hover:bg-cozy-brown shadow-lg transition-all duration-300 cursor-pointer transform translate-y-3 group-hover:translate-y-0 delay-75"
            title="Shop on Amazon Affiliate"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Card Information Details Segment */}
      <div className="p-5 flex flex-col space-y-3 flex-1 bg-cozy-cream">
        
        {/* Rating Metrics & Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-cozy-brown font-mono tracking-wide">
            {product.subcategory}
          </span>
          <div className="flex items-center space-x-1 text-amber-500" title={`Rating: ${product.rating}`}>
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold text-stone-700">{product.rating}</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="font-serif text-base font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-cozy-burgundy transition-colors duration-200">
          {product.title}
        </h3>

        {/* Shortened Review Description Snippet */}
        <p className="text-stone-600 text-xs leading-relaxed line-clamp-3">
          {product.description}
        </p>

        {/* Inner Review Excerpt Block */}
        <div className="bg-cozy-beige/50 border-l-2 border-cozy-rose/40 p-2.5 rounded-r-xl">
          <p className="text-[11px] italic text-cozy-brown font-medium line-clamp-2">
            " {product.review} "
          </p>
        </div>

        {/* Footer controls: Detail and Amazon Affiliate shop */}
        <div className="flex items-center justify-between pt-3 border-t border-cozy-rose/15 mt-auto" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails(product)}
            className="text-cozy-burgundy hover:text-cozy-brown text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer inline-flex items-center space-x-0.5"
          >
            <span>Read review</span>
            <span>→</span>
          </button>

          <div className="flex items-center space-x-1.5 relative">
            {/* Social Share Trigger */}
            <button
              onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
              className="p-1.5 bg-cozy-beige/40 hover:bg-cozy-rose/20 text-cozy-brown hover:text-cozy-burgundy rounded-full transition-colors cursor-pointer"
              title="Share curation"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Custom Share Dialog Popover */}
            {isShareDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsShareDropdownOpen(false)} />
                <div className="absolute bottom-8 right-0 bg-white border border-cozy-rose/20 rounded-xl p-2 shadow-xl z-30 flex flex-col space-y-1.5 w-36">
                  <a
                    href={pinterestShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-2.5 py-1.5 text-[11px] text-stone-700 hover:bg-stone-50 hover:text-cozy-burgundy rounded-lg font-semibold transition-colors justify-start"
                  >
                    <Pin className="w-3.5 h-3.5 text-cozy-burgundy fill-current" />
                    <span>Post on Pinterest</span>
                  </a>
                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-2.5 py-1.5 text-[11px] text-stone-700 hover:bg-stone-50 hover:text-blue-500 rounded-lg font-semibold transition-colors justify-start"
                  >
                    <Twitter className="w-3.5 h-3.5 text-blue-500 fill-current" />
                    <span>Post to X</span>
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-2.5 py-1.5 text-[11px] text-left text-stone-700 hover:bg-stone-50 rounded-lg font-semibold transition-colors justify-start w-full cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600 font-medium">Copied Link!</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 text-cozy-brown" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Outbound Link Button */}
            <a
              href={product.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cozy-burgundy hover:bg-cozy-brown hover:scale-101 hover:-translate-y-0.5 text-cozy-cream text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-300 shadow-sm flex items-center space-x-1"
            >
              <span>Buy now</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
