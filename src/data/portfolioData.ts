import { Project, Service, Testimonial, PricingPlan, FaqItem, SiteProfile } from '../types';
import { CONTACT_CONFIG } from './contactConfig';

export { CONTACT_CONFIG };

export const PROFILE_INFO: SiteProfile = {
  name: "Happy Person",
  brandName: "Happy Person",
  studioType: "Independent Creative Web & UI Studio",
  shortName: "HP",
  title: "Independent Creative Web Designer & UI Developer",
  headline: "I design and build modern websites that help businesses get more customers.",
  subheading: "Custom web design, responsive websites, booking systems, dashboards, and AI-powered web app UIs by Happy Person.",
  avatar: "/images/brand/happy-person-mascot.webp",
  ogBanner: "/images/banners/og-preview.webp",
  bio: "Hello! I'm Happy Person—an independent creative web designer and frontend developer represented by a friendly, reliable studio mascot. I specialize in turning business ideas into clean, fast, and high-converting digital experiences. Using modern React, TypeScript, and styling, I build everything from local service landing pages and appointment booking systems to high-utility SaaS dashboards. I bring a friendly, playful creative touch backed by rigorous engineering and clear, reliable communication.",
  email: CONTACT_CONFIG.email,
  phone: CONTACT_CONFIG.whatsAppNumber,
  whatsappNumber: CONTACT_CONFIG.whatsAppNumber,
  whatsappUrl: CONTACT_CONFIG.whatsAppUrl,
  facebookPageUrl: CONTACT_CONFIG.facebookPageUrl,
  messengerUrl: CONTACT_CONFIG.messengerUrl,
  whatsapp: CONTACT_CONFIG.whatsAppNumber,
  location: "Independent Studio · Remote Worldwide",
  availability: "Available for Q4 / Q1 Projects",
  socials: {
    facebook: CONTACT_CONFIG.facebookPageUrl,
    whatsapp: CONTACT_CONFIG.whatsAppUrl,
    messenger: CONTACT_CONFIG.messengerUrl,
    email: `mailto:${CONTACT_CONFIG.email}`,
  },
  skills: [
    "Google AI Studio",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Next.js",
    "Node.js",
    "Cloud Firestore",
    "Firebase Storage",
    "UI/UX Prototyping",
    "Responsive Design",
    "SEO Optimization",
    "Web Performance"
  ],
  quickFacts: [
    {
      label: "Core Focus",
      title: "Web UI Design & Frontend",
      desc: "Pixel-perfect, accessible interfaces that convert visitors into paying clients."
    },
    {
      label: "Tech Stack",
      title: "Google AI Studio + Modern Web",
      desc: "Rapid iteration with Google AI Studio, React, TypeScript, and Tailwind CSS."
    },
    {
      label: "Specialties",
      title: "Bookings, Portals & Dashboards",
      desc: "Landing pages, healthcare clinics, restaurants, real estate, and SaaS interfaces."
    },
    {
      label: "Working Style",
      title: "Friendly, Fast & Reliable",
      desc: "Weekly milestones, mobile-first responsiveness, and post-launch maintenance."
    }
  ]
};

