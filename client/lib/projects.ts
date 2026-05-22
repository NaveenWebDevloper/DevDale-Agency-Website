export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  fullTitle: string;
  heroImage: string;
  url: string;
  client: {
    name: string;
    role: string;
    avatar: string;
  };
  about: string;
  hq: string;
  industry: string;
  companySize: string;
  challenge: string;
  approach: string;
  features: string[];
  results: string;
  services: string[];
}

export const projects: Project[] = [
  {
    id: "patents-planet",
    title: "Patents Planet",
    category: "Legal Tech",
    description: "Specialized USPTO-compliant technical drafting and patent illustration services.",
    image: "/projects/patentsplanet.png",
    fullTitle: "Precision Engineering Meet Legal Excellence: The Patents Planet Story",
    heroImage: "/projects/patentsplanet.png",
    url: "https://patentsplanet.com/",
    client: {
      name: "Kishore V",
      role: "CEO, Patents Planet",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya",
    },
    about: "Patents Planet is a premier service provider for inventors and law firms, specializing in high-precision patent drawings and technical illustrations that meet global IP standards including USPTO, EPO, and WIPO.",
    hq: "India / Remote",
    industry: "Intellectual Property / Legal Tech",
    companySize: "11-50 employees",
    challenge: "Creating intricate technical drawings that strictly adhere to complex international patent standards is a significant hurdle for inventors, often leading to costly rejections.",
    approach: "We implemented a rigorous multi-tier quality check process combined with expert draftsmen to ensure 100% compliance with patent office guidelines while maintaining rapid delivery cycles.",
    features: [
      "USPTO / WIPO Compliance",
      "Utility & Design Patent Drawings",
      "3D Modeling & Conversion",
      "Structural & Flow Diagrams",
    ],
    results: "Achieved a 99% acceptance rate across thousands of filings and established a global reputation for technical excellence.",
    services: ["Patent Illustration", "Technical Drafting", "IP Strategy Consultation"],
  },
  {
    id: "crop-plan",
    title: "CropPlan",
    category: "Agri-Tech",
    description: "Demand-based agricultural planning system to optimize production and reduce surplus.",
    image: "/projects/cropplanning.png",
    fullTitle: "Revolutionizing Agriculture: The Demand-Based Crop Planning System",
    heroImage: "/projects/cropplanning.png",
    url: "https://demand-based-crop-planning-system-3zqb.onrender.com/",
    client: {
      name: "Naveen Vadla",
      role: "Agri-Tech Strategist",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan",
    },
    about: "CropPlan is a sophisticated data-driven platform designed to align agricultural production with real-time market demand, preventing waste and stabilizing farmer incomes.",
    hq: "India",
    industry: "Agriculture / Supply Chain",
    companySize: "Strategic Initiative",
    challenge: "The agricultural sector frequently faces price fluctuations and massive waste due to a lack of synchronization between what is grown and what the market actually needs.",
    approach: "We built a multi-layered dashboard that aggregates market demand signals and provides farmers with actionable crop planning recommendations based on regional and seasonal data.",
    features: [
      "Market Demand Analytics",
      "Regional Crop Recommendations",
      "Production Lifecycle Tracking",
      "Multi-Language Accessibility",
    ],
    results: "Pilot testing showed a 30% reduction in seasonal surplus and a measurable increase in farmer profitability through better market integration.",
    services: ["Full Stack Development", "Data Analytics", "Agri-Business Consulting"],
  },
  {
    id: "vgs-global",
    title: "VGS Global",
    category: "Ed-Tech",
    description: "India's trusted study abroad consultancy — guiding students to UK, USA, Canada, Australia & beyond with a 98% visa success rate.",
    image: "/projects/vgsglobal.png",
    fullTitle: "Beyond Boundaries, Beyond Limits: The VGS Global Story",
    heroImage: "/projects/vgsglobal.png",
    url: "https://vgs-consultancy.vercel.app/",
    client: {
      name: "Vinitha Medisetti",
      role: "Founder, VGS Global",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VGS",
    },
    about: "VGS Global is India's premier study abroad consultancy, empowering students to achieve their international education dreams. With deep expertise across UK, USA, Canada, Ireland, Australia, Germany, France, and New Zealand, VGS Global provides end-to-end guidance — from course selection and university shortlisting to visa documentation and pre-departure support.",
    hq: "India",
    industry: "International Education / Study Abroad Consultancy",
    companySize: "11–50 employees",
    challenge: "Students aspiring to study abroad face a complex maze of university applications, documentation requirements, visa regulations, and financial planning — often leading to costly mistakes, rejections, and wasted opportunities without expert guidance.",
    approach: "We built a premium, conversion-focused web platform that showcases VGS Global's expertise across Study, Work, and Visit visa categories. The site features an animated loading experience, destination-specific landing pages, a success stories section, and an intuitive consultation booking flow — all wrapped in a bold, modern UI that builds instant trust.",
    features: [
      "Study, Work & Visit Visa Guidance",
      "University Shortlisting & Application Support",
      "98% Visa Approval Success Rate",
      "Scholarship & Education Loan Assistance",
      "8 Destination Countries Covered",
      "500+ Partner Institutes Globally",
    ],
    results: "VGS Global achieved a 98% visa success rate across thousands of student applications, established partnerships with 500+ international institutes, and built a reputation as India's most trusted study abroad expert.",
    services: ["Web Design & Development", "Brand Strategy", "Conversion Optimisation", "SEO"],
  },
];


