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

module.exports = router;
