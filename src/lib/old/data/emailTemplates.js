export const emailTemplates = {
  biased: {
    category: "Biased Examples",
    description: "Sample emails containing various types of bias",
    templates: [
      {
        id: "biased-1",
        title: "Gender Bias - Tech Role",
        category: "Gender Bias",
        severity: "High",
        content: `Subject: Software Engineer Position - TechCorp

Dear Sir,

TechCorp is pleased to announce openings for Software Engineer positions.

We are looking for talented young men who can handle the demanding nature of this role. The ideal candidate should be aggressive in problem-solving and comfortable working late nights without family obligations.

He should demonstrate strong leadership qualities and have a commanding presence in team meetings. The candidate must be willing to travel extensively without domestic constraints.

Requirements:
- Male candidates preferred
- Must be single or without family responsibilities
- Aggressive communication style
- Authoritative personality

Interested gentlemen may apply.

Best regards,
HR Team - TechCorp`,
        expectedBias: ["gender_bias"],
        tags: ["tech", "software", "male-coded"],
        learningPoint: "Uses exclusively masculine pronouns, male-coded language (aggressive, commanding), and discriminates based on marital status."
      },
      
      {
        id: "biased-2",
        title: "Department Discrimination - Severe",
        category: "Department Discrimination",
        severity: "High",
        content: `Subject: Data Analyst Role - Analytics Plus

Dear Students,

Analytics Plus invites applications for Data Analyst positions.

STRICT ELIGIBILITY:
- Only CS, IT, and ECE students can apply
- Mechanical, Civil, Chemical, Biotech students are NOT ELIGIBLE
- Even with relevant coursework or certifications, branch restriction applies

We do not accept applications from non-technical branches under any circumstances. Students from Mathematics, Statistics, or other branches with programming knowledge should not apply.

This is a firm policy and no exceptions will be made regardless of skills or experience.

Only shortlisted branches should submit applications.

Analytics Plus Recruitment`,
        expectedBias: ["department_discrimination"],
        tags: ["analytics", "branch-restriction", "rigid"],
        learningPoint: "Explicit branch discrimination that ignores actual skills and relevant coursework from other disciplines."
      },

      {
        id: "biased-3",
        title: "Socioeconomic Barriers - Multiple",
        category: "Socioeconomic Bias",
        severity: "High",
        content: `Subject: Management Trainee - Premium Financial Services

Dear Students,

Premium Financial Services is hiring Management Trainees.

ELIGIBILITY REQUIREMENTS:
- Residence: AC Hostels A, B, C only (Non-AC hostel students not eligible)
- Education: CBSE/ICSE background mandatory (State board excluded)
- Training Bond: ₹75,000 deposit (non-refundable)
- Transportation: Must own personal four-wheeler
- Technology: Must own MacBook or premium laptop (minimum ₹80,000 value)
- Accommodation: Should have permanent address in metro cities only

Students meeting ALL criteria should apply with:
- Recent passport-size photograph
- Aadhaar card copy
- Father's occupation details
- Family income proof

Only candidates from established business families will be prioritized.

Regards,
Premium Financial Services`,
        expectedBias: ["socioeconomic_bias", "caste_community_indicators"],
        tags: ["financial", "wealth-based", "exclusive"],
        learningPoint: "Multiple financial barriers: high deposit, vehicle ownership, expensive equipment, premium hostel requirement, and indirect family background checks."
      },

      {
        id: "biased-4",
        title: "Academic Elitism - Extreme",
        category: "Academic Elitism",
        severity: "High",
        content: `Subject: Research Associate - Elite Labs

Greetings,

Elite Labs announces Research Associate openings with STRICT academic criteria:

MANDATORY REQUIREMENTS:
- 10th Standard: 98%+ (CBSE/ICSE only)
- 12th Standard: 98%+ (Science with 99% in Mathematics)
- B.Tech CGPA: 9.7+ (no rounding, exactly 9.70 or above)
- Distinctions in ALL semesters (no exceptions)
- Zero backlogs throughout academic career
- No education gaps allowed (even 1 month gap = disqualification)
- Published papers in top-tier journals (minimum 3)
- Gold medalist or university rank holder only

Additional:
- Should have studied at Tier-1 institutes only
- International certifications required
- Perfect attendance record (>99%)

Students with 9.69 CGPA or 97.9% in boards need not apply. We only consider absolute top performers.

Elite Labs does not compromise on academic excellence.

Research Division - Elite Labs`,
        expectedBias: ["academic_elitism"],
        tags: ["research", "extreme-criteria", "unrealistic"],
        learningPoint: "Unrealistic and excessive academic requirements that eliminate 99% of qualified candidates and don't correlate with job performance."
      },

      {
        id: "biased-5",
        title: "Combined Bias - Multiple Types",
        category: "Multiple Bias",
        severity: "Critical",
        content: `Subject: Senior Analyst Position - ExclusiveTech Corp

Dear Sir Students,

ExclusiveTech Corp has openings for Senior Analyst roles.

CANDIDATE PROFILE:
We seek young gentlemen from CS/IT branches with exceptional academic records (CGPA 9.5+, no gaps). He should be from established urban families and educated in premium English-medium CBSE schools.

REQUIREMENTS:
- Male candidates only (fresher boys preferred)
- Premium hostel residents (AC accommodation)
- Own vehicle mandatory (car preferred over bike)
- Family background: Business or professional class
- Must provide surname and community details
- Reference from well-known family required

FINANCIAL:
- Training bond: ₹1,00,000 (immediate payment)
- Should demonstrate financial stability
- Parents should be in high-income bracket

The ideal candidate should be aggressive, commanding, and authoritative. He must be willing to work 60+ hours weekly without family constraints. No domestic responsibilities allowed.

Only candidates matching EXACT profile should apply.

ExclusiveTech Corp`,
        expectedBias: ["gender_bias", "department_discrimination", "socioeconomic_bias", "academic_elitism", "caste_community_indicators"],
        tags: ["extreme", "multiple-bias", "discriminatory"],
        learningPoint: "Combines gender bias, branch discrimination, socioeconomic barriers, family background checks, and unrealistic academic standards."
      }
    ]
  },

  fair: {
    category: "Fair & Inclusive Examples",
    description: "Well-written, bias-free recruitment emails",
    templates: [
      {
        id: "fair-1",
        title: "Inclusive Tech Hiring",
        category: "Fair Practice",
        severity: "None",
        content: `Subject: Software Developer Opening - InnovateTech

Dear Students,

InnovateTech is excited to announce Software Developer positions for all engineering students.

ELIGIBILITY:
- Any engineering branch welcome (CS, IT, ECE, Mechanical, Civil, etc.)
- Minimum CGPA: 6.5 (we value diverse talents)
- Strong interest in software development
- Basic programming knowledge preferred but not mandatory

We believe in equal opportunity and encourage applications from all students regardless of:
- Gender identity
- Branch of study
- Socioeconomic background
- Educational board (CBSE, ICSE, State boards all welcome)
- Hostel or residence type
- Transportation availability

SELECTION PROCESS:
Based entirely on:
- Coding assessment (fair and standardized)
- Problem-solving ability
- Communication skills
- Team collaboration mindset

No academic gaps will disqualify candidates - we understand life circumstances vary.

We provide:
- Inclusive work environment
- Flexible working hours
- Equal pay for equal work
- Support for all backgrounds

Interested students may apply. We look forward to diverse applications.

Best regards,
Inclusive Hiring Team - InnovateTech`,
        expectedBias: [],
        tags: ["inclusive", "fair", "equal-opportunity"],
        learningPoint: "Explicitly welcomes diversity, mentions equal opportunity, uses gender-neutral language, and focuses on actual job skills."
      },

      {
        id: "fair-2",
        title: "Merit-Based Selection",
        category: "Fair Practice",
        severity: "None",
        content: `Subject: Business Analyst Trainee - GlobalCorp

Hello Engineering Students,

GlobalCorp invites applications from students across all disciplines for Business Analyst Trainee positions.

OPEN TO:
- Students from any engineering branch
- Any educational board background
- All CGPA ranges (minimum 6.0)
- Students with or without prior internship experience

WHAT WE LOOK FOR:
- Analytical thinking
- Problem-solving skills
- Communication ability
- Willingness to learn
- Team player attitude

SELECTION CRITERIA:
- Aptitude test (measures logical reasoning)
- Case study analysis
- Personal interview
- No questions about family, background, or personal life
- Purely skills and merit-based evaluation

WE OFFER:
- Equal opportunity employment
- Supportive work environment
- Training and development
- Fair compensation
- Growth opportunities

Students from all backgrounds are encouraged to apply. We celebrate diversity and believe different perspectives make us stronger.

No registration fees. No bonds. No unfair requirements.

Apply now!

GlobalCorp Campus Recruitment`,
        expectedBias: [],
        tags: ["merit-based", "transparent", "supportive"],
        learningPoint: "Focuses on skills over credentials, explicitly states equal opportunity, no financial barriers, and welcomes all backgrounds."
      },

      {
        id: "fair-3",
        title: "Skill-Focused Opportunity",
        category: "Fair Practice",
        severity: "None",
        content: `Subject: Full Stack Developer - StartupHub

Dear Students,

StartupHub is hiring Full Stack Developers. We believe talent exists everywhere!

ELIGIBILITY:
- Any degree/branch (Engineering, Science, Arts, Commerce)
- No minimum CGPA requirement
- Freshers and experienced both welcome
- Self-taught programmers encouraged to apply

REQUIREMENTS:
- Basic knowledge of HTML, CSS, JavaScript
- Interest in web development
- Portfolio or projects (can be personal/academic)
- Enthusiasm to learn

WHAT MATTERS TO US:
✓ Your code quality
✓ Your problem-solving approach
✓ Your willingness to learn
✓ Your passion for technology

WHAT DOESN'T MATTER:
✗ Your gender, age, or background
✗ Your college name or ranking
✗ Your marks or CGPA
✗ Your family background
✗ Your financial status

INCLUSIVE PROCESS:
- Take-home assignment (do at your convenience)
- Technical discussion (friendly, not interrogation)
- Team fit conversation
- Fair evaluation for everyone

We provide:
- Flexible work arrangements
- Learning budget for courses
- Mentorship program
- Inclusive culture

Apply with your GitHub profile or project links. We care about what you can build, not where you come from.

StartupHub Team`,
        expectedBias: [],
        tags: ["skill-focused", "inclusive", "progressive"],
        learningPoint: "Completely removes traditional barriers, focuses purely on ability to code, explicitly lists what doesn't matter, very progressive approach."
      },

      {
        id: "fair-4",
        title: "Transparent Graduate Program",
        category: "Fair Practice",
        severity: "None",
        content: `Subject: Graduate Trainee Program - FutureCorp

Dear Students,

FutureCorp announces our Graduate Trainee Program open to all final year students.

ELIGIBILITY CRITERIA:
- Final year students from any stream
- CGPA: 6.0+ (we value consistent learners)
- All educational boards accepted
- Career gaps acceptable with reason

ROLE DETAILS:
- 12-month structured training program
- Rotation across departments
- Mentorship from senior professionals
- Opportunity to explore different functions

SELECTION PROCESS (Transparent & Fair):
Round 1: Online assessment (aptitude + technical basics)
Round 2: Group discussion (collaboration skills)
Round 3: Personal interview (mutual fit evaluation)
Round 4: HR discussion (expectations and offer)

Timeline: Results within 48 hours of each round

NO HIDDEN CRITERIA:
- No questions about family background
- No preference for specific colleges
- No discrimination of any kind
- Selection purely based on performance in rounds

COMPENSATION:
- Competitive stipend during training
- Full-time offer after successful completion
- No bonds or deposits required
- Transparent salary structure

INCLUSIVITY PROMISE:
We are committed to diversity and equal opportunity. Students from all backgrounds - rural, urban, different economic situations, different communities - are welcome.

Reasonable accommodations available for students with disabilities.

Apply online. May the best talent win!

FutureCorp Talent Acquisition`,
        expectedBias: [],
        tags: ["transparent", "fair", "structured"],
        learningPoint: "Complete transparency in process, explicitly mentions no hidden criteria, inclusive language, reasonable accommodations mentioned."
      },

      {
        id: "fair-5",
        title: "Diversity-First Hiring",
        category: "Fair Practice",
        severity: "None",
        content: `Subject: Data Science Role - EquiTech Solutions

Hello Future Data Scientists,

EquiTech Solutions is building a diverse team of Data Scientists!

WHO CAN APPLY:
Everyone! Seriously, we mean it.
- Any branch (Statistics, CS, IT, Math, Physics, Engineering, etc.)
- Any college or university
- Any background
- Any gender identity
- Any location
- Career changers welcome
- Self-learners welcome

WHAT WE NEED:
- Interest in data and analytics
- Basic Python or R knowledge
- Curiosity to learn
- Collaborative mindset

WHAT WE DON'T CARE ABOUT:
- Your grades (seriously, we won't ask)
- Your college ranking
- Your resume formatting
- Your family background
- Your financial situation
- Your physical appearance

HOW TO APPLY:
Submit a small data analysis project (can be on any topic you like). We want to see:
- How you think through problems
- How you communicate insights
- Your creativity with data

NO RESUME REQUIRED for initial screening. Let your work speak.

COMMITMENT TO FAIRNESS:
- Blind evaluation of projects (names removed)
- Standardized interview questions for all
- Diverse interview panel
- Equal pay for equal work (we publish salary ranges)

We actively seek candidates from:
- Underrepresented communities
- Rural areas
- First-generation college students
- Non-traditional backgrounds

Questions? Email us. We're friendly!

EquiTech Solutions - Building Diverse Teams`,
        expectedBias: [],
        tags: ["diversity-first", "progressive", "innovative"],
        learningPoint: "Goes beyond just being neutral - actively promotes diversity, uses innovative blind evaluation, removes resume bias, publishes salary ranges for transparency."
      }
    ]
  },

  borderline: {
    category: "Borderline Cases",
    description: "Emails that might be problematic but less obvious",
    templates: [
      {
        id: "borderline-1",
        title: "Implicit Preference - Subtle",
        category: "Subtle Bias",
        severity: "Medium",
        content: `Subject: Marketing Executive - BrandCo

Dear Students,

BrandCo is hiring Marketing Executives.

We prefer candidates who are:
- Outgoing and extroverted personalities
- Comfortable with extensive travel
- Flexible with working hours
- Native English speakers
- From metro city backgrounds

The role requires someone who can build strong client relationships and has natural charisma. We're looking for dynamic individuals who fit our corporate culture.

Preference given to students with:
- Premium institute background
- International exposure
- Family connections in business networks

Apply if you match our ideal profile.

BrandCo HR`,
        expectedBias: ["socioeconomic_bias"],
        tags: ["subtle", "implicit", "culture-fit"],
        learningPoint: "Uses 'culture fit' and 'preferences' as code words for socioeconomic discrimination. Native English speakers requirement excludes non-native speakers."
      },

      {
        id: "borderline-2",
        title: "Coded Language - Gender",
        category: "Subtle Bias",
        severity: "Medium",
        content: `Subject: Team Leader Role - DynamicTech

Hello Students,

DynamicTech seeks Team Leaders with aggressive problem-solving skills and competitive mindset.

The ideal candidate is:
- Assertive in decision-making
- Dominant in team discussions
- Comfortable working long hours independently
- Strong and resilient under pressure

We need someone with a commanding presence who can handle the demanding nature of the role. The candidate should be willing to prioritize career over personal commitments.

Apply if you're a strong, independent performer.

DynamicTech`,
        expectedBias: ["gender_bias"],
        tags: ["coded-language", "male-coded", "subtle"],
        learningPoint: "Uses male-coded language (aggressive, dominant, commanding) that unconsciously discourages women applicants. Career over commitments implies no family responsibilities."
      },

      {
        id: "borderline-3",
        title: "Soft Branch Preference",
        category: "Subtle Bias",
        severity: "Low",
        content: `Subject: Product Analyst Opening - TechFlow

Dear Students,

TechFlow has openings for Product Analysts.

While we welcome all branches, preference will be given to CS, IT, and related technical branches due to the nature of the role.

Candidates from other branches may apply but should demonstrate strong technical aptitude through projects or certifications.

CGPA requirement: 7.5+

TechFlow Recruitment`,
        expectedBias: ["department_discrimination", "academic_elitism"],
        tags: ["preference", "conditional", "moderate"],
        learningPoint: "States 'welcome all' but then gives preference to specific branches. Sets additional hurdles for non-preferred branches (need to prove aptitude). Moderate CGPA cutoff."
      }
    ]
  }
};

// Helper function to get all templates
export const getAllTemplates = () => {
  return [
    ...emailTemplates.biased.templates,
    ...emailTemplates.fair.templates,
    ...emailTemplates.borderline.templates
  ];
};

// Get templates by category
export const getTemplatesByCategory = (categoryType) => {
  return emailTemplates[categoryType]?.templates || [];
};

// Search templates
export const searchTemplates = (query) => {
  const allTemplates = getAllTemplates();
  const lowerQuery = query.toLowerCase();
  
  return allTemplates.filter(template => 
    template.title.toLowerCase().includes(lowerQuery) ||
    template.content.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.includes(lowerQuery))
  );
};
