export interface WebsiteMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
}

export interface DesignAnalysis {
  screenshot?: string;
  colorPalette: string[];
  colorScore: number;
  hasAnimations: boolean;
  hasParallax: boolean;
  hasCustomFonts: boolean;
  hasGradient: boolean;
  hasDarkMode: boolean;
}

export interface TechStack {
  frameworks: string[];
  libraries: string[];
  analytics: string[];
  hosting: string[];
  cdn: string[];
  modernFrameworks: string[];
}

export interface DomainInfo {
  domain: string;
  tld: string;
  age: number;
  registrar: string;
  createdDate: string;
  expiresDate: string;
  isPopularTld: boolean;
  isNew: boolean;
  isExpiringSoon: boolean;
  hasHttps: boolean;
  hasWww: boolean;
  subdomainCount: number;
  score: number;
  roasts: string[];
  compliments: string[];
  suggestions: string[];
}

export interface BoujeeAnalysis {
  url: string;
  domain: string;
  score: number;
  level: BoujeeLevel;
  grades: {
    performance: string;
    accessibility: string;
    bestPractices: string;
    seo: string;
  };
  metrics: WebsiteMetrics;
  design: DesignAnalysis;
  tech: TechStack;
  domainInfo: DomainInfo;
  roasts: {
    performance: string[];
    design: string[];
    mobile: string[];
    seo: string[];
    overall: string[];
    compliments: string[];
  };
  recommendations: string[];
}

export type BoujeeLevel = 
  | "BASIC" 
  | "MEH" 
  | "DECENT" 
  | "BOUJEE" 
  | "EXTRA BOUJEE" 
  | "JEFF BEZOS LEVEL";