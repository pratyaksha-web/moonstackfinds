import { Product, BlogPost, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'books',
    name: 'Books',
    description: 'Cozy autumn reads, thrillers, and beautiful hardcover journals.',
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    icon: 'BookOpen'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Warm knits, linen coordinates, and elegant, neutral-toned style guides.',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=600',
    icon: 'Sparkles'
  },
  {
    id: 'home-decor',
    name: 'Home Decor',
    description: 'Earthy ceramics, abstract mirrors, soft textiles, and warm ambient lighting.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600',
    icon: 'Home'
  },
  {
    id: 'desk-setup',
    name: 'Desk Setup',
    description: 'Minimalist desk mats, mechanical keyboards, and brass stationary.',
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=600',
    icon: 'Laptop'
  },
  {
    id: 'beauty',
    name: 'Beauty',
    description: 'Clean serums, organic lip oils, and aesthetic vanity accessories.',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600',
    icon: 'Heart'
  },
  {
    id: 'tech-finds',
    name: 'Tech Finds',
    description: 'Retro tech, high-fidelity copper headphones, and ambient chargers.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    icon: 'Cpu'
  },
  {
    id: 'kitchen-finds',
    name: 'Kitchen Finds',
    description: 'Sage green espresso makers, ribbed glassware, and functional wooden boards.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
    icon: 'Utensils'
  },
  {
    id: 'gift-guides',
    name: 'Gift Guides',
    description: 'Curated box guides, custom gift tags, and thoughtful seasonal surprises.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600',
    icon: 'Gift'
  },
  {
    id: 'travel-essentials',
    name: 'Travel Essentials',
    description: 'Linen passport holders, compact leather organizers, and aesthetic duffels.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600',
    icon: 'Compass'
  },
  {
    id: 'amazon-favorites',
    name: 'Amazon Favorites',
    description: 'Everyday viral essential finds reviewed by our editors.',
    image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=600',
    icon: 'ShoppingBag'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'The Silent Patient',
    category: 'Books',
    subcategory: 'Thriller',
    description: 'Alicia Berenson’s life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London’s most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.',
    review: 'One of the best psychological thrillers I have ever read. The structural pacing is masterful, and the sheer audacity of the final twist will leave you staring at the wall in absolute silence for ten minutes. Perfect for dynamic cozy nights with a warm cup of cardamom tea!',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/dp/1250301696',
    featured: true,
    trending: true
  },
  {
    id: 'prod-2',
    title: 'Aesthetic Ribbed Textured Drinking Glasses',
    category: 'Kitchen Finds',
    subcategory: 'Drinkware',
    description: 'Set of 4 vintage wave design origami style glassware with bamboo lids and glass straws. Made of premium high-durability lead-free borosilicate. Perfect for iced matcha latte brews and morning cold press beverages.',
    review: 'Honestly elevates your morning beverage routine instantly. The fluted texture holds light beautifully and provides a soft, satisfying grip. They look incredible on a desk next to cozy stationery.',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=aesthetic+ribbed+drinking+glasses',
    featured: true,
    trending: true
  },
  {
    id: 'prod-3',
    title: 'Cozy Merino Wool Oversized Cable Knit Sweater',
    category: 'Fashion',
    subcategory: 'Knitwear',
    description: 'A beautifully styled thick fisherman mock neck sweater in warm oatmeal cream. Spun from 100% fine mulesing-free Australian merino wool featuring traditional Irish cable stitches.',
    review: 'The ultimate staple! The drape is incredibly flattering, cozy but highly polished. It has that authentic heavy-weight comfort without itching. Matches beautifully with gold jewelry and classic trench coats.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=oversized+merino+cable+knit+sweater',
    featured: true,
    trending: false
  },
  {
    id: 'prod-4',
    title: 'Minimalist Brass Table Lamp with Amber Glow',
    category: 'Home Decor',
    subcategory: 'Lighting',
    description: 'A sculptural table light made of direct gold-molded brushed brass finish with an energy-efficient warm LED amber bulb. Includes integrated multi-stage dimming touch sensor.',
    review: 'Perfect for late-night reading and setting a warm, peaceful mood. It sits on my nightstand and illuminates the room in a gentle, warm tone that facilitates restfulness.',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=brushed+brass+table+lamp+dimmable',
    featured: false,
    trending: true
  },
  {
    id: 'prod-5',
    title: 'Eco-Friendly Premium Vegan Cork Desk Mat',
    category: 'Desk Setup',
    subcategory: 'Accessories',
    description: 'Dual-sided workspace protector. One side crafted from organic Portuguese oak cork, the other from premium textured vegan leather in dusty rose forest tones.',
    review: 'Instantly organizes the entire desk area. Mechanical keyboards glide nicely across it, and it feels deeply grounded. Highly recommend the Rose/Brown variant as a mouse pad substitute.',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=vegan+leather+cork+desk+mat',
    featured: true,
    trending: false
  },
  {
    id: 'prod-6',
    title: 'Vintage Leather Travel Journal & Sketchbook',
    category: 'Desk Setup',
    subcategory: 'Stationery',
    description: 'Handcrafted leather travel wrap journal filled with 240 pages of premium 120gsm blank unruled cream cartridge papers. Ideal for ink pen illustration, thoughts, and travel notes.',
    review: 'The quality of the leather is exceptional—it smells wonderful and compiles scars gracefully, making it feel deeply personal over time. A gorgeous vintage creative escape companion.',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=leather+journal+sketchbook+unlined',
    featured: false,
    trending: true
  },
  {
    id: 'prod-7',
    title: 'Glow Botanical Squalane & Rosehip Face Oil',
    category: 'Beauty',
    subcategory: 'Skincare',
    description: 'Highly concentrated organic facial elixir featuring pure cold-pressed rosehip seed oil, sugarcane squalane complex, and organic jasmine absolute extract for overnight dewy skin restoration.',
    review: 'Provides a gorgeous non-greasy morning glow. The light floral scent is incredibly relaxing before bed, and it absorbs deeply to lock in skin moisture.',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=squalane+rosehip+face+oil+organic',
    featured: true,
    trending: true
  },
  {
    id: 'prod-8',
    title: 'Retro Portable Bluetooth Mechanical Keyboard',
    category: 'Desk Setup',
    subcategory: 'Keyboards',
    description: 'Typewriter-inspired mechanical keyboard featuring tactile brown switches, round pastel cream keycaps, and a gorgeous mahogany styled backing. Connects effortlessly to iPad, Laptop, or Phone.',
    review: 'Absolute typing bliss! Clicking on this feels like writing a novel on a cold autumn evening in a countryside cottage. The clicky auditory feedback is crisp but quiet enough for workspaces.',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=retro+mechanical+keyboard+bluetooth',
    featured: false,
    trending: false
  },
  {
    id: 'prod-9',
    title: 'Sandalwood & Velvet Oak Amber Scented Candle',
    category: 'Home Decor',
    subcategory: 'Candles',
    description: 'Luxurious double-wicked soy candle handpoured in a dark reusable stoneware jar. Features rich, woodsy top notes of warm sandalwood, velvet oak, amber elements, and cardamon seed.',
    review: 'This smells of fresh raindrops on cedar wood, old leather-bound pages, and crisp mountain wind. The ceramic reusable jar is gorgeous enough to plant a mini-succulent in afterward.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=sandalwood+amber+soy+candle+ceramic',
    featured: true,
    trending: true
  },
  {
    id: 'prod-10',
    title: 'Washed Linen Duvet Cover Set - Earthy Terracotta',
    category: 'Home Decor',
    subcategory: 'Bedding',
    description: 'Crafted entirely from premium French flax. Enzyme stone washed for ultimate softness, breathability, and that effortless relaxed crinkled appearance. Set includes duvet cover and two standard cases.',
    review: 'Like sleeping inside a soft warm cloud. It keeps me cozy in winter and perfectly cool during humid summer nights. The earthy terracotta tone gives the room a luxury Mediterranean feel.',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=french+flax+linen+duvet+set+terracotta',
    featured: false,
    trending: true
  },
  {
    id: 'prod-11',
    title: 'Minimalist Travel Duffel with Garment Compartment',
    category: 'Travel Essentials',
    subcategory: 'Bags',
    description: 'Splendid travel weekender bag in water-resistant high-density nylon canvas with full leather accents. Folds flat with an integrated side-hung hanging suit/dress garment carrier.',
    review: 'Absolute game changer for destination weekends and weddings. It somehow fits three dresses, footwear, makeup capsules, and accessories without wrinkling a single stitch.',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=weekender+convertible+garment+bag',
    featured: true,
    trending: false
  },
  {
    id: 'prod-12',
    title: 'Pre-Packaged Premium Spa Sleep Gift Box Set',
    category: 'Gift Guides',
    subcategory: 'Wellness',
    description: 'A luxurious wellness gift box incorporating a mulberry silk sleeping eye-mask, lavender organic linen bath salts, soothing herbal loose-teabag tin, and a calm-inducing botanical mist spray.',
    review: 'Bought this for three of my hardworking closest friends, and each one raved about it. Sending this is like gifting an entire day of serene luxury spa rest in a beautifully wrapped carton.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600',
    affiliateLink: 'https://www.amazon.com/s?k=spa+wellness+gift+box+set',
    featured: true,
    trending: true
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Creating a Cozy Reading Corner: 5 Pillars of Perfect Sanctuary',
    excerpt: 'How to curate an aesthetic, stress-free space with soft lights, perfect blankets, and timeless paperbacks that make you never want to leave.',
    date: 'June 01, 2026',
    readTime: '5 min read',
    category: 'Home Decor',
    tags: ['Cozy Life', 'Home Decor', 'Reading Inspiration', 'Aesthetic'],
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    productIds: ['prod-1', 'prod-4', 'prod-9'],
    content: `There's something deeply magical about carving out a specific physical corner entirely dedicated to quiet hours, hot mugs, and paperbacks. In a high-speed digital world, an intentional reading nook is a sanctuary for the mind.

Whether you have an entire room or just a forgotten corner beside a window, you can create a beautiful literary escape. Here are the 5 core pillars of building your ultimate cozy reading sanctuary.

### 1. The Right Seat Architecture
Your chair is the foundation of the nook. Look for pieces that invite you to curl up, rather than sit formally. High backs, deep cushions, and soft fabrics like velvet or nubby bouclé are ideal. Don't forget an ottoman or a plush floor pouf to kick your feet up!

### 2. Layered Warm Lighting
Never use overhead blue light in your sanctuary. Opt instead for nested lighting coordinates. Combine a focused brushed-brass floor lamp (such as our [Minimalist Brass Table Lamp](/products/prod-4)) next to your seat with a few amber wax candles to generate a gentle firelight mood.

### 3. Sensory Warmth & Aromatherapy
To signal to your brain that it is time to unwind, introduce a signature home scent. Woody base notes like sandalwood combined with warm spices create an atmosphere of security and depth. Light our favorite [Sandalwood & Velvet Oak Amber Scented Candle](/products/prod-9) about ten minutes before you sit down.

### 4. Textiles with Weight
A corner isn't cozy without weight. Layer a premium linen duvet throw or structured chunky blankets across the armrests. Having texture nearby encourages your skin to relax.

### 5. Curating the Stack
Keep a small wooden side stool or shelf loaded with 2-3 books you are genuinely excited about. Avoid cluttering the desk with unfinished reading guilt—just high quality curations. We highly suggest starting with [The Silent Patient](/products/prod-1) for a thrilling night.

Happy unwinding, friends!`
  },
  {
    id: 'blog-2',
    title: 'The Ultimate Minimalist Desk Guide for High Creative Focus',
    excerpt: 'Ditch the tech clutter. Discover original retro mechanical keyboards, vegan mat textures, and cozy desk accents that inspire deep daily writing sessions.',
    date: 'May 28, 2026',
    readTime: '7 min read',
    category: 'Desk Setup',
    tags: ['Desk Setup', 'Productivity', 'Minimalism', 'Tech Finds'],
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=600',
    productIds: ['prod-5', 'prod-6', 'prod-8'],
    content: `Your workspace directly influences the quality of your focus and creative flow. When surrounded by visual static—cords, trash, scattered notes—your brain spends passive energy filtering distractions.

But a boring, antiseptic cubicle is just as damaging to inspiration. The sweet spot? A functional, tactile, warm-toned minimalist setup that is comfortable and beautiful.

### Tactile Bliss Over Plastic
Human fingers crave texture. Swapping cold plastic desk covers for raw materials like natural Portuguese cork or premium vegan leather instantly alters how it feels to rest your arms at work. A high-quality desk protector like the [Eco-Friendly Vegan Cork Desk Mat](/products/prod-5) provides visual cohesion and dampens keyboard acoustics.

### Incorporating Retro Playfulness
Who said typing has to feel like data entry? Adding a retro mechanical keyboard with brown tactile switches mimics the tactile joy of traditional typewriter iron blocks without the excessive noise. It turns drafting emails into an elegant, auditory ritual.

### analog Backups
Always keep a beautiful blank hardcover page next to your setup. When you get stuck on a digital program, sketch your thoughts out by hand. Writing inside a handcrafted journal like the [Vintage Leather Travel Journal](/products/prod-6) reconnects you to the physical act of creation.

Try clearing 3 unnecessary things from your desk tonight, and notice how much lighter your morning feel!`
  },
  {
    id: 'blog-3',
    title: 'Aesthetic Amazon Skincare & Beauty Finds Under $45',
    excerpt: 'The secret is high cold-pressed content and clean ingredients. My honest editorial reviews of viral, highly-rated beauty items that work.',
    date: 'May 15, 2026',
    readTime: '4 min read',
    category: 'Beauty',
    tags: ['Beauty Finds', 'Skincare Routine', 'Amazon Favs', 'Self Care'],
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600',
    productIds: ['prod-7'],
    content: `Finding reliable skincare in the vast sea of viral trends can feel like an expensive game of trial and error. But gorgeous skin health shouldn't cost a full day's paycheck.

Today, we are highlighting a stellar cold-pressed botanical product that consistently outperforms high-end department store products.

### Squalane meets Rosehip
Pure organic botanical ingredients are highly biocompatible, meaning they melt into your skin lipid barriers easily without clogging pores. The [Glow Botanical Squalane & Rosehip Face Oil](/products/prod-7) is a gorgeous overnight treatment. Squalane mimic's the skin's natural sebum, while cold-pressed rosehip seeds deliver natural Vitamin A (retinol's nourishing cousin) and high essential fatty acids.

### The Midnight Ritual
For absolute luxury, add 3 small drops into your palms, rub them together to warm up the organic compounds, and gently press them onto damp clean skin right before bed. Follow up with a cold jade roller to contour face muscles. You will awaken with a plump, beautifully hydrated glow!`
  },
  {
    id: 'blog-4',
    title: 'The Perfect Warm Autumn Capsulewardrobe Essentials',
    excerpt: 'Curate a timeless collection of fine merino wool cables, trench layers, and oatmeal coordinates that feel rich and style effortlessly.',
    date: 'April 30, 2026',
    readTime: '6 min read',
    category: 'Fashion',
    tags: ['Capsule Wardrobe', 'Knitwear', 'Autumn Style', 'Neutral Theme'],
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=600',
    productIds: ['prod-3'],
    content: `The secret to simple, stress-free morning routine starts with a cohesive capsule wardrobe. A capsule wardrobe is a highly intentional collection of mutual pieces in organic silhouettes and complementary earthy shades.

By choosing color pigments like oatmeal beige, dusty creams, rich warm browns, and occasional burgundy accents, you ensure every piece in your closet styled effortlessly together.

### The Hero: Premium Cable Knit
A heavy, thick-stitch mock neck like our favorite [Cozy Merino Wool Oversized Cable Knit Sweater](/products/prod-3) is the absolute anchor of an autumn wardrobe. Pair it with flowy linen wide-leg pants or throw it over a simple silk slip dress for instant luxury.

### Layering Sophistication
Always use natural fiber materials like Australian wool or light, organic flax linen. They breathe naturally, prevent sweating, drape gracefully across shoulders, and last for seasons when cared for properly.

Invest in less pieces, but select ones with exquisite weave details and authentic heavy comfort.`
  }
];
