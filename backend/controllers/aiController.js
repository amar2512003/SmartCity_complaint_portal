const Groq = require("groq-sdk");

const categories = [
  "Road Damage",
  "Water Supply",
  "Electricity",
  "Garbage Collection",
  "Street Lights",
  "Drainage",
  "Public Transport",
  "Environment",
];

const priorities = ["Low", "Medium", "High"];

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

const parseJsonResponse = (content) => {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not include JSON");
  }
  return JSON.parse(jsonMatch[0]);
};

const categorizeComplaint = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Complaint description is required" });
    }

    const groq = getGroqClient();

    if (!groq) {
      return res.status(500).json({ message: "GROQ_API_KEY is not configured" });
    }

    const prompt = `
Categorize this smart city complaint into one category and one priority.

Complaint description:
${description}

Allowed categories:
${categories.join(", ")}

Allowed priority values:
${priorities.join(", ")}

Return ONLY valid JSON in this exact shape:
{"category":"","priority":""}
`;

    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const result = parseJsonResponse(chat.choices[0].message.content);

    if (!categories.includes(result.category) || !priorities.includes(result.priority)) {
      return res.status(502).json({ message: "AI returned an unsupported category or priority" });
    }

    res.json({
      category: result.category,
      priority: result.priority,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Unable to categorize complaint" });
  }
};

const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please type your question." });
    }

    const groq = getGroqClient();

    if (!groq) {
      return res.status(500).json({ reply: "GROQ_API_KEY is not configured." });
    }

    const prompt = `
You are a Smart City Complaint Assistant.
Guide citizens on:
- how to submit complaints
- choosing complaint categories
- tracking complaint status
- understanding Pending, In Progress, and Resolved states
- using a complaint management portal

Allowed complaint categories:
${categories.join(", ")}

Citizen question:
${message}

Reply in clear, helpful language. Keep it concise and practical.
`;

    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    res.json({ reply: chat.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ reply: "Something went wrong. Please try again." });
  }
};

module.exports = {
  categorizeComplaint,
  chatWithAssistant,
};
