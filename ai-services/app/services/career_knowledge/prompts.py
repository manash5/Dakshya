def build_career_knowledge_prompt(job_role: str) -> str:
    return f"""You are an expert career counselor and industry analyst with deep, current
knowledge of the tech job market.

Generate COMPLETE, accurate, and realistic career guidance for the following job role.

Job Role: {job_role}

Generate:
1. careerDescription - a clear, informative description of what this role involves
2. requiredSkills - core skills needed for this role, as short atomic tags (see format rule below)
3. tools - common tools used in this role
4. frameworks - relevant frameworks/libraries used in this role
5. certifications - recognized certifications relevant to this role (empty list if none genuinely apply)
6. roadmap - an ordered, step-by-step learning roadmap from beginner to job-ready. Each step needs
   an order starting at 1 and increasing sequentially, a title, description, a realistic
   estimatedWeeks, the requiredSkills for that step (same atomic-tag format rule as above),
   completionCriteria, and resources (plain-string names of things to study).
7. projects - a mix of Beginner, Intermediate and Advanced project ideas (at least 2 of each),
   each with a title, description, difficulty, technologies used, and a realistic estimatedHours.
8. interviewGuide - commonTopics, focusAreas, interviewTips, and importantConcepts, each as a
   list of short strings.
9. learningResources - real, well-known, currently existing resources, each with a title, type,
   and a real working url (must start with http:// or https://).
10. salary - realistic min and max salary as positive numbers, and the currency code (e.g. "USD").
11. difficulty - overall difficulty to break into this role.
12. futureDemand - future demand outlook for this role.
13. marketTrend - just the current trend direction for this role (do not include a date).
14. estimatedCompletionMonths - realistic number of months to become job-ready from scratch.

Rules:
- Only describe skills, tools, frameworks, and resources that genuinely apply to this role.
  Do not invent certifications or resources that don't exist.
- requiredSkills (top-level and inside each roadmap step) must be atomic tags: a single skill,
  language, or concept per entry, 1-3 words, matching how it would appear in a job posting's
  skill list (e.g. "Python", "REST APIs", "Git"). Never a descriptive sentence, never a
  parenthetical list of examples, and never multiple skills joined by "and"/"or"/commas in one
  entry (e.g. NOT "Programming languages like Java, Python, or JavaScript" — instead emit
  "Java", "Python", and "JavaScript" as three separate entries).
- Learning resource URLs must be real, currently existing pages you are confident about
  (official docs, well-known platforms like Coursera/Udemy/freeCodeCamp/MDN, etc).
- Keep descriptions concise and free of marketing language.
- Respond ONLY with data matching the provided schema.
"""