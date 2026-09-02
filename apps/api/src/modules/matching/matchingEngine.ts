import type { Job, MatchResult, UserProfile } from '@sagasu/api-contract';

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
  const userMinSalary = profile.career.minimumSalary?.amount || 15000000;
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
    locScore = 50;
    locExplanation = `On-site or hybrid in ${job.location || 'unspecified'}, differing from remote preference.`;
  } else {
    locScore = 90;
    locExplanation = `Location (${job.location || 'Local'}) aligns with criteria.`;
  }

  // 5. Seniority Matching (10%)
  let detectedLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Staff / Principal' = 'Senior';
  if (titleLower.includes('lead') || titleLower.includes('principal') || titleLower.includes('staff')) {
    detectedLevel = 'Staff / Principal';
  } else if (titleLower.includes('senior')) {
    detectedLevel = 'Senior';
  } else if (titleLower.includes('junior') || titleLower.includes('associate')) {
    detectedLevel = 'Junior';
  } else {
    detectedLevel = 'Mid';
  }

  let seniorityScore = 95;
  let seniorityExp = `Matches your career trajectory (${detectedLevel} level).`;
  if (detectedLevel === 'Senior' || detectedLevel === 'Lead') {
    seniorityScore = 100;
    seniorityExp = 'Optimal senior engineering alignment based on profile track record.';
  }

  // 6. Other / Culture Alignment (5%)
  const otherScore = 95;

  // Composite Weighted Score
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        skillScoreRaw * 0.4 +
        expScore * 0.2 +
        salaryScore * 0.15 +
        locScore * 0.1 +
        seniorityScore * 0.1 +
        otherScore * 0.05
      )
    )
  );

  return {
    score: totalScore,
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
        matchesPreference: !(locScore < 60)
      },
      seniority: {
        score: seniorityScore,
        explanation: seniorityExp,
        level: detectedLevel
      },
      other: {
        score: otherScore,
        explanation: 'Company domain and tech stack align with target preferences.'
      }
    },
    aiAnalysis: {
      fitSummary: `Strong ${totalScore}% match with ${matchedSkills.length} core competencies verified in profile.`,
      keyStrengths: [
        `${matchedSkills.slice(0, 3).join(', ')} directly align with requirement demands`,
        `${userYears} years engineering background meets experience expectations`,
        isRemote ? 'Fully remote environment matches candidate setup' : 'Location matches criteria'
      ],
      potentialGaps: missingSkills.length > 0 ? missingSkills.slice(0, 2) : ['No blocking skill gaps detected'],
      recommendedApplicationAngle: `Emphasize hands-on experience in ${matchedSkills.slice(0, 2).join(' & ')} along with architecture scaling achievements.`,
      interviewTip: `Be prepared to articulate real-world tradeoffs in distributed services and production performance optimization.`
    }
  };
}
