import { 
  CVData, 
  HeaderContent,
  ExperienceContent,
  EducationContent,
  SkillContent,
  ProjectContent,
  LanguageContent,
  CustomContent
} from '@/lib/types';

/**
 * Sample data for Modern Professional template
 * This data serves as a preview and starting point for users
 */
export const MODERN_SAMPLE_DATA: CVData = {
  template_id: 'c24aa22b-194a-404a-a9d4-9626e58b8f7b',
  settings: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 'medium',
    primaryColor: '#1f2937',
    secondaryColor: '#6b7280',
      labels: {
        present: 'Present',
        contact: 'Contact',
      },
  },
  sections: [
    {
      id: '1',
      cv_id: 'sample',
      section_type: 'header',
      title: 'Header',
      items: [
        {
          id: 'h1',
          section_id: '1',
          content: {
            full_name: 'Emma Thompson',
            title: 'Operations Manager',
            email: 'emma.thompson@opsmail.com',
            phone: '+1 (555) 123-4567',
            location: 'Seattle, WA',
            linkedin: 'linkedin.com/in/emmathompson-ops',
            website: 'emmathompson.pro',
            photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmmaThompson',
            summary: 'Operations manager with 9+ years leading cross-functional process optimization, vendor governance, and KPI-driven execution for fast-growing service businesses.',
          } as HeaderContent,
        },
      ],
    },
    {
      id: '2',
      cv_id: 'sample',
      section_type: 'experience',
      title: 'Professional Experience',
      items: [
        {
          id: 'e1',
          section_id: '2',
          content: {
            company: 'Northline Logistics Group',
            role: 'Operations Manager',
            location: 'Seattle, WA',
            start_date: '2020-01',
            is_current: true,
            description: '<p>Led daily operations for a regional delivery network with 120+ staff and 4 distribution hubs.</p><ul><li>Standardized SOPs across hubs and reduced dispatch errors by 32%</li><li>Introduced KPI dashboard for SLA tracking and workforce allocation</li></ul>',
          } as ExperienceContent,
        },
        {
          id: 'e2',
          section_id: '2',
          content: {
            company: 'Blue Harbor Services',
            role: 'Process Improvement Specialist',
            location: 'Portland, OR',
            start_date: '2017-06',
            end_date: '2019-12',
            description: '<p>Improved service-delivery workflows and partnered with finance/procurement to lower operating costs.</p>',
            highlights: [
              'Mapped and redesigned onboarding process, reducing cycle time by 22%',
              'Built reporting templates for weekly operational reviews',
              'Coordinated vendor performance scorecards and contract renewals',
            ],
          } as ExperienceContent,
        },
      ],
    },
    {
      id: '3',
      cv_id: 'sample',
      section_type: 'education',
      title: 'Education',
      items: [
        {
          id: 'ed1',
          section_id: '3',
          content: {
            institution: 'University of Washington',
            degree: 'Bachelor of Business Administration',
            field_of_study: 'Operations & Supply Chain Management',
            location: 'Seattle, WA',
            start_date: '2013',
            end_date: '2017',
            gpa: '3.8/4.0',
            achievements: [
              'Dean\'s List (5 semesters)',
              'Capstone project on last-mile logistics optimization',
            ],
          } as EducationContent,
        },
      ],
    },
    {
      id: '4',
      cv_id: 'sample',
      section_type: 'skills',
      title: 'Core Competencies',
      items: [
        {
          id: 's1',
          section_id: '4',
          content: { name: 'Process Optimization', level: 'Expert', category: 'Operations' } as SkillContent,
        },
        {
          id: 's2',
          section_id: '4',
          content: { name: 'SLA Management', level: 'Advanced', category: 'Operations' } as SkillContent,
        },
        {
          id: 's3',
          section_id: '4',
          content: { name: 'Vendor Management', level: 'Advanced', category: 'Stakeholder' } as SkillContent,
        },
        {
          id: 's4',
          section_id: '4',
          content: { name: 'Power BI', level: 'Intermediate', category: 'Analytics' } as SkillContent,
        },
        {
          id: 's5',
          section_id: '4',
          content: { name: 'Lean Six Sigma', level: 'Advanced', category: 'Quality' } as SkillContent,
        },
        {
          id: 's6',
          section_id: '4',
          content: { name: 'Budget Tracking', level: 'Intermediate', category: 'Finance' } as SkillContent,
        },
        {
          id: 's7',
          section_id: '4',
          content: { name: 'Change Management', level: 'Advanced', category: 'Leadership' } as SkillContent,
        },
      ],
    },
    {
      id: '5',
      cv_id: 'sample',
      section_type: 'projects',
      title: 'Notable Projects',
      items: [
        {
          id: 'p1',
          section_id: '5',
          content: {
            name: 'Regional Fulfillment Optimization Program',
            role: 'Program Lead',
            start_date: '2022',
            description: 'Redesigned dispatch-routing and shift-planning model across 4 hubs, improving on-time delivery and lowering overtime costs.',
            technologies: ['Power BI', 'Excel', 'SOP Toolkit', 'KPI Dashboard'],
            url: 'https://case-study.example.com/ops-optimization',
          } as ProjectContent,
        },
      ],
    },
    {
      id: '6',
      cv_id: 'sample',
      section_type: 'languages',
      title: 'Languages',
      items: [
        {
          id: 'l1',
          section_id: '6',
          content: { name: 'English', proficiency: 'Native' } as LanguageContent,
        },
        {
          id: 'l2',
          section_id: '6',
          content: { name: 'Spanish', proficiency: 'Intermediate' } as LanguageContent,
        },
      ],
    },
    {
      id: '7',
      cv_id: 'sample',
      section_type: 'custom',
      title: 'Additional Information',
      items: [
        {
          id: 'cu1',
          section_id: '7',
          content: { 
            label: 'Certifications', 
            value: 'Lean Six Sigma Green Belt (IASSC), Certified in Supply Chain Analytics (2025).' 
          } as CustomContent,
        },
        {
          id: 'cu2',
          section_id: '7',
          content: { 
            label: 'Awards', 
            value: 'Operational Excellence Award 2024 - Northline Logistics Group.' 
          } as CustomContent,
        },
      ],
    },
  ],
};

