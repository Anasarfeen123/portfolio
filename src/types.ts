export interface PersonalInfo {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  summary: string;
  creative_summary: string;
  fun_facts: string[];
  interests: string[];
}

export interface SkillsData {
  languages: string[];
  ai_ml: string[];
  tools: string[];
  competencies: string[];
}

export interface ExperienceItem {
  organization: string;
  role: string;
  duration: string;
  description: string[];
}

export interface ProjectItem {
  title: string;
  technologies: string[];
  description: string[];
}

export interface PortfolioData {
  personal: PersonalInfo;
  education: {
    institution: string;
    location: string;
    degree: string;
    duration: string;
  }[];
  skills: SkillsData;
  experience: ExperienceItem[];
  projects: ProjectItem[];
}
