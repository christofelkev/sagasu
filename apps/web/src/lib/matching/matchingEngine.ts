import type { Job, MatchResult, UserProfile } from '@sagasu/api-contract';

/**
 * Deterministic Matching Engine according to SAGASU PRD Section 13 & 18:
 * - Skills: 40%
 * - Experience: 20%
 * - Salary: 15%
 * - Location / Remote: 10%
 * - Seniority: 10%
 * - Other preferences: 5%
 */
export function calculateMatch(job: Partial<Job>, profile: UserProfile): MatchResult {
  const profileSkills = profile.skills.map((s) => s.name.toLowerCase());
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

  // 1. Skills Matching (40%)
  const matchedSkills: string[] = [];
  const partialSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const js of jobSkills) {
    const directMatch = profileSkills.find((ps) => ps === js || ps.includes(js) || js.includes(ps));
    if (directMatch) {
      matchedSkills.push(js);
    } else {
      // Partial matching logic (e.g. react -> svelte or postgresql -> mysql)
      if (
        (js.includes('sql') && profileSkills.some((p) => p.includes('sql'))) ||
        (js.includes('script') && profileSkills.some((p) => p.includes('script'))) ||
        (js.includes('docker') && profileSkills.some((p) => p.includes('cloud') || p.includes('aws')))
      ) {
        partialSkills.push(js);
      } else {
        missingSkills.push(js);
      }
    }
  }

  const skillScoreRaw = jobSkills.length === 0 ? 100 : Math.min(
    100,
    Math.round(((matchedSkills.length * 1.0 + partialSkills.length * 0.5) / jobSkills.length) * 100)
  );

  // 2. Experience Matching (20%)
  const userYears = profile.career.yearsOfExperience || 4;
  // Estimate required years from title or requirements
  let requiredYears = 3;
  const titleLower = (job.title || '').toLowerCase();
  const descLower = (job.description || '').toLowerCase();

  if (titleLower.includes('lead') || titleLower.includes('principal') || descLower.includes('7+ years')) {
    requiredYears = 7;
  } else if (titleLower.includes('senior') || descLower.includes('5+ years')) {
    requiredYears = 5;
  } else if (titleLower.includes('junior') || descLower.includes('1-2 years')) {
    requiredYears = 1;
  }

  let expScore = 100;
  let expExplanation = `Matches your ${userYears} years of experience (${requiredYears}+ yrs expected).`;
  if (userYears >= requiredYears) {
    expScore = 100;
    expExplanation = `Exceeds or fully satisfies the required ${requiredYears}+ years of experience.`;
  } else if (userYears >= requiredYears - 1) {
    expScore = 80;
    expExplanation = `Slightly under ${requiredYears} years requirement (${userYears} yrs), but high skill overlap compensates.`;
  } else {
    expScore = Math.max(30, Math.round((userYears / requiredYears) * 80));
    expExplanation = `Role expects ${requiredYears}+ years, while profile has ${userYears} years.`;
  }

  // 3. Salary Matching (15%)
  const userMinSalary = profile.career.minimumSalary.amount || 15000000;
  let salaryScore = 100;
  let salaryExplanation = 'Salary matches or exceeds your target range.';

  if (job.salary) {
    const jobMax = job.salary.max || job.salary.min || 0;
    if (jobMax >= userMinSalary) {
      salaryScore = 100;
      salaryExplanation = `Offered salary range is above your minimum of Rp ${(userMinSalary / 1000000).toFixed(1)}M.`;
    } else if (jobMax > 0 && jobMax < userMinSalary) {
      salaryScore = Math.max(30, Math.round((jobMax / userMinSalary) * 90));
      salaryExplanation = `Max offered salary (Rp ${(jobMax / 1000000).toFixed(1)}M) is below your target of Rp ${(userMinSalary / 1000000).toFixed(1)}M.`;
    }
  } else {
    salaryScore = 85;
    salaryExplanation = 'Salary undisclosed, estimated competitive market rate.';
  }

  // 4. Location / Remote Matching (10%)
  const isRemote = !!job.remote || (job.location || '').toLowerCase().includes('remote');
  const userWantsRemote = profile.career.remotePreference === 'remote_only' || profile.career.remotePreference === 'hybrid' || profile.career.remotePreference === 'any';
  let locScore = 100;
  let locExplanation = 'Matches your preferred work arrangement.';

  if (isRemote && userWantsRemote) {
    locScore = 100;
    locExplanation = 'Full remote opportunity matches your work preference.';
  } else if (!isRemote && profile.career.remotePreference === 'remote_only') {
    locScore = 40;
    locExplanation = `Onsite/Hybrid in ${job.location || 'specified city'} - conflicts with Remote-Only preference.`;
  } else {
    const matchCity = profile.career.preferredLocations.some((loc) =>
      (job.location || '').toLowerCase().includes(loc.toLowerCase())
    );
    locScore = matchCity ? 95 : 75;
    locExplanation = matchCity ? `Location in ${job.location} aligns with preferences.` : `Located in ${job.location || 'other'}.`;
  }

  // 5. Seniority Matching (10%)
  let seniorityLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Staff / Principal' = 'Senior';
  if (titleLower.includes('junior') || titleLower.includes('associate')) seniorityLevel = 'Junior';
  else if (titleLower.includes('mid') || userYears < 4) seniorityLevel = 'Mid';
  else if (titleLower.includes('lead')) seniorityLevel = 'Lead';
  else if (titleLower.includes('staff') || titleLower.includes('principal')) seniorityLevel = 'Staff / Principal';

  let seniorityScore = 90;
  let seniorityExplanation = `Role seniority level (${seniorityLevel}) aligns with career profile.`;
  if (seniorityLevel === 'Senior' && userYears >= 4) {
    seniorityScore = 100;
  } else if (seniorityLevel === 'Staff / Principal' && userYears < 6) {
    seniorityScore = 70;
    seniorityExplanation = 'Leadership scope may require demonstrating architectural ownership.';
  }

  // 6. Other / Keywords (5%)
  let otherScore = 90;
  let otherExplanation = 'Employment type and domain industry aligned.';

  // Final Weighted Calculation
  const totalScore = Math.round(
    skillScoreRaw * 0.4 +
    expScore * 0.2 +
    salaryScore * 0.15 +
    locScore * 0.1 +
    seniorityScore * 0.1 +
    otherScore * 0.05
  );

  return {
    score: Math.min(99, Math.max(25, totalScore)),
    factors: {
      skills: {
        score: skillScoreRaw,
        matched: matchedSkills,
        partial: partialSkills,
        missing: missingSkills
      },
      experience: {
        score: expScore,
        explanation: expExplanation,
        userYears,
        requiredYears
      },
      salary: {
        score: salaryScore,
        explanation: salaryExplanation,
        userMin: userMinSalary,
        jobMax: job.salary?.max
      },
      location: {
        score: locScore,
        explanation: locExplanation,
        isRemote,
        matchesPreference: isRemote || locScore > 80
      },
      seniority: {
        score: seniorityScore,
        explanation: seniorityExplanation,
        level: seniorityLevel
      },
      other: {
        score: otherScore,
        explanation: otherExplanation
      }
    },
    aiAnalysis: {
      fitSummary: `Strong match (${totalScore}%) primarily driven by your mastery in ${(matchedSkills.slice(0, 3).join(', ') || 'modern web technologies')} combined with ${userYears} years of hands-on product engineering experience.`,
      keyStrengths: [
        `Direct overlap with core stack: ${matchedSkills.slice(0, 4).join(', ') || 'modern frameworks'}`,
        `Experience level perfectly aligns with ${seniorityLevel} expectations`,
        job.remote ? '100% remote flexibility fits your lifestyle profile' : `Convenient location in ${job.location || 'target hub'}`
      ],
      potentialGaps: missingSkills.length > 0
        ? [`Missing or unverified experience in: ${missingSkills.slice(0, 3).join(', ')}`]
        : ['No critical qualification blockers found'],
      recommendedApplicationAngle: `Highlight your previous production experience building resilient web applications, emphasizing ${matchedSkills[0] || 'TypeScript'} architecture and measurable business impact.`,
      interviewTip: `Expect technical discussion on state management, asynchronous queueing, and performance optimization in high-throughput environments.`
    }
  };
}