/**
 * Sample data for The Classic Split template
 */
export const CLASSIC_SPLIT_SAMPLE_DATA: CVData = {
  template_id: '7c8883a7-d0c9-435a-a8c8-9aa75d1f1165',
  settings: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 'medium',
    primaryColor: '#2f3a46',
    secondaryColor: '#cfd8dc',
      labels: {
        present: 'Present',
        contact: 'Contact',
      },
  },
  sections: [
    {
      id: 'c1',
      cv_id: 'sample',
      section_type: 'header',
      title: 'Header',
      items: [
        {
          id: 'ch1',
          section_id: 'c1',
          content: {
            full_name: 'Daniel Kim',
            title: 'Financial Planning & Analysis Manager',
            email: 'daniel.kim@financepro.com',
            phone: '+1 (555) 123-4567',
            location: 'Chicago, IL',
            website: 'www.danielkim-fpa.com',
            linkedin: 'linkedin.com/in/danielkim-fpa',
            photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanielKim',
            summary: 'FP&A leader with 10+ years of experience in forecasting, margin analysis, and executive reporting for multi-entity organizations.',
          } as HeaderContent,
        },
      ],
    },
    {
      id: 'c2',
      cv_id: 'sample',
      section_type: 'experience',
      title: 'Experience',
      items: [
        {
          id: 'ce1',
          section_id: 'c2',
          content: {
            company: 'Vertex Consumer Brands',
            role: 'FP&A Manager',
            location: 'Chicago, IL',
            start_date: '2022',
            end_date: '2025',
            description: '<p>Owned annual budget cycle and rolling forecasts for 3 business units totaling $120M in revenue.</p>',
          } as ExperienceContent,
        },
        {
          id: 'ce2',
          section_id: 'c2',
          content: {
            company: 'Apex Distribution',
            role: 'Senior Financial Analyst',
            location: 'Milwaukee, WI',
            start_date: '2020',
            end_date: '2022',
            description: '<p>Built profitability models and pricing scenarios to support regional expansion decisions.</p>',
          } as ExperienceContent,
        },
      ],
    },
    {
      id: 'c3',
      cv_id: 'sample',
      section_type: 'education',
      title: 'Education',
      items: [
        {
          id: 'ced1',
          section_id: 'c3',
          content: {
            institution: 'University of Illinois Urbana-Champaign',
            degree: 'Master of Science',
            field_of_study: 'Finance',
            start_date: '2018',
            end_date: '2020',
            location: 'Urbana, IL',
          } as EducationContent,
        },
        {
          id: 'ced2',
          section_id: 'c3',
          content: {
            institution: 'University of Wisconsin-Madison',
            degree: 'Bachelor of Business Administration',
            field_of_study: 'Accounting',
            start_date: '2014',
            end_date: '2018',
            location: 'Madison, WI',
          } as EducationContent,
        },
      ],
    },
    {
      id: 'c4',
      cv_id: 'sample',
      section_type: 'skills',
      title: 'Expertise',
      items: [
        {
          id: 'cs1',
          section_id: 'c4',
          content: { name: 'Financial Forecasting', level: 'Expert', category: 'Planning' } as SkillContent,
        },
        {
          id: 'cs2',
          section_id: 'c4',
          content: { name: 'Budgeting', level: 'Advanced', category: 'Planning' } as SkillContent,
        },
        {
          id: 'cs3',
          section_id: 'c4',
          content: { name: 'Variance Analysis', level: 'Expert', category: 'Analysis' } as SkillContent,
        },
        {
          id: 'cs4',
          section_id: 'c4',
          content: { name: 'Power BI', level: 'Advanced', category: 'Analysis' } as SkillContent,
        },
        {
          id: 'cs5',
          section_id: 'c4',
          content: { name: 'SQL', level: 'Intermediate', category: 'Data' } as SkillContent,
        },
        {
          id: 'cs6',
          section_id: 'c4',
          content: { name: 'Executive Reporting', level: 'Advanced', category: 'Communication' } as SkillContent,
        },
      ],
    },
    {
      id: 'c5',
      cv_id: 'sample',
      section_type: 'languages',
      title: 'Language',
      items: [
        {
          id: 'cl1',
          section_id: 'c5',
          content: { name: 'English', proficiency: 'Native' } as LanguageContent,
        },
        {
          id: 'cl2',
          section_id: 'c5',
          content: { name: 'Spanish', proficiency: 'Intermediate' } as LanguageContent,
        },
      ],
    },
    {
      id: 'c6',
      cv_id: 'sample',
      section_type: 'custom',
      title: 'Reference',
      items: [
        {
          id: 'cc1',
          section_id: 'c6',
          content: { label: 'CFA Program', value: 'CFA Level II Candidate (2026) • Advanced Financial Modeling Certificate (CFI).' } as CustomContent,
        },
        {
          id: 'cc2',
          section_id: 'c6',
          content: { label: 'Notable Impact', value: 'Delivered forecast accuracy improvement from 82% to 93% in FY2025 planning cycle.' } as CustomContent,
        },
      ],
    },
  ],
};

