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
6. roadmap - a genuinely comprehensive, ordered, step-by-step learning roadmap from complete
   beginner to actually job-ready -- see the ROADMAP DEPTH rule below, this is the single most
   important part of the whole response. Each step needs an order starting at 1 and increasing
   sequentially, a title, description, a realistic estimatedWeeks, the requiredSkills for that
   step (same atomic-tag format rule as above), completionCriteria, and resources (plain-string
   names of things to study).
7. projects - a mix of Beginner, Intermediate and Advanced project ideas (at least 2 of each),
   each with a title, description, difficulty, technologies used, and a realistic estimatedHours.
8. interviewGuide - commonTopics, focusAreas, interviewTips, and importantConcepts, each as a
   list of short strings.
9. learningResources - real, well-known, currently existing resources, each with a title, type,
   a real working url (must start with http:// or https://), and 1-3 skills (from requiredSkills)
   that resource actually teaches.
10. salary - a realistic MONTHLY min and max salary as positive numbers, for Nepal's own job market
    specifically (not the US/global market) -- these are figures a student in Nepal would actually
    see advertised for this role, e.g. an entry-to-senior monthly range roughly in the tens of
    thousands to a few hundred thousand Nepalese Rupees, not USD-scale six-figure-per-year numbers.
    currency must always be the literal string "Rs".
11. difficulty - overall difficulty to break into this role.
12. futureDemand - future demand outlook for this role.
13. marketTrend - just the current trend direction for this role (do not include a date).
14. estimatedCompletionMonths - realistic number of months to become job-ready from scratch.

Rules:
- ROADMAP DEPTH (critical): the roadmap must have enough steps to genuinely take someone from zero
  to job-ready in this specific role -- never compress a broad, multi-topic domain into a
  handful of large, vague steps. As a hard floor, generate AT LEAST 10 steps, and for anything
  beyond a narrow/simple role, 14-22 steps is normal and expected. Break the domain down the way
  a real curriculum or a site like roadmap.sh would: foundational prerequisites, core
  language/tooling, the role's core theory/concepts (split into several focused steps, not one),
  the role's practical/hands-on tooling and frameworks, one or more specialization tracks if the
  role genuinely has them, deployment/production/tooling concerns relevant to the role, and a
  final job-readiness step (portfolio/interview prep). For example, a role like "AI/ML Engineer"
  is NOT "Programming Fundamentals, Machine Learning, Deep Learning" (3 steps) -- it looks more
  like: Programming Fundamentals, Python for Data Science, Math for ML (Linear Algebra,
  Calculus, Statistics/Probability), Data Manipulation (Pandas/NumPy/SQL), Data Visualization,
  Classical Machine Learning (algorithms + scikit-learn), Model Evaluation & Tuning, Deep
  Learning Fundamentals, Neural Network Architectures (CNN/RNN/Transformers), a Deep Learning
  Framework (PyTorch or TensorFlow), Working with LLMs/Generative AI, MLOps & Model Deployment,
  Cloud/Infra for ML, and a final Portfolio & Interview Prep step -- roughly 14 steps, each
  narrow enough to actually teach one coherent thing. Apply this same "many narrow steps, not a
  few broad ones" standard to whatever role is actually being requested, scaled to how broad that
  role genuinely is -- do not just copy the AI/ML example's steps for a different role.
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


def build_skill_resources_prompt(job_role: str, skill: str) -> str:
    return f"""You are an expert career counselor with deep, current knowledge of learning
resources for tech skills.

A student learning to become a {job_role} needs learning resources for one specific skill:

Skill: {skill}

Generate 2-3 real, well-known, currently existing learning resources for this skill, each with:
- title - the resource's real title
- type - one of Course, Documentation, Video, Article
- url - a real working url (must start with http:// or https://), from official docs or
  well-known platforms (Coursera, Udemy, freeCodeCamp, MDN, YouTube, etc.)
- skills - a list containing at least "{skill}" (and up to 2 more closely related skills if the
  resource genuinely covers them)

Rules:
- Only include resources you are confident genuinely exist and are real working pages.
- Do not invent resources or urls.
- At least one resource should be a Video (a real, existing YouTube video or playlist) if a
  genuinely good one exists for this skill.
- Respond ONLY with data matching the provided schema.
"""