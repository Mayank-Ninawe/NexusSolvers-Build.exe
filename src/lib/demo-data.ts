import { DemoScenario } from '@/types';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 1,
    title: 'Gender-Biased Job Description',
    category: 'Job Description',
    text: `We are looking for young, energetic male candidates for our software development team. The ideal candidate should be a recent graduate, preferably from tier-1 engineering colleges like IIT or NIT. He should be willing to work long hours and be comfortable with a startup culture. Only male candidates from Mumbai, Pune, or Bangalore should apply. Freshers from other cities need not apply.`,
    expectedBiases: ['gender', 'age', 'location', 'educational_background'],
  },
  {
    id: 2,
    title: 'Age Discrimination Email',
    category: 'Email',
    text: `Dear Students,

We have an exciting opportunity for RECENT GRADUATES ONLY (2024-2025 batch). Candidates above 25 years of age will not be considered. We are looking for young blood with fresh ideas. Only those who have completed their degree in the last 2 years should apply. 

Experience is not required - in fact, we prefer candidates with NO prior work experience.

Regards,
Placement Cell`,
    expectedBiases: ['age', 'experience'],
  },
  {
    id: 3,
    title: 'Location Bias Announcement',
    category: 'Announcement',
    text: `🚨 Campus Placement Alert 🚨

Company XYZ is hiring! 

Requirements:
- Must be LOCAL CANDIDATE from Nagpur/nearby areas
- Should be willing to work from office (no remote)
- Candidates from other states need not apply
- Preference given to students staying with family in Nagpur
- Outstation candidates will face relocation issues, so please don't apply

Only Nagpur-based students are encouraged to participate.`,
    expectedBiases: ['location'],
  },
  {
    id: 4,
    title: 'Educational Background Bias',
    category: 'Job Description',
    text: `We are hiring for our elite development program. ONLY CANDIDATES FROM TIER-1 COLLEGES (IIT, NIT, BITS) should apply. Students from private engineering colleges or deemed universities need not waste their time applying.

The role requires excellence which only top-tier institution graduates possess. CGPA above 8.5 from recognized institutes only. Students with backlogs or from non-AICTE approved colleges will be automatically rejected.`,
    expectedBiases: ['educational_background'],
  },
  {
    id: 5,
    title: 'Multiple Bias Types',
    category: 'Email',
    text: `Dear Final Year Students,

We're excited to announce a placement drive for our company!

Eligibility:
✓ Male candidates preferred for this technical role
✓ Age: 21-23 years only
✓ Must be from Pune, Mumbai, or Bangalore (local candidates)
✓ Only from IIT, NIT, or top-tier private colleges
✓ Should have strong physique as job involves some physical work
✓ Freshers only - experienced candidates not allowed
✓ Should belong to families with IT background (preferred)

Interested candidates meeting ALL criteria can apply.

Best Regards,
Placement Officer`,
    expectedBiases: ['gender', 'age', 'location', 'educational_background', 'experience', 'other'],
  },
];