/**
 * Sample data for Tech Terminal template
 */
export const TECH_TERMINAL_SAMPLE_DATA: CVData = {
  template_id: 'd0535d74-e3cb-453d-b4fb-224ed0084632',
  settings: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 'medium',
    primaryColor: '#22c55e',
    secondaryColor: '#0f172a',
    labels: {
      present: 'Present',
      contact: 'Contact',
    },
  },
  sections: [
    {
      id: 't1',
      cv_id: 'sample',
      section_type: 'header',
      title: 'Header',
      items: [
        {
          id: 'th1',
          section_id: 't1',
          content: {
            full_name: 'Nguyen Terminal',
            title: 'Backend Engineer',
            email: 'terminal@dev.io',
            phone: '+84 123 456 789',
            location: 'Ho Chi Minh City, VN',
            website: 'terminal.dev',
            github: 'github.com/terminaldev',
            summary: 'Focused on APIs, databases, and scalable systems. Love clean logs and clean code.',
          } as HeaderContent,
        },
      ],
    },
    {
      id: 't2',
      cv_id: 'sample',
      section_type: 'experience',
      title: 'Experience',
      items: [
        {
          id: 'te1',
          section_id: 't2',
          content: {
            company: 'CodeOps Studio',
            role: 'Backend Engineer',
            location: 'Remote',
            start_date: '2022',
            is_current: true,
            description: 'Built high-throughput services and optimized queries for production scale.',
            highlights: [
              'Designed auth & rate limiting pipelines',
              'Improved API latency by 35%'
            ],
          } as ExperienceContent,
        },
      ],
    },
    {
      id: 't3',
      cv_id: 'sample',
      section_type: 'education',
      title: 'Education',
      items: [
        {
          id: 'te2',
          section_id: 't3',
          content: {
            institution: 'Tech University',
            degree: 'B.Sc. Computer Science',
            field_of_study: 'Software Engineering',
            start_date: '2017',
            end_date: '2021',
          } as EducationContent,
        },
      ],
    },
    {
      id: 't4',
      cv_id: 'sample',
      section_type: 'skills',
      title: 'Skills',
      items: [
        { id: 'ts1', section_id: 't4', content: { name: 'Node.js', level: 'Advanced' } as SkillContent },
        { id: 'ts2', section_id: 't4', content: { name: 'PostgreSQL', level: 'Advanced' } as SkillContent },
        { id: 'ts3', section_id: 't4', content: { name: 'Redis', level: 'Intermediate' } as SkillContent },
      ],
    },
    {
      id: 't5',
      cv_id: 'sample',
      section_type: 'projects',
      title: 'Projects',
      items: [
        {
          id: 'tp1',
          section_id: 't5',
          content: {
            name: 'LogStream',
            role: 'Creator',
            description: 'Terminal-friendly log viewer with filters and alerts.',
            technologies: ['Node.js', 'PostgreSQL'],
            github_url: 'https://github.com/terminaldev/logstream',
          } as ProjectContent,
        },
      ],
    },
    {
      id: 't6',
      cv_id: 'sample',
      section_type: 'languages',
      title: 'Languages',
      items: [
        { id: 'tl1', section_id: 't6', content: { name: 'English', proficiency: 'Fluent' } as LanguageContent },
        { id: 'tl2', section_id: 't6', content: { name: 'Vietnamese', proficiency: 'Native' } as LanguageContent },
      ],
    },
  ],
};

