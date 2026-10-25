/**
 * LUMINA E-Commerce - Product Catalog Database
 * High-quality sample products across multiple categories
 */

const PRODUCTS_DATA = [
  {
    id: "prod-1",
    name: "Aura Pro Wireless Headphones",
    category: "Audio",
    brand: "Lumina Sound",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.9,
    reviewCount: 328,
    isNew: true,
    isFeatured: true,
    inStock: true,
    colors: ["Space Black", "Silver Mist", "Midnight Blue"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Industry-leading active noise cancellation with spatial audio positioning. Ergonomically engineered for all-day comfort with up to 40 hours of battery life on a single charge.",
    features: [
      "Hybrid Active Noise Cancellation",
      "40-hour battery life with Fast Fuel (10 min = 5 hours)",
      "Custom 40mm titanium drivers",
      "Multi-device seamless Bluetooth 5.3"
    ]
  },
  {
    id: "prod-2",
    name: "Minimalist Chrono Smartwatch",
    category: "Wearables",
    brand: "Aethelgard",
    price: 149.50,
    originalPrice: 189.00,
    rating: 4.8,
    reviewCount: 215,
    isNew: false,
    isFeatured: true,
    inStock: true,
    colors: ["Titanium Silver", "Matte Slate", "Rose Gold"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Sleek circular AMOLED display encased in aircraft-grade sapphire and titanium. Tracks advanced vitals, heart rate, sleep quality, and 80+ sports modes with 7-day battery endurance.",
    features: [
      "1.43-inch Ultra Retina Always-on AMOLED",
      "SpO2 and continuous optical heart-rate monitoring",
      "5ATM Water Resistance (up to 50 meters)",
      "Wireless magnetic fast charging"
    ]
  },
  {
    id: "prod-3",
    name: "Vertex Mechanical Ergonomic Keyboard",
    category: "Tech",
    brand: "Lumina Key",
    price: 129.00,
    originalPrice: 159.00,
    rating: 4.7,
    reviewCount: 142,
    isNew: true,
    isFeatured: true,
    inStock: true,
    colors: ["Chalk White", "Cyber Slate"],
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Custom gasket-mounted mechanical keyboard crafted for supreme typing acoustic pleasure. Hot-swappable switches with factory-lubed linear keys and per-key RGB backlighting.",
    features: [
      "75% compact ergonomic layout",
      "Pre-lubed linear custom switches",
      "Triple connectivity: 2.4GHz, Bluetooth 5.1 & Type-C",
      "CNC anodized aluminum frame"
    ]
  },
  {
    id: "prod-4",
    name: "Aerocool Ergonomic Daypack 22L",
    category: "Accessories",
    brand: "Nordic Path",
    price: 89.00,
    originalPrice: 110.00,
    rating: 4.9,
    reviewCount: 184,
    isNew: false,
    isFeatured: true,
    inStock: true,
    colors: ["Heather Gray", "Onyx Black", "Olive Moss"],
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Weatherproof urban backpack crafted with recycled Cordura nylon. Features a dedicated 16-inch fleece-lined laptop sleeve and smart modular compartments.",
    features: [
      "Water-repellent YKK Aquaguard zippers",
      "Suspended 16-inch laptop pocket",
      "Hidden anti-theft passport pocket",
      "Ergonomic airflow back panel"
    ]
  },
  {
    id: "prod-5",
    name: "Strata Ultralight Running Sneakers",
    category: "Footwear",
    brand: "Velocity",
    price: 135.00,
    originalPrice: 160.00,
    rating: 4.8,
    reviewCount: 290,
    isNew: true,
    isFeatured: false,
    inStock: true,
    colors: ["Cloud White", "Volt Green", "Monochrome"],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Engineered with energy-returning nitrogen-infused foam. Featherweight woven upper delivers unmatched breathability and spring-forward responsiveness.",
    features: [
      "Supercritical foam propulsion midsole",
      "Engineered recycled knit upper",
      "Carbon fiber stabilizer shank",
      "Continental rubber high-traction outsole"
    ]
  },
  {
    id: "prod-6",
    name: "PureSound Walnut Studio Speaker",
    category: "Audio",
    brand: "Lumina Sound",
    price: 219.00,
    originalPrice: 269.00,
    rating: 4.9,
    reviewCount: 97,
    isNew: false,
    isFeatured: true,
    inStock: true,
    colors: ["American Walnut", "Nordic Birch"],
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Handcrafted real wood enclosure offering rich, resonant room-filling acoustics. Supports Hi-Res Lossless streaming via WiFi, AirPlay 2, and Bluetooth.",
    features: [
      "Genuine handcrafted walnut casing",
      "60W RMS total power output",
      "Dual silk-dome tweeters and Kevlar woofer",
      "AirPlay 2, Spotify Connect & AUX input"
    ]
  },
  {
    id: "prod-7",
    name: "Zenith Polarized Designer Sunglasses",
    category: "Accessories",
    brand: "Optika Luxe",
    price: 79.00,
    originalPrice: 119.00,
    rating: 4.6,
    reviewCount: 88,
    isNew: false,
    isFeatured: false,
    inStock: true,
    colors: ["Tortoise Shell", "Matte Obsidian", "Amber Gold"],
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Precision-milled Italian acetate frame with scratch-resistant polarized CR-39 lenses. 100% UVA/UVB ray blocking for crystal clear optical clarity.",
    features: [
      "100% UV400 Protection polarized lenses",
      "Handmade Italian cellulose acetate",
      "Reinforced 5-barrel hinges",
      "Includes leather travel case & microfiber cloth"
    ]
  },
  {
    id: "prod-8",
    name: "Lumina Halo Ambient Desk Lamp",
    category: "Home",
    brand: "Aura Living",
    price: 95.00,
    originalPrice: 120.00,
    rating: 4.8,
    reviewCount: 164,
    isNew: true,
    isFeatured: true,
    inStock: true,
    colors: ["Pure White", "Brass Gold", "Anodized Black"],
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Sleek magnetic levitation-inspired arch lamp with stepless touch dimming and circadian color temperature adjustment from warm 2200K to focused 6500K.",
    features: [
      "Flicker-free natural eye-care LED",
      "Wireless charging pad integrated base (15W)",
      "Stepless capacitive touch brightness control",
      "Auto-timer sleep mode"
    ]
  },
  {
    id: "prod-9",
    name: "Classic Ceramic Pour-Over Dripper Set",
    category: "Home",
    brand: "Kissa Artisans",
    price: 48.00,
    originalPrice: 60.00,
    rating: 4.7,
    reviewCount: 76,
    isNew: false,
    isFeatured: false,
    inStock: true,
    colors: ["Matte White", "Glazed Stone", "Midnight"],
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Artisan-thrown stoneware dripper with insulated heat retention. Designed for optimal water percolation flow rate and maximum flavor extraction.",
    features: [
      "Handcrafted high-fire stoneware ceramic",
      "Internal spiral ribbing for uniform extraction",
      "Includes 600ml borosilicate glass server",
      "Dishwasher and heat safe"
    ]
  },
  {
    id: "prod-10",
    name: "Lumina Series 4K Action Camera",
    category: "Tech",
    brand: "Lumina Vision",
    price: 249.00,
    originalPrice: 299.00,
    rating: 4.8,
    reviewCount: 112,
    isNew: true,
    isFeatured: false,
    inStock: true,
    colors: ["Obsidian Black"],
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Capture fluid 4K 60FPS cinematic footage with 6-axis gyro stabilization. Waterproof down to 10m without an external housing.",
    features: [
      "4K/60fps and 1080p/240fps slow motion",
      "HyperSteady 3.0 horizon leveling",
      "Dual touchscreens for front & rear preview",
      "Waterproof up to 33ft (10m)"
    ]
  },
  {
    id: "prod-11",
    name: "Oasis Botanical Eau De Parfum 50ml",
    category: "Accessories",
    brand: "Botanica",
    price: 85.00,
    originalPrice: 105.00,
    rating: 4.9,
    reviewCount: 203,
    isNew: false,
    isFeatured: false,
    inStock: true,
    colors: ["Original Glass"],
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80&auto=format&fit=crop"
    ],
    description: "An intoxicating blend of bergamot, smoked cedarwood, crisp sea salt, and vetiver. Distilled in small sustainable artisanal batches.",
    features: [
      "Long-lasting 18% oil concentration",
      "Cruelty-free & sustainably sourced oils",
      "French recycled glass flacon",
      "Magnetic brass atomizer cap"
    ]
  },
  {
    id: "prod-12",
    name: "AeroGlide Leather City Loafers",
    category: "Footwear",
    brand: "Velocity",
    price: 165.00,
    originalPrice: 210.00,
    rating: 4.7,
    reviewCount: 94,
    isNew: false,
    isFeatured: false,
    inStock: false,
    colors: ["Chestnut Brown", "Glossy Black"],
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80&auto=format&fit=crop"
    ],
    description: "Full-grain calfskin leather with a cushioned memory-foam footbed. Effortlessly transitions from casual Friday to evening fine dining.",
    features: [
      "Supple full-grain Italian calfskin",
      "Blake-stitched flexible leather sole",
      "Memory foam arch-support insole",
      "Reinforced heel counter"
    ]
  }
];

// Available coupon codes
const PROMO_CODES = {
  "WELCOME10": { discount: 0.10, label: "10% Off Welcome Discount" },
  "STUDENT20": { discount: 0.20, label: "20% Off Student Special" },
  "SAVE15": { discount: 0.15, label: "15% Off VIP Savings" },
  "FREESHIP": { discount: 0.00, freeShipping: true, label: "Free Express Shipping" }
};
