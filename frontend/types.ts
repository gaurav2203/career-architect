export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    website: string;
  };
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    details: string[];
  }[];
  education: {
    degree: string;
    school: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
  }[];
  projects: {
    name: string;
    description: string;
    tech: string[];
    link: string;
  }[];
  certificates: {
    name: string;
    description: string;
    issuer: string;
    validTill: string;
    link: string;
  }[];
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  RESUME = 'resume',
  PORTFOLIO = 'portfolio',
  COVER_LETTER = 'cover-letter',
  EMAIL = 'email',
}