/**
 * Sample data for Electric Gradient template
 */
export const ELECTRIC_GRADIENT_SAMPLE_DATA: CVData = {
  template_id: 'b043cc09-d9e3-4579-a08c-c7eaac82b26b',
  settings: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 'medium',
    primaryColor: '#2563eb',
    secondaryColor: '#ec4899',
    labels: {
      present: 'Present',
      contact: 'Contact',
    },
  },
  sections: [
    {
      id: 'eg1',
      cv_id: 'sample',
      section_type: 'header',
      title: 'Header',
      items: [
        {
          id: 'egh1',
          section_id: 'eg1',
          content: {
            full_name: 'Alex Rivera',
            title: 'Creative Product Designer',
            email: 'alex@electric.design',
            phone: '+1 (555) 332-1199',
            location: 'New York, NY',
            linkedin: 'linkedin.com/in/alexrivera',
            github: 'github.com/alexrivera',
            website: 'alexrivera.design',
            photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexRivera',
            summary: 'Designer focused on bold digital experiences with strong conversion outcomes. 6+ years turning product strategy into polished interfaces for SaaS and consumer apps.',
          } as HeaderContent,
        },
      ],
    },
    {
      id: 'eg2',
      cv_id: 'sample',
      section_type: 'experience',
      title: 'Experience',
      items: [
        {
          id: 'ege1',
          section_id: 'eg2',
          content: {
            company: 'Pulse Interactive',
            role: 'Senior Product Designer',
            location: 'Remote',
            start_date: '2022-03',
            is_current: true,
            description: '<p>Led redesign of growth funnel and onboarding journey for a B2B analytics product.</p>',
            highlights: [
              'Improved activation rate by 28% through UX simplification',
              'Built design system with 70+ reusable components',
            ],
          } as ExperienceContent,
        },
        {
          id: 'ege2',
          section_id: 'eg2',
          content: {
            company: 'Glow Labs',
            role: 'UI/UX Designer',
            location: 'Los Angeles, CA',
            start_date: '2019-01',
            end_date: '2022-02',
            description: '<p>Designed mobile-first experiences and collaborated with PM/Engineering to launch 3 major releases.</p>',
          } as ExperienceContent,
        },
      ],
    },
    {
      id: 'eg3',
      cv_id: 'sample',
      section_type: 'education',
      title: 'Education',
      items: [
        {
          id: 'eged1',
          section_id: 'eg3',
          content: {
            institution: 'Parsons School of Design',
            degree: 'BFA Interaction Design',
            location: 'New York, NY',
            start_date: '2014',
            end_date: '2018',
          } as EducationContent,
        },
      ],
    },
    {
      id: 'eg4',
      cv_id: 'sample',
      section_type: 'skills',
      title: 'Core Skills',
      items: [
        { id: 'egs1', section_id: 'eg4', content: { name: 'Figma', level: 'Expert', category: 'Design' } as SkillContent },
        { id: 'egs2', section_id: 'eg4', content: { name: 'Prototyping', level: 'Advanced', category: 'Design' } as SkillContent },
        { id: 'egs3', section_id: 'eg4', content: { name: 'Design Systems', level: 'Advanced', category: 'Design Ops' } as SkillContent },
        { id: 'egs4', section_id: 'eg4', content: { name: 'User Research', level: 'Advanced', category: 'Strategy' } as SkillContent },
        { id: 'egs5', section_id: 'eg4', content: { name: 'A/B Testing', level: 'Intermediate', category: 'Strategy' } as SkillContent },
      ],
    },
    {
      id: 'eg5',
      cv_id: 'sample',
      section_type: 'projects',
      title: 'Featured Projects',
      items: [
        {
          id: 'egp1',
          section_id: 'eg5',
          content: {
            name: 'Neon Commerce Suite',
            role: 'Lead Product Designer',
            start_date: '2024',
            end_date: '2025',
            description: 'Multi-store eCommerce dashboard with configurable widgets, campaign automation, and conversion insights.',
            technologies: ['Figma', 'React', 'Storybook', 'Mixpanel'],
          } as ProjectContent,
        },
      ],
    },
    {
      id: 'eg6',
      cv_id: 'sample',
      section_type: 'languages',
      title: 'Languages',
      items: [
        { id: 'egl1', section_id: 'eg6', content: { name: 'English', proficiency: 'Fluent' } as LanguageContent },
        { id: 'egl2', section_id: 'eg6', content: { name: 'Spanish', proficiency: 'Professional' } as LanguageContent },
      ],
    },
    {
      id: 'eg7',
      cv_id: 'sample',
      section_type: 'custom',
      title: 'Highlights',
      items: [
        {
          id: 'egc1',
          section_id: 'eg7',
          content: {
            label: 'Awards',
            value: 'Top 30 Product Designers 2025 - UX Collective',
          } as CustomContent,
        },
      ],
    },
  ],
};

