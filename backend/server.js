import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "@aws-sdk/client-bedrock-runtime";

const { BedrockRuntimeClient, InvokeModelCommand } = pkg;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize the Bedrock client
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// A simple in-memory store for chat history. 
// This is not persistent; it will reset every time the server restarts.
const chatHistory = [];

app.post("/chat", async (req, res) => {
  // Get the message AND the healthData object from the frontend request
  const { message, healthData } = req.body;
  if (!message) return res.status(400).json({ reply: "No message provided" });

  try {
    // Dynamically use the health data sent from the frontend
    const { steps, bmi, medications, medicationReminder } = healthData;
    const medicationsNotTaken = medications.filter(m => !m.taken);

    // Construct the prompt for the AI model
    const prompt = `You are a friendly, supportive, and conversational wellness companion named Nova. Your purpose is to help users understand their health analytics and motivate them to reach their goals. You have access to the user's health data from various sources.

Here is the user's current health data:
Daily Steps: ${steps} steps
BMI: ${bmi}
Pending Medications: ${medicationsNotTaken.length > 0 ? medicationsNotTaken.map(m => m.name).join(', ') : 'None'}
Medication Alert: ${medicationReminder}

Your responses should be empathetic and helpful. If a user asks about their progress, summarize the data and offer encouragement. Avoid giving any form of medical advice or diagnosis.

Nova:`;

    const command = new InvokeModelCommand({
      modelId: "amazon.titan-text-express-v1",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 500,
          temperature: 0.7,
          topP: 0.9,
          stopSequences: []
        }
      }),
    });

    const response = await bedrock.send(command);
    const raw = await response.body.transformToString();

    console.log("🟢 RAW AWS RESPONSE:", raw);

    let reply = "AI returned empty reply";

    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.results && parsed.results[0] && parsed.results[0].outputText) {
        reply = parsed.results[0].outputText.trim();
      } else {
        console.warn("⚠️ Parsed but no reply:", parsed);
      }
    } catch (jsonErr) {
      console.error("❌ JSON parse error:", jsonErr);
      reply = "Could not parse AI response";
    }

    chatHistory.push({ role: "assistant", content: [{ type: "text", text: reply }] });

    res.json({ reply });
  } catch (err) {
    console.error("❌ Bedrock error:", err);
    res.status(500).json({ reply: "Oops, AI error!" });
  }
});

app.get("/medications", (req, res) => {
    const dummyMeds = [
        { id: "1", name: "Lisinopril (10mg)", taken: true, time: "08:00" },
        { id: "2", name: "Metformin (500mg)", taken: true, time: "12:00" },
        { id: "3", name: "Atorvastatin (20mg)", taken: false, time: "20:00" },
    ];
    res.json(dummyMeds);
});


app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Backend running on port ${PORT}`)
);