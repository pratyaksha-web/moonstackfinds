export interface Product {
  id: string;
  title: string;
  category: string; // Category ID
  subcategory?: string; // Subcategory ID
  description: string;
  review: string;
  rating: number;
  image: string; // Local storage or base64 or storage url
  affiliateLink: string;
  featured: boolean;
  trending: boolean;
  tags?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  tags: string[];
  productIds?: string[]; // IDs of products featured in this blog post
  images?: string[]; // Multiple extra images
  affiliateLinks?: string[]; // Affiliate links
  pinterestImages?: string[]; // Pinterest images
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

export interface Subcategory {
  id: string;
  categoryId: string; // parent category ID
  name: string;
}