/**
 * Sample data for Neon Pulse template
 */
export const NEON_PULSE_SAMPLE_DATA: CVData = {
  template_id: 'ffa13d75-13e4-47c2-a583-5b988f43650a',
  settings: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 'medium',
    primaryColor: '#22c55e',
    secondaryColor: '#ec4899',
    labels: {
      present: 'Present',
      contact: 'Contact',
    },
  },
  sections: [
    {
      id: 'np1',
      cv_id: 'sample',
      section_type: 'header',
      title: 'Header',
      items: [
        {
          id: 'nph1',
          section_id: 'np1',
          content: {
            full_name: 'Linh Tran',
            title: 'Growth Marketing Specialist',
            email: 'linh@growthpulse.io',
            phone: '+84 933 112 889',
            location: 'Da Nang, Vietnam',
            linkedin: 'linkedin.com/in/linh-growth',
            website: 'linhgrowth.me',
            photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LinhTran',
            summary: 'Growth marketer focused on lifecycle automation, paid channels, and conversion optimization for SaaS and eCommerce brands.',
          } as HeaderContent,
        },
      ],
    },
    {
      id: 'np2',
      cv_id: 'sample',
      section_type: 'experience',
      title: 'Experience',
      items: [
        {
          id: 'npe1',
          section_id: 'np2',
          content: {
            company: 'BrightWave Commerce',
            role: 'Growth Marketing Specialist',
            location: 'Remote',
            start_date: '2023-01',
            is_current: true,
            description: '<p>Owned multi-channel demand generation strategy across paid search, email, and affiliate partnerships.</p>',
            highlights: [
              'Increased qualified leads by 41% YoY through campaign segmentation',
              'Reduced CAC by 23% by optimizing landing-page funnels and creative testing',
            ],
          } as ExperienceContent,
        },
        {
          id: 'npe2',
          section_id: 'np2',
          content: {
            company: 'VietMarket Agency',
            role: 'Digital Marketing Executive',
            location: 'Ho Chi Minh City, Vietnam',
            start_date: '2020-04',
            end_date: '2022-12',
            description: '<p>Executed full-funnel campaigns and coordinated with content/design teams for weekly launch cycles.</p>',
          } as ExperienceContent,
        },
      ],
    },
    {
      id: 'np3',
      cv_id: 'sample',
      section_type: 'education',
      title: 'Education',
      items: [
        {
          id: 'nped1',
          section_id: 'np3',
          content: {
            institution: 'University of Economics Ho Chi Minh City',
            degree: 'B.A. Marketing',
            location: 'Ho Chi Minh City, Vietnam',
            start_date: '2016',
            end_date: '2020',
          } as EducationContent,
        },
      ],
    },
    {
      id: 'np4',
      cv_id: 'sample',
      section_type: 'skills',
      title: 'Growth Stack',
      items: [
        { id: 'nps1', section_id: 'np4', content: { name: 'Google Ads', level: 'Expert', category: 'Paid Media' } as SkillContent },
        { id: 'nps2', section_id: 'np4', content: { name: 'Meta Ads', level: 'Advanced', category: 'Paid Media' } as SkillContent },
        { id: 'nps3', section_id: 'np4', content: { name: 'Email Automation', level: 'Advanced', category: 'Lifecycle' } as SkillContent },
        { id: 'nps4', section_id: 'np4', content: { name: 'GA4', level: 'Advanced', category: 'Analytics' } as SkillContent },
        { id: 'nps5', section_id: 'np4', content: { name: 'A/B Testing', level: 'Advanced', category: 'Optimization' } as SkillContent },
      ],
    },
    {
      id: 'np5',
      cv_id: 'sample',
      section_type: 'projects',
      title: 'Projects',
      items: [
        {
          id: 'npp1',
          section_id: 'np5',
          content: {
            name: 'Retention Booster Program',
            role: 'Campaign Lead',
            start_date: '2024',
            end_date: '2025',
            description: 'A multi-touch lifecycle campaign system that improved 90-day retention for trial users via behavior-based messaging.',
            technologies: ['HubSpot', 'GA4', 'Looker Studio', 'Meta Ads'],
          } as ProjectContent,
        },
      ],
    },
    {
      id: 'np6',
      cv_id: 'sample',
      section_type: 'languages',
      title: 'Languages',
      items: [
        { id: 'npl1', section_id: 'np6', content: { name: 'Vietnamese', proficiency: 'Native' } as LanguageContent },
        { id: 'npl2', section_id: 'np6', content: { name: 'English', proficiency: 'Fluent' } as LanguageContent },
      ],
    },
    {
      id: 'np7',
      cv_id: 'sample',
      section_type: 'custom',
      title: 'Highlights',
      items: [
        {
          id: 'npc1',
          section_id: 'np7',
          content: {
            label: 'Recognition',
            value: 'Top Performer Award 2025 for Product UX Delivery',
          } as CustomContent,
        },
      ],
    },
  ],
};

/**
 * Sample data for The Scholar Elite template
 */
export const SCHOLAR_ELITE_SAMPLE_DATA: CVData = {
  template_id: '7a24c891-6f61-44c7-be80-34c84372e387',
  settings: {
    fontFamily: 'Inter, sans-serif',
    headingFontFamily: 'Crimson Text, serif',
    fontSize: 'medium',
    baseFontPt: 11,
    primaryColor: '#002147',
    secondaryColor: '#546E7A',
    spacing: '1.5',
    labels: {
      present: 'Present',
      contact: 'Contact',
    },
  },
  sections: [
    {
      id: 'se1',
      cv_id: 'sample',
      section_type: 'header',
      title: 'Header',
      items: [
        {
          id: 'seh1',
          section_id: 'se1',
          content: {
            full_name: 'Nguyen Minh An',
            title: 'Final-year Computer Science Student',
            email: 'minhan.research@uni.edu',
            phone: '+84 912 345 678',
            location: 'Hanoi, Vietnam',
            linkedin: 'linkedin.com/in/nguyenminhan',
            github: 'github.com/minhan-research',
            website: 'scholar.minhan.dev',
            summary: 'Research-oriented student interested in trustworthy AI and human-centered systems. Seeking scholarship and research assistant opportunities in machine learning and data-driven social impact.',
          } as HeaderContent,
        },
      ],
    },
    {
      id: 'se2',
      cv_id: 'sample',
      section_type: 'education',
      title: 'Education',
      items: [
        {
          id: 'seed1',
          section_id: 'se2',
          content: {
            institution: 'Vietnam National University',
            degree: 'B.Sc. in Computer Science',
            field_of_study: 'Artificial Intelligence',
            location: 'Hanoi, Vietnam',
            start_date: '2021',
            end_date: '2026',
            gpa: '3.82/4.00',
            description: 'Thesis: Interpretable Graph Neural Networks for Early Risk Detection. Advisor: Dr. Tran Quoc Bao.',
            achievements: ['Machine Learning', 'Statistical Inference', 'Natural Language Processing', 'Advanced Algorithms'],
          } as EducationContent,
        },
      ],
    },
    {
      id: 'se3',
      cv_id: 'sample',
      section_type: 'experience',
      title: 'Research Experience',
      items: [
        {
          id: 'see1',
          section_id: 'se3',
          content: {
            company: 'Intelligent Systems Lab',
            role: 'Research Assistant',
            location: 'Hanoi, Vietnam',
            start_date: '2024-03',
            is_current: true,
            description: '<p>Methodology: built an experimental pipeline combining graph embeddings and active learning for noisy datasets. Outcome: improved F1-score by 11% against baseline in low-resource settings.</p>',
            highlights: [
              'Designed reproducible experiments with versioned datasets and model checkpoints',
              'Co-authored internal technical report for scholarship selection committee',
            ],
          } as ExperienceContent,
        },
        {
          id: 'see2',
          section_id: 'se3',
          content: {
            company: 'Data Science Teaching Lab',
            role: 'Teaching Assistant (Machine Learning)',
            location: 'Hanoi, Vietnam',
            start_date: '2023-09',
            end_date: '2024-02',
            description: '<p>Methodology: delivered guided coding sessions and rubric-based feedback. Outcome: average assignment completion increased from 78% to 92%.</p>',
            highlights: [
              'Prepared tutorial materials on model evaluation and error analysis',
              'Mentored 40+ students on research writing and reproducibility practices',
            ],
          } as ExperienceContent,
        },
      ],
    },
    {
      id: 'se4',
      cv_id: 'sample',
      section_type: 'custom',
      title: 'Publications & Awards',
      items: [
        {
          id: 'sec1',
          section_id: 'se4',
          content: {
            label: 'Journal Paper',
            value: '<strong>Nguyen, M. A.</strong>, Tran, Q. B. (2025). Robust Node Classification in Noisy Graphs. <em>Journal of Applied AI Research</em>, 12(3), 101-118.',
          } as CustomContent,
        },
        {
          id: 'sec2',
          section_id: 'se4',
          content: {
            label: 'International Conference',
            value: '<strong>Nguyen, M. A.</strong> et al. (2024). Human-Centered Evaluation for Educational Recommenders. In <em>Proceedings of IEEE ICTC</em>.',
          } as CustomContent,
        },
        {
          id: 'sec3',
          section_id: 'se4',
          content: {
            label: 'Scholarship',
            value: 'Merit Scholarship for Academic Excellence (Top 5% cohort), 2023-2025.',
          } as CustomContent,
        },
      ],
    },
    {
      id: 'se5',
      cv_id: 'sample',
      section_type: 'skills',
      title: 'Professional Skills',
      items: [
        { id: 'ses1', section_id: 'se5', content: { name: 'Python', level: 'Advanced', category: 'Programming' } as SkillContent },
        { id: 'ses2', section_id: 'se5', content: { name: 'R', level: 'Intermediate', category: 'Programming' } as SkillContent },
        { id: 'ses3', section_id: 'se5', content: { name: 'PyTorch', level: 'Advanced', category: 'Research Tools' } as SkillContent },
        { id: 'ses4', section_id: 'se5', content: { name: 'LaTeX', level: 'Advanced', category: 'Research Tools' } as SkillContent },
        { id: 'ses5', section_id: 'se5', content: { name: 'Academic Writing', level: 'Expert', category: 'Communication' } as SkillContent },
      ],
    },
  ],
};

/**
 * Add more template sample data here as you create new templates
 * Example:
 * 
 * export const CLASSIC_SAMPLE_DATA: CVData = { ... };
 * export const CREATIVE_SAMPLE_DATA: CVData = { ... };
 */
