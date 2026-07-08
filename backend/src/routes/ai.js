const express = require('express');
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/ai/analyze-resume
router.post('/analyze-resume', auth, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText?.trim()) {
      return res.status(400).json({ message: 'resumeText is required' });
    }

    const truncated = resumeText.slice(0, 4000);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an expert career coach and resume reviewer.
Analyze the provided resume and give structured, actionable feedback covering:
1. Overall impression (2-3 sentences)
2. Strengths (bullet points)
3. Areas for improvement (bullet points)
4. ATS optimization tips
5. Overall score out of 10

Be concise, specific, and encouraging.`,
        },
        { role: 'user', content: `Please analyze this resume:\n\n${truncated}` },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ message: `AI request failed: ${err.message}` });
  }
});

// POST /api/ai/cover-letter
router.post('/cover-letter', auth, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return res.status(400).json({ message: 'resumeText and jobDescription are required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an expert career coach who writes compelling, personalized cover letters.
Write a professional cover letter that:
- Opens with a strong hook
- Highlights the most relevant experience from the resume for this specific job
- Shows genuine enthusiasm for the role and company
- Closes with a confident call to action
- Is 3-4 paragraphs, professional yet personable tone
Do not use placeholders — write it as a complete, ready-to-send letter.`,
        },
        {
          role: 'user',
          content: `Resume:\n${resumeText.slice(0, 3000)}\n\nJob Description:\n${jobDescription.slice(0, 1000)}`,
        },
      ],
      max_tokens: 700,
      temperature: 0.8,
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ message: 'AI request failed' });
  }
});

// POST /api/ai/interview-prep
router.post('/interview-prep', auth, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription?.trim()) return res.status(400).json({ message: 'jobDescription is required' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach. Return ONLY valid JSON with no markdown, no code blocks. Format: {"questions":[{"question":"...","answer":"..."}]}',
        },
        {
          role: 'user',
          content: `Job Description:\n${jobDescription.slice(0, 2000)}\n\nGenerate exactly 8 interview questions with ideal answers. Include 2 behavioral, 2 technical, 2 situational, 2 culture-fit. Each answer 3-4 sentences.`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    res.json(parsed);
  } catch (err) {
    console.error('Interview prep error:', err.message);
    res.status(500).json({ message: `AI request failed: ${err.message}` });
  }
});

// POST /api/ai/match-score
router.post('/match-score', auth, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return res.status(400).json({ message: 'resumeText and jobDescription are required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS system. Return ONLY valid JSON with no markdown. Format: {"score":75,"matched_skills":["React"],"missing_skills":["Docker"],"strengths":["point1"],"tips":["tip1"],"summary":"One sentence summary."}',
        },
        {
          role: 'user',
          content: `Analyze resume vs job description. Give match score 0-100.\n\nResume:\n${resumeText.slice(0, 2000)}\n\nJob Description:\n${jobDescription.slice(0, 1000)}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.5,
    });

    const text = completion.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    res.json(parsed);
  } catch (err) {
    console.error('Match score error:', err.message);
    res.status(500).json({ message: `AI request failed: ${err.message}` });
  }
});

module.exports = router;
