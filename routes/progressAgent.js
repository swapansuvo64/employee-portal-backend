const express = require('express');
const router = express.Router();
const axios = require('axios');

const MISTRAL_API_KEY = "kLD0f73qeVr6vGjvPfnhM6jcNGpFu5kO";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

router.post('/', async (req, res) => {
    try {
        const { projectDescription } = req.body;

        if (!projectDescription) {
            return res.status(400).json({ error: "Project description is required" });
        }

        const prompt = `
You are a milestone planner for a company.

Company description: 
We handle both printing-packaging jobs (take or create design, make them printable, first print flat, make mockups, get approval, then deliver) 
and other types of projects such as software development, data entry, research, or general services.

Instructions:
- First decide if the project is a printing/packaging job or another type of project, based only on the project description.  
- If it is a printing/packaging job → generate exactly 10 milestones, starting with "Brief Receive" and ending with "Delivery".  
- If it is any other type of project → generate exactly 10 milestones relevant to that project’s execution (e.g., planning, design, development, testing, launch, etc.).  
- Do NOT mix printing milestones with other types of project milestones.  
- Do NOT mention the words "print job" or "non-print job" in the output.  
- Only return the milestones as a bulleted list with short names, no descriptions.  

Example format:
- Planning  
- Design  
- Development  
- Testing  
- Launch  

Project: "${projectDescription}"

Milestones:
`;

        const response = await axios.post(
            MISTRAL_API_URL,
            {
                model: "mistral-tiny",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 100
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`
                }
            }
        );

        // Extract and format the milestones
        const generatedText = response.data.choices[0].message.content;
        const milestones = generatedText
            .split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
            .map(line => line.replace(/^[-*]\s+/, '').trim())
            .filter(line => line.length > 0);

        res.json({ milestones });

    } catch (error) {
        console.error("Error generating milestones:", error);
        res.status(500).json({
            error: "Failed to generate milestones",
            details: error.message
        });
    }
});

module.exports = router;
