from app.services.resume_analysis.schemas import (
    PreviousResumeSummary,
    ResumeExtractionAIResponse,
)


def build_resume_extraction_prompt(resume_text: str, candidate_full_name: str) -> str:
    return f"""You are an expert technical recruiter and resume reviewer.

The account holder's name on file is: "{candidate_full_name}"

Below is the raw text extracted from an uploaded resume (formatting/whitespace may be
imperfect since it was extracted from a PDF):

---
{resume_text}
---

Do the following:
1. Extract the candidate's full name exactly as it appears on the resume, if present
   (candidateNameOnResume).
2. Judge whether candidateNameOnResume plausibly refers to the same person as the
   account holder's name above (identityMatch), allowing for minor spelling, casing,
   nickname, or formatting differences (e.g. "Rob Sharma" vs "Robert Sharma" is a
   match). Set identityMatch to false if the resume has no discernible name, a clearly
   different name, or otherwise does not look like this person's own resume. Give one
   short sentence explaining the verdict in identityReason.
3. Extract skills as short atomic tags (a single skill/tool/language per entry, not a
   sentence or a comma-joined list).
4. Extract projects, work experience, and education exactly as described in the resume
   -- do not invent entries that aren't there.
5. List concrete strengths and weaknesses of this resume as a job application document
   (clarity, structure, quantified impact, relevance, etc.) -- not a judgment of the
   person.
6. Give an ATS (Applicant Tracking System) compatibility score from 0-100, based on
   formatting, keyword coverage, and structure.
7. Give concrete, actionable recommendations to improve the resume.

Rules:
- Only extract what is actually present in the resume text. Do not fabricate
  experience, projects, or education.
- If the resume text looks garbled or incomplete (PDF extraction artifacts), do your
  best with what's legible rather than refusing.
- Respond ONLY with data matching the provided schema.
"""


def build_resume_comparison_prompt(
    current: ResumeExtractionAIResponse, previous: PreviousResumeSummary
) -> str:
    return f"""You are comparing the same person's current resume analysis against their
previous one, to show them how they've progressed.

PREVIOUS ANALYSIS:
- Skills: {", ".join(previous.skills) or "(none)"}
- Strengths: {", ".join(previous.strengths) or "(none)"}
- Weaknesses: {", ".join(previous.weaknesses) or "(none)"}
- ATS score: {previous.atsScore}

CURRENT ANALYSIS:
- Skills: {", ".join(current.skills) or "(none)"}
- Strengths: {", ".join(current.strengths) or "(none)"}
- Weaknesses: {", ".join(current.weaknesses) or "(none)"}
- ATS score: {current.atsScore}

Based on this, produce:
- improvements: concrete things that got better since the previous resume (e.g.
  resolved weaknesses, higher ATS score, stronger strengths).
- regressions: concrete things that got worse or dropped since the previous resume.
- newSkills: skills present now that weren't in the previous analysis.
- summary: one short, encouraging paragraph summarizing the overall trajectory.

Rules:
- Base every point strictly on the two analyses given above -- do not invent details
  not present in either.
- If there is genuinely no change in a category, return an empty list for it rather
  than inventing something.
- Respond ONLY with data matching the provided schema.
"""
