export type CreativeCategory = 'Logos & Branding' | 'Banners & Social Media' | 'AI Images' | 'AI Videos';

export interface CreativeItem {
  id: string;
  title: string;
  category: CreativeCategory;
  shortDescription: string;
  thumbnail: string;
  fullImage?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  toolsUsed: string[];
  deliverables?: string[];
}

export const CREATIVE_ITEMS: CreativeItem[] = [
  // -------------------------------------------------------------
  // TAB 1: Logos & Branding
  // -------------------------------------------------------------
  {
    id: "logo-apex-medical",
    title: "Apex Medical & Clinic Identity",
    category: "Logos & Branding",
    shortDescription: "Modern geometric cross monogram combining clinical trust, precision angles, and an inviting primary care color system.",
    thumbnail: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
    fullImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&auto=format&fit=crop&q=90",
    toolsUsed: ["Figma", "Vector SVG", "Brand Guide"],
    deliverables: ["Primary & secondary logos", "Vector SVG & PNG formats", "Color palette specification", "Typography pairing guide"]
  },
  {
    id: "logo-happy-mascot",
    title: "Happy Person Studio Mascot",
    category: "Logos & Branding",
    shortDescription: "Custom brand mascot character and expressive badge system designed to give digital interfaces a friendly, approachable persona.",
    thumbnail: "/src/assets/images/happy_person_mascot_1792166218374.jpg",
    fullImage: "/src/assets/images/happy_person_mascot_1792166218374.jpg",
    toolsUsed: ["AI Prototyping", "Vector Illustration", "Design System"],
    deliverables: ["Full mascot badge", "Favicon & avatar crop", "Dark/Light mode contrast variants", "Social media profile kit"]
  },
  {
    id: "logo-verde-osteria",
    title: "Verde Osteria Italiana Seal",
    category: "Logos & Branding",
    shortDescription: "Handcrafted Tuscan typography seal with olive branch motif tailored for boutique fine dining menus, coasters, and signage.",
    thumbnail: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    fullImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=90",
    toolsUsed: ["Typography Studio", "Illustrator", "Print Ready"],
    deliverables: ["Vintage seal mark", "Horizontal wordmark", "High-res print package", "Menu header templates"]
  },
  {
    id: "logo-homenest-realty",
    title: "HomeNest Luxury Realty Mark",
    category: "Logos & Branding",
    shortDescription: "Minimalist architectural roofline and interlocking 'H' monogram for high-end residential brokerages and property developers.",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    fullImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=90",
    toolsUsed: ["Figma", "Vector Geometry", "Brand Identity"],
    deliverables: ["Monogram icon", "Property sign board layout", "Business card stationery", "App icon asset"]
  },

  // -------------------------------------------------------------
  // TAB 2: Banners & Social Media
  // -------------------------------------------------------------
  {
    id: "banner-brightsmile-facebook",
    title: "BrightSmile Facebook Cover & Promo Banner",
    category: "Banners & Social Media",
    shortDescription: "High-converting Facebook page banner optimized with safe margins for both mobile and desktop screens, highlighting online booking.",
    thumbnail: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80",
    fullImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1600&auto=format&fit=crop&q=90",
    toolsUsed: ["Figma", "Social Media Specs", "Photo Retouching"],
    deliverables: ["820x312 FB Cover (Desktop/Mobile safe)", "1200x630 OG social share card", "Messenger callout badge", "Editable master template"]
  },
  {
    id: "banner-urbaneats-tasting",
    title: "UrbanEats Chef Tasting Ad Creative",
    category: "Banners & Social Media",
    shortDescription: "Atmospheric, dark-mode social media banner set crafted for weekend reservation drives and sponsored Instagram feed placements.",
    thumbnail: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    fullImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=90",
    toolsUsed: ["Color Grading", "Social Ad Specs", "Typography"],
    deliverables: ["1:1 Instagram Post (1080x1080)", "9:16 Story / Reel Format (1080x1920)", "1200x628 Facebook Ad Banner", "High-res JPEG & PNG"]
  },
  {
    id: "banner-taskflow-launch",
    title: "TaskFlow SaaS Product Launch Header",
    category: "Banners & Social Media",
    shortDescription: "Sleek tech header showcasing live dashboard cards, user growth graph pills, and conversion-optimized call-to-action buttons.",
    thumbnail: "/src/assets/images/saas_dashboard_mockup_1792086720504.jpg",
    fullImage: "/src/assets/images/saas_dashboard_mockup_1792086720504.jpg",
    toolsUsed: ["UI Layout", "3D Elevation", "Gradient Glows"],
    deliverables: ["Twitter/X Header (1500x500)", "LinkedIn Company Cover (1584x396)", "Product Hunt hero banner", "Retina preview mockups"]
  },
  {
    id: "banner-happy-studio",
    title: "Happy Person Studio Panoramic Showcase",
    category: "Banners & Social Media",
    shortDescription: "Vibrant high-resolution brand banner displaying the studio mascot, signature neon blue accents, and core design specialties.",
    thumbnail: "/src/assets/images/happy_person_banner_1792166219172.jpg",
    fullImage: "/src/assets/images/happy_person_banner_1792166219172.jpg",
    toolsUsed: ["AI Generation", "Color Balancing", "Brand Assets"],
    deliverables: ["Website hero wallpaper", "1920x1080 Full HD banner", "Facebook page cover", "OpenGraph 1200x630 preview"]
  },

  // -------------------------------------------------------------
  // TAB 3: AI Images
  // -------------------------------------------------------------
  {
    id: "ai-img-cosmetics",
    title: "Minimalist Skincare Bottle Product Render",
    category: "AI Images",
    shortDescription: "Studio-lit AI product photography featuring frosted glass texture, realistic water droplet condensation, and balanced natural stone pedestal.",
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    fullImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&auto=format&fit=crop&q=90",
    toolsUsed: ["Midjourney v6", "Photoshop Upscale", "Studio Lighting"],
    deliverables: ["4K Resolution render", "Transparent backdrop PNG cutout", "E-commerce product hero image", "Color-matched reflections"]
  },
  {
    id: "ai-img-villa",
    title: "Modern Architectural Villa Evening Concept",
    category: "AI Images",
    shortDescription: "Photorealistic twilight architectural visual showcasing cantilevered concrete roofs, warm interior illumination, and reflective swimming pool.",
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
    fullImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=90",
    toolsUsed: ["AI Architecture Engine", "Atmospheric Lighting", "High-Res Render"],
    deliverables: ["Ultra-wide website hero backdrop", "Real estate pitch render", "300 DPI print-ready export", "Color-graded lighting pass"]
  },
  {
    id: "ai-img-coffee",
    title: "Artisan Espresso Machine Industrial Visual",
    category: "AI Images",
    shortDescription: "Macro-detail product visualization capturing polished chrome, brushed copper piping, and rising aromatic steam for café websites.",
    thumbnail: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    fullImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1600&auto=format&fit=crop&q=90",
    toolsUsed: ["AI Texture Synthesis", "Depth of Field", "Product Hero"],
    deliverables: ["Product hero centerpiece", "Packaging visual asset", "Instagram square crop", "Retina display banner"]
  },
  {
    id: "ai-img-sneaker",
    title: "Futuristic Kinetic Sneaker Concept",
    category: "AI Images",
    shortDescription: "High-concept footwear design with translucent honeycomb soles, neon reflective threading, and floating studio presentation.",
    thumbnail: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
    fullImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&auto=format&fit=crop&q=90",
    toolsUsed: ["AI Fashion Engine", "3D Volumetric Lighting", "Studio Render"],
    deliverables: ["Side elevation render", "3/4 isometric perspective", "Dark background hero edition", "Social teaser cards"]
  },

  // -------------------------------------------------------------
  // TAB 4: AI Videos (Embedded YouTube Responsive Player + Watch on YouTube)
  // -------------------------------------------------------------
  {
    id: "ai-vid-product-commercial",
    title: "Futuristic Brand & Product Reel (AI Motion)",
    category: "AI Videos",
    shortDescription: "High-impact cinematic promotional video showcasing dynamic 3D camera sweeps, bold typography pacing, and AI-generated product visuals.",
    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    toolsUsed: ["Runway Gen-2", "CapCut Pro", "Sound Design", "After Effects"],
    deliverables: ["16:9 Full HD YouTube embed", "9:16 Vertical Reel format", "Soundtrack sync & captions", "High-bitrate MP4 download"]
  },
  {
    id: "ai-vid-mascot-animation",
    title: "Happy Person Mascot Studio Motion Teaser",
    category: "AI Videos",
    shortDescription: "Playful character animation highlighting Happy Person's creative workflow, friendly communication, and rapid frontend delivery.",
    thumbnail: "/src/assets/images/happy_person_banner_1792166219172.jpg",
    youtubeId: "L_LUpnjgPso",
    youtubeUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    toolsUsed: ["AI Character Motion", "Keyframe Animation", "Color Grading"],
    deliverables: ["YouTube responsive video", "Looping website hero video", "Social teaser cutdown", "Transparent video overlay"]
  },
  {
    id: "ai-vid-interface-tour",
    title: "Interactive Web & SaaS UI Walkthrough",
    category: "AI Videos",
    shortDescription: "Dynamic 60fps video walkthrough showcasing fluid responsive interactions, smooth appointment booking flows, and instant sub-second page loads.",
    thumbnail: "/src/assets/images/realestate_mockup_1792086719579.jpg",
    youtubeId: "ysz5S6PUM-U",
    youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    toolsUsed: ["Screen Capture 4K", "Smooth Pan & Zoom", "Voiceover Audio", "Motion Graphics"],
    deliverables: ["YouTube embed player", "Client presentation video", "Social media demo reel", "Timed chapter markers"]
  }
];