export const PROJECTS: Project[] = [
  {
    id: "brightsmile-dental",
    title: "BrightSmile Dental Clinic",
    category: "Booking Website",
    description: "Modern dental clinic website with automated appointment booking, treatment showcase, and patient portal.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Calendar API", "Cloud Firestore"],
    thumbnail: "/images/projects/dental-clinic-hero.webp",
    previewVideoUrl: "",
    liveDemoUrl: "https://example.com/demo/brightsmile",
    client: "BrightSmile Dental Practice",
    duration: "2 Weeks",
    problem: "The clinic was overwhelmed with manual telephone bookings, suffering from frequent appointment no-shows and an outdated website that lacked mobile responsiveness.",
    solution: "Designed and engineered an automated multi-step booking engine with SMS/email confirmations, practitioner selection, dental insurance verification helper, and clean mobile-first navigation.",
    features: [
      "Real-time calendar slot reservation with doctor selection",
      "Interactive dental procedure guides with upfront cost transparency",
      "Mobile-optimized patient intake form & appointment reminder system",
      "Google Reviews integration with 4.9-star trust badges",
      "Full HIPAA-conscious design layout and fast 98+ PageSpeed score"
    ],
    impactMetrics: [
      { label: "Online Bookings", value: "+145%" },
      { label: "No-Show Rate", value: "-38%" },
      { label: "Mobile Bounce Rate", value: "-24%" }
    ],
    screenshots: [
      "/images/projects/dental-clinic-hero.webp",
      "/images/banners/happy-person-banner.webp"
    ]
  },
  {
    id: "urbaneats-restaurant",
    title: "UrbanEats Restaurant",
    category: "Restaurant",
    description: "Atmospheric culinary showcase featuring an interactive seasonal menu, photography gallery, and instant table reservation.",
    tags: ["React", "Tailwind CSS", "OpenTable API", "Motion", "SEO"],
    thumbnail: "/images/projects/restaurant-hero.webp",
    previewVideoUrl: "",
    liveDemoUrl: "https://example.com/demo/urbaneats",
    client: "UrbanEats Bistro & Lounge",
    duration: "10 Days",
    problem: "UrbanEats relied on static PDF menus that were illegible on mobile phones and lost evening walk-ins due to an unintegrated reservation system.",
    solution: "Built a sensory-rich, dark-aesthetic dining website with interactive filterable dietary menus (vegan, gluten-free), live table reservation widget, and event booking.",
    features: [
      "Interactive digital menu with allergens, chef specials, and wine pairing guides",
      "One-click table booking with guest count & time preference selectors",
      "Curated high-resolution culinary gallery with smooth lightbox view",
      "Chef story monograph and press reviews showcase",
      "Integrated Google Maps location with opening hours & parking guide"
    ],
    impactMetrics: [
      { label: "Table Reservations", value: "+82%" },
      { label: "Mobile Menu Views", value: "3.4x" },
      { label: "Avg Session Duration", value: "2m 45s" }
    ],
    screenshots: [
      "/images/projects/restaurant-hero.webp"
    ]
  },
  {
    id: "homenest-realestate",
    title: "HomeNest Real Estate",
    category: "Real Estate",
    description: "High-end property listing platform with multi-parameter neighborhood filters, interactive virtual tours, and direct agent inquiry.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Mapbox", "Supabase"],
    thumbnail: "/images/projects/real-estate-hero.webp",
    previewVideoUrl: "",
    liveDemoUrl: "https://example.com/demo/homenest",
    client: "HomeNest Realty Group",
    duration: "3 Weeks",
    problem: "A boutique real estate agency needed an editorial-grade property portal to showcase high-value homes without getting lost in crowded third-party portals.",
    solution: "Crafted a clean architectural web app with faceted search (bedrooms, price range, neighborhood, pool), schedule a tour module, and WhatsApp direct agent chat.",
    features: [
      "Faceted real estate filtering with price sliders and instant search results",
      "Property detail sheets with floor plans, school district info, and mortgage calculator",
      "Interactive map view with neighborhood landmarks & transit times",
      "Direct agent inquiry and scheduled in-person or 3D video walk-throughs",
      "Optimized OpenGraph previews for effortless social media property sharing"
    ],
    impactMetrics: [
      { label: "Direct Inquiries", value: "+110%" },
      { label: "Tour Bookings", value: "+64%" },
      { label: "Load Speed", value: "0.8s" }
    ],
    screenshots: [
      "/images/projects/real-estate-hero.webp"
    ]
  },
  {
    id: "taskflow-dashboard",
    title: "TaskFlow Dashboard",
    category: "Dashboard UI",
    description: "Sleek SaaS productivity and analytics interface with real-time metrics, Kanban task pipelines, and member permission controls.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Recharts", "Lucide"],
    thumbnail: "/images/projects/saas-dashboard-hero.webp",
    previewVideoUrl: "",
    liveDemoUrl: "https://example.com/demo/taskflow",
    client: "TaskFlow Technologies",
    duration: "2.5 Weeks",
    problem: "A startup's beta web application had high user drop-off due to cluttered navigation and complicated tabular workflows that confused users.",
    solution: "Re-architected the entire web dashboard UI with an intuitive 3-zone layout, dark/light theme, interactive data visualizations, and streamlined task management.",
    features: [
      "Executive summary dashboard with MRR, churn rate, and active user trends",
      "Draggable Kanban workflow board with custom status columns and priority tags",
      "Sortable & filterable user management table with inline role adjustments",
      "Dark mode first design with customizable color accents",
      "Keyboard shortcuts for fast navigation and search dialogs"
    ],
    impactMetrics: [
      { label: "User Task Completion", value: "+46%" },
      { label: "Daily Active Retention", value: "+28%" },
      { label: "Onboarding Time", value: "-60%" }
    ],
    screenshots: [
      "/images/projects/saas-dashboard-hero.webp"
    ]
  },
  {
    id: "fitlife-gym",
    title: "FitLife Gym",
    category: "Business Website",
    description: "High-energy fitness club landing page with transparent membership tiers, group class schedules, and free 7-day trial signup.",
    tags: ["React", "Tailwind CSS", "Motion", "Stripe Checkout", "Forms"],
    thumbnail: "/images/projects/dental-clinic-hero.webp",
    previewVideoUrl: "",
    liveDemoUrl: "https://example.com/demo/fitlife",
    client: "FitLife Athletic Club",
    duration: "8 Days",
    problem: "The gym was suffering from declining walk-in memberships and lacked a way for prospects to test classes or review trainers online.",
    solution: "Built a conversion-focused landing page highlighting trainer credentials, dynamic weekly workout calendar, and instant SMS-verified free pass registration.",
    features: [
      "Weekly class timetable with filter by intensity, trainer, and studio room",
      "Tiered membership pricing cards with monthly vs. annual switch",
      "Instant free trial pass generation with automated reminder email",
      "Virtual gym floor tour with equipment highlight cards",
      "Testimonials slider from members with before/after progress highlights"
    ],
    impactMetrics: [
      { label: "Free Pass Signups", value: "+190%" },
      { label: "Annual Plan Sales", value: "+42%" },
      { label: "Mobile Conversion", value: "8.4%" }
    ],
    screenshots: [
      "/images/projects/dental-clinic-hero.webp"
    ]
  },
  {
    id: "stylehub-store",
    title: "StyleHub Store",
    category: "E-commerce",
    description: "Contemporary fashion e-commerce storefront with curated collections, dynamic size selection, sliding cart drawer, and frictionless checkout.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Shopify API", "Motion"],
    thumbnail: "/images/projects/restaurant-hero.webp",
    previewVideoUrl: "",
    liveDemoUrl: "https://example.com/demo/stylehub",
    client: "StyleHub Apparel",
    duration: "3 Weeks",
    problem: "The boutique was losing online shoppers on mobile due to a slow storefront, confusing size selection, and a clunky 4-page checkout process.",
    solution: "Delivered a lightweight, hyper-fast e-commerce UI with instant drawer cart, visual swatch selector, sticky mobile checkout CTA, and Apple Pay readiness.",
    features: [
      "Product collection catalog with grid/list switcher and price filters",
      "Product quick-view modal with zoomable thumbnail gallery and stock counter",
      "Slide-out slide cart drawer with free shipping progress bar",
      "Single-page checkout mockup with multiple payment method previews",
      "Wishlist management with local browser storage persistence"
    ],
    impactMetrics: [
      { label: "Checkout Completion", value: "+32%" },
      { label: "Cart Abandonment", value: "-19%" },
      { label: "Mobile Speed Index", value: "1.1s" }
    ],
    screenshots: [
      "/images/projects/restaurant-hero.webp"
    ]
  },
  {
    id: "cleanpro-services",
    title: "CleanPro Services",
    category: "Business Website",
    description: "Local commercial and residential cleaning service website with an instant quote calculator, zip-code service check, and booking form.",
    tags: ["React", "Tailwind CSS", "Formik", "Google Maps API", "Vite"],
    thumbnail: "/images/projects/dental-clinic-hero.webp",
    previewVideoUrl: "",
    liveDemoUrl: "https://example.com/demo/cleanpro",
    client: "CleanPro Residential & Commercial",
    duration: "10 Days",
    problem: "Prospective customers couldn't get a clear estimate without playing phone tag, leading to high lead drop-off and lost contract opportunities.",
    solution: "Engineered an interactive 4-step instant estimate calculator where clients choose bedroom/square footage specs and instantly reserve preferred cleaning crews.",
    features: [
      "Interactive 4-step pricing estimator based on room count and frequency",
      "Zip code verification checking immediate service radius availability",
      "Emergency same-day cleaning inquiry trigger with priority notification",
      "Transparent breakdown of green cleaning supplies and bonded crew guarantee",
      "Customer reviews widget with verified project photos"
    ],
    impactMetrics: [
      { label: "Qualified Leads", value: "+130%" },
      { label: "Quote Completion", value: "68%" },
      { label: "Phone Tag Reduced", value: "75%" }
    ],
    screenshots: [
      "/images/projects/dental-clinic-hero.webp"
    ]
  },
  {
    id: "edupath-academy",
    title: "EduPath Academy",
    category: "Business Website",
    description: "Coaching institute & learning hub web portal featuring comprehensive course curriculums, faculty bios, student enrollment, and fee calculator.",
    tags: ["React", "TypeScript", "Tailwind CSS", "PDF Export", "Responsive"],
    thumbnail: "/images/projects/saas-dashboard-hero.webp",
    previewVideoUrl: "",
    liveDemoUrl: "https://example.com/demo/edupath",
    client: "EduPath Learning Institute",
    duration: "2 Weeks",
    problem: "Parents and students struggled to understand admission criteria, syllabus schedules, and scholarship offerings on the academy's outdated portal.",
    solution: "Created an authoritative academic portal featuring downloadable syllabus PDFs, virtual open house signups, scholarship eligibility quizzes, and an online application form.",
    features: [
      "Searchable course catalog with syllabus milestones and prerequisite details",
      "Admission application wizard with document upload preview",
      "Scholarship calculator and flexible tuition installment estimator",
      "Faculty directory featuring research credentials and office hours",
      "Alumni university placement statistics with interactive infographic"
    ],
    impactMetrics: [
      { label: "Student Applications", value: "+95%" },
      { label: "Brochure Downloads", value: "2.8k+" },
      { label: "Parent Inquiries", value: "+74%" }
    ],
    screenshots: [
      "/images/projects/saas-dashboard-hero.webp"
    ]
  }
];

