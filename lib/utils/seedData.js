// Sample emails with pre-analyzed results for demo
export const sampleEmails = [
  {
    fileName: "TCS Software Developer - High Bias",
    emailText: `Subject: Software Developer Position - TCS

Dear Sir,

We invite only CS and IT students with CGPA above 9.0 from Premium Hostel A.

The ideal candidate should be a gentleman with excellent leadership qualities. He should have strong technical skills and be willing to relocate without family constraints.

Requirements:
- Must be from urban background
- Professional appearance mandatory
- Own vehicle preferred

Best regards,
TCS HR Team`,
    analysis: {
      biasDetected: true,
      confidence: 98,
      patterns: [
        {
          type: "gender_bias",
          severity: "high",
          evidence: "Dear Sir, gentleman, He should have",
          reasoning: "Uses exclusively masculine terms and pronouns, creating a male-only environment assumption. The salutation 'Dear Sir' and pronoun 'He' explicitly excludes female candidates from consideration."
        },
        {
          type: "department_discrimination",
          severity: "high",
          evidence: "only CS and IT students",
          reasoning: "Explicitly restricts opportunity to Computer Science and IT branches, discriminating against equally qualified students from Electronics, Electrical, Mechanical and other engineering disciplines who may possess relevant programming skills."
        },
        {
          type: "socioeconomic_bias",
          severity: "high",
          evidence: "Premium Hostel A, urban background, Own vehicle",
          reasoning: "Multiple socioeconomic filters that favor wealthy students. Premium hostel, urban background requirement, and vehicle ownership create barriers for students from lower-income families or rural areas."
        },
        {
          type: "academic_elitism",
          severity: "high",
          evidence: "CGPA above 9.0",
          reasoning: "Unrealistically high CGPA cutoff of 9.0 excludes many competent students. This extreme academic requirement often doesn't correlate with actual job performance and eliminates diverse talent pool."
        }
      ]
    },
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    status: "completed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    analyzedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  {
    fileName: "Infosys Marketing Role - Gender Bias",
    emailText: `Subject: Marketing Executive Opening

Hello Students,

We are looking for confident young men for our Marketing Executive position.

He should be aggressive in sales approach and comfortable with extensive client travel. The candidate must have commanding presence and authoritative communication style.

Preference for candidates who can start immediately without domestic responsibilities.

Apply now!
Infosys Recruitment`,
    analysis: {
      biasDetected: true,
      confidence: 95,
      patterns: [
        {
          type: "gender_bias",
          severity: "high",
          evidence: "young men, He should be aggressive, commanding presence, authoritative",
          reasoning: "Multiple male-coded terms like 'aggressive', 'commanding', 'authoritative' create gender stereotypes. Explicitly seeks 'young men' and uses masculine pronouns, excluding women and non-binary individuals."
        },
        {
          type: "gender_bias",
          severity: "medium",
          evidence: "without domestic responsibilities",
          reasoning: "Phrase 'domestic responsibilities' disproportionately affects women who are often primary caregivers. This creates an indirect gender barrier by assuming candidates should have no family obligations."
        }
      ]
    },
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    status: "completed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    analyzedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  {
    fileName: "HDFC Bank Management Trainee - Socioeconomic",
    emailText: `Subject: Management Trainee Program

Dear Students,

HDFC Bank invites applications for Management Trainee positions.

Eligibility:
- Students from AC Hostels A, B, C only
- CBSE/ICSE board background (State board not eligible)
- Must own laptop and smartphone
- Training bond: ₹50,000 (non-refundable)
- Personal vehicle mandatory for branch visits

Submit applications with passport photo and Aadhaar card.

HDFC Recruitment Team`,
    analysis: {
      biasDetected: true,
      confidence: 92,
      patterns: [
        {
          type: "socioeconomic_bias",
          severity: "high",
          evidence: "AC Hostels A, B, C only, Training bond: ₹50,000, Personal vehicle mandatory",
          reasoning: "Multiple financial barriers: AC hostel residency indicates wealth, ₹50,000 non-refundable bond excludes students from economically weaker sections, and mandatory vehicle ownership discriminates against those who cannot afford one."
        },
        {
          type: "socioeconomic_bias",
          severity: "medium",
          evidence: "CBSE/ICSE board background (State board not eligible)",
          reasoning: "Educational board discrimination often correlates with socioeconomic status. CBSE/ICSE schools typically have higher fees, while state board students (often from middle/lower-income families) are explicitly excluded despite equal merit."
        },
        {
          type: "caste_community_indicators",
          severity: "low",
          evidence: "Aadhaar card requirement",
          reasoning: "While Aadhaar is standard ID, combined with other socioeconomic filters, it may be used for background verification that could reveal community/caste information in Indian context."
        }
      ]
    },
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    status: "completed",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    analyzedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  {
    fileName: "Google Data Scientist - Academic Elitism",
    emailText: `Subject: Data Scientist Position

Hi Students,

Google is visiting for Data Scientist roles.

Strict Requirements:
- CGPA: Minimum 9.5 (no exceptions)
- 10th: 95%+ marks
- 12th: 95%+ marks
- No education gaps allowed
- Distinctions in all semesters mandatory
- Published research papers required

Only students meeting ALL criteria should apply.

Google Campus Team`,
    analysis: {
      biasDetected: true,
      confidence: 97,
      patterns: [
        {
          type: "academic_elitism",
          severity: "high",
          evidence: "CGPA 9.5, 10th: 95%+, 12th: 95%+, No education gaps",
          reasoning: "Extremely unrealistic academic requirements that exclude 95%+ of students. CGPA 9.5 cutoff is arbitrary and doesn't predict job performance. The 'no gaps' rule discriminates against students with health issues, family emergencies, or financial constraints."
        },
        {
          type: "academic_elitism",
          severity: "high",
          evidence: "Distinctions in all semesters mandatory, Published research papers required",
          reasoning: "Requiring research publications and perfect distinctions for an entry-level position is excessive. This favors students from privileged backgrounds who had resources for research rather than measuring actual capability for the role."
        }
      ]
    },
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    status: "completed",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    analyzedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  {
    fileName: "Amazon SDE Intern - Clean Email",
    emailText: `Subject: Software Development Engineer Intern

Dear Students,

Amazon is excited to announce SDE Internship opportunities for all engineering students.

Requirements:
- All engineering branches welcome
- CGPA: 6.5 and above
- Strong problem-solving skills
- Interest in software development

We value diverse perspectives and encourage applications from all students regardless of background, gender, or previous experience.

Selection based purely on coding assessment and interview performance.

Looking forward to your applications!

Amazon University Recruiting`,
    analysis: {
      biasDetected: false,
      confidence: 99,
      patterns: []
    },
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    status: "completed",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    analyzedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  {
    fileName: "Microsoft Full Stack Developer - Clean",
    emailText: `Subject: Full Stack Developer Opening

Hello Engineering Students,

Microsoft is hiring Full Stack Developers for our Bangalore office.

Eligibility:
- Any engineering discipline
- Minimum CGPA: 7.0
- Knowledge of web technologies (HTML, CSS, JavaScript)
- Familiarity with any backend framework is a plus

We believe in equal opportunity and encourage candidates from all backgrounds to apply. Our selection process focuses entirely on technical skills and problem-solving ability.

No restrictions based on branch, board, hostel, or background.

Microsoft Campus Hiring Team`,
    analysis: {
      biasDetected: false,
      confidence: 100,
      patterns: []
    },
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    status: "completed",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    analyzedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  {
    fileName: "Accenture Business Analyst - Moderate Bias",
    emailText: `Subject: Business Analyst Position

Dear Students,

Accenture is hiring Business Analysts.

Preferred Qualifications:
- CS, IT, or MBA students
- CGPA above 8.0
- Excellent communication skills
- Should be comfortable with travel

Candidates should demonstrate leadership and analytical thinking.

Accenture HR`,
    analysis: {
      biasDetected: true,
      confidence: 72,
      patterns: [
        {
          type: "department_discrimination",
          severity: "medium",
          evidence: "Preferred: CS, IT, or MBA students",
          reasoning: "While stated as 'preferred' rather than mandatory, this language still creates bias against students from other branches. Business Analyst roles require analytical skills that students from all disciplines can possess."
        },
        {
          type: "academic_elitism",
          severity: "low",
          evidence: "CGPA above 8.0",
          reasoning: "CGPA 8.0 cutoff is moderately high but not extremely unrealistic. However, it may still exclude candidates with practical skills but slightly lower grades due to various circumstances."
        }
      ]
    },
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
    status: "completed",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    analyzedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Function to seed database with sample data
export const seedDemoData = async (db, userId) => {
  const { ref, set, push } = await import('firebase/database');
  
  try {
    const uploadsRef = ref(db, `uploads/${userId}`);
    
    for (const email of sampleEmails) {
      const newUploadRef = push(uploadsRef);
      await set(newUploadRef, email);
    }
    
    return { success: true, count: sampleEmails.length };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, error: error.message };
  }
};

// Function to clear all user data (for testing)
export const clearAllData = async (db, userId) => {
  const { ref, remove } = await import('firebase/database');
  
  try {
    const uploadsRef = ref(db, `uploads/${userId}`);
    await remove(uploadsRef);
    return { success: true };
  } catch (error) {
    console.error('Clear error:', error);
    return { success: false, error: error.message };
  }
};
