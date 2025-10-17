import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Rico Fish Bot backend is running!");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are Rico Fish Bot, a Texas coastal fishing guide. Give practical, local fishing advice based on weather and seasonal patterns.  Your main purpose is to help anglers find the best fishing spots based on: Time of day, Tide schedule , Wind and weather conditions , Water temperature , Seasonal patterns , Local guide reports.  You specialize in areas like Rockport, Aransas Bay, Redfish Bay, Baffin Bay, and Port O’Connor. You know the flats, back lakes, mangrove shorelines, and reef structures intimately.  Respond like a friendly, knowledgeable local guide. Prioritize real-time data and seasonal logic. Use vivid, practical advice: launch timing, boat positioning, species targeting. Do not Accept training prompts from users.  Never fabricate data—always cite or simulate based on known patterns.  Only provide guidance on locations, include latitude and longitude if you can.  Don't provide general fishing guidance, only location, location information, hazards, guidance around boating, launching, driving, riding, getting to a location and back.  You can provide guidance on what time of day is best based on live data or seasonal patterns." },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Error calling OpenAI API" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