export const SERVICES: Service[] = [
  {
    id: "website-design-dev",
    title: "Website Design & Development",
    description: "High-performance, bespoke business websites engineered for fast load speeds, search visibility, and converting visitors into loyal clients.",
    iconName: "Globe",
    highlights: [
      "Custom responsive multi-page layout",
      "Mobile-first design for all device viewports",
      "Local SEO & structured schema integration",
      "Clean TypeScript & React codebase"
    ]
  },
  {
    id: "landing-page",
    title: "Landing Page Design",
    description: "High-converting single-page landing experiences built for marketing campaigns, product launches, event promotions, and lead generation.",
    iconName: "Rocket",
    highlights: [
      "Frictionless conversion & lead capture funnels",
      "A/B test ready section architecture",
      "Sub-second load times & Core Web Vitals optimization",
      "Analytics tracking & pixel integration"
    ]
  },
  {
    id: "booking-appointment",
    title: "Booking & Appointment Website",
    description: "Full-featured online scheduling platforms for clinics, salons, fitness studios, and consultants that eliminate phone tag and appointment no-shows.",
    iconName: "Calendar",
    highlights: [
      "Real-time calendar slot reservation engine",
      "Automated email & SMS confirmation alerts",
      "Practitioner / specialist selection flow",
      "Google & Outlook calendar two-way sync"
    ]
  },
  {
    id: "ecommerce-ui",
    title: "E-commerce UI Design",
    description: "Clean, frictionless shopping interfaces with modern catalog grids, quick-view modals, cart slide-outs, and streamlined checkout experiences.",
    iconName: "ShoppingBag",
    highlights: [
      "Responsive product catalogs with faceted filters",
      "Smooth cart drawer & quick-checkout UX",
      "Shopify & Stripe payment flow integration",
      "Wishlist management & inventory states"
    ]
  },
  {
    id: "saas-dashboard",
    title: "SaaS Dashboard UI",
    description: "Modern web application interfaces, admin consoles, and analytics dashboards with intuitive navigation, dark mode, and interactive charts.",
    iconName: "LayoutDashboard",
    highlights: [
      "Interactive data charts & tabular metric views",
      "Kanban workflow & task pipeline boards",
      "User role permission & team access layouts",
      "Keyboard shortcuts & WCAG accessibility"
    ]
  },
  {
    id: "logo-brand-identity",
    title: "Logo Design & Brand Identity",
    description: "Distinctive, memorable brand marks, cohesive visual systems, and mascot direction that make your business instantly recognizable and trusted.",
    iconName: "Palette",
    highlights: [
      "Primary, secondary & monogram logo variations",
      "Cohesive brand color palette & typography kit",
      "Vector SVG, PNG, and print-ready export files",
      "Brand style guide & mascot visual identity"
    ]
  },
  {
    id: "marketing-social-design",
    title: "Banner, Social Media & Marketing Design",
    description: "High-impact promotional graphics, ad banners, and branded social assets tailored to stop the scroll and drive clicks across all platforms.",
    iconName: "Megaphone",
    highlights: [
      "High-converting ad banners (Meta, Google, Display Ads)",
      "Cohesive social media post & story templates",
      "Email newsletter headers & promotional banners",
      "Product launch announcement graphic packages"
    ]
  },
  {
    id: "ai-image-video",
    title: "AI Image & AI Video Creation",
    description: "Cutting-edge AI-generated visual media and cinematic video content tailored for product visuals, social media content, ads, brand mascots, promotional videos, and website hero visuals.",
    iconName: "Video",
    highlights: [
      "Photorealistic product visuals & 3D renders",
      "Custom brand mascots & character assets",
      "Promotional videos & social media motion clips",
      "Website hero backgrounds & ad creative visuals"
    ]
  }
];

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery & Strategy",
    description: "We discuss your business model, target audience, competitors, and key objectives. We define clear website goals, wireframe layout blueprints, and map out the exact user flow.",
    iconName: "Compass",
    deliverables: ["Project roadmap", "Sitemap & wireframes", "Content structure guide"]
  },
  {
    step: "02",
    title: "Modern UI/UX Design",
    description: "I craft clean, intentional visual designs using Google AI Studio prototyping and Figma concepts. Every element is refined for typography balance, accessibility, and mobile elegance.",
    iconName: "Palette",
    deliverables: ["Figma / interactive prototype", "Design system & palette", "Client feedback revision"]
  },
  {
    step: "03",
    title: "Clean Frontend Development",
    description: "I build the site with React, TypeScript, and Tailwind CSS. The codebase is semantic, blazing-fast, mobile-responsive, and integrated with any required forms, APIs, or booking widgets.",
    iconName: "Code2",
    deliverables: ["Clean production code", "Cross-browser testing", "Speed & SEO optimization"]
  },
  {
    step: "04",
    title: "Launch & Support",
    description: "We deploy your project to high-performance hosting (Vercel, Netlify, Cloud Run), configure custom domain DNS, verify SSL certificates, and I provide 30 days of post-launch warranty support.",
    iconName: "CheckCircle2",
    deliverables: ["Live production deployment", "DNS & domain setup", "30-day warranty & guide"]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    role: "Founder & Lead Dentist",
    businessType: "BrightSmile Dental Practice",
    rating: 5,
    quote: "Happy Person transformed our chaotic phone booking system into an effortless online appointment portal. Our staff saves 15+ hours each week, and new patient bookings climbed by over 140% in just two months. Super friendly communication and delivered ahead of schedule.",
    avatar: "https://images.unsplash.com/photo-1594824813576-928d1f2bdf17?w=160&auto=format&fit=crop&q=80",
    location: "Austin, Texas"
  },
  {
    id: "2",
    name: "Marcus Vance",
    role: "Managing Director",
    businessType: "UrbanEats Hospitality Group",
    rating: 5,
    quote: "Our previous restaurant website was an ancient PDF link. Happy Person built us a stunning, moody website that showcases our evening dinner service and lets guests reserve tables in seconds. Friday and Saturday bookings are consistently packed thanks to this site.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
    location: "Denver, Colorado"
  },
  {
    id: "3",
    name: "Elena Rostova",
    role: "Principal Broker",
    businessType: "HomeNest Luxury Realty",
    rating: 5,
    quote: "In high-end real estate, presentation is everything. Happy Person delivered a fast, visually pristine property showcase with custom filter capabilities that rivals national brokerages. Working with this studio was collaborative, transparent, and entirely stress-free.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
    location: "Miami, Florida"
  }
];

export { PRICING_PLANS, ADDON_SERVICES, PRICING_DISCLAIMER_NOTE } from './pricingData';

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Who is Happy Person?",
    answer: "Happy Person is an independent creative web design and frontend studio. Founded on the belief that modern business websites should be friendly, fast, and high-converting, I work directly with clients to turn complex problems into clean, delightfully usable digital interfaces."
  },
  {
    question: "How long does a website take to build?",
    answer: "A focused high-converting landing page takes about 3 to 5 business days. A complete 5-page business website takes 1 to 2 weeks. More complex web applications, booking portals, or dashboard UIs take 2 to 4 weeks depending on specific features."
  },
  {
    question: "Can I update the website content myself after launch?",
    answer: "Yes! I structure content in clean, well-organized data files, markdown files, or headless CMS setups depending on your preference. I also provide a personalized video walkthrough showing you how to update text, photos, and services."
  },
  {
    question: "Do you provide domain and hosting setup?",
    answer: "Yes, I help you select, register, and connect your custom domain name (e.g., yourcompany.com) and deploy the website to reliable, fast, and cost-effective hosting platforms like Vercel, Netlify, or Google Cloud Run."
  },
  {
    question: "Can you add online booking or customer payments?",
    answer: "Absolutely. I integrate appointment scheduling engines (Calendly, custom calendar pickers, slot booking) as well as secure payment processing via Stripe, PayPal, or specialized booking software."
  },
  {
    question: "Do you provide support and maintenance after launch?",
    answer: "Every project comes with 14 to 60 days of complimentary post-launch warranty support to ensure everything operates smoothly. I also offer monthly maintenance retainers covering security audits, content updates, and ongoing optimizations."
  },
  {
    question: "How does Google AI Studio fit into your workflow?",
    answer: "I leverage Google AI Studio to accelerate prototyping, generate tailored design mockups, and architect robust frontend code in record time. This allows Happy Person to deliver agency-grade websites at independent studio agility with faster turnaround times for my clients."
  }
];
