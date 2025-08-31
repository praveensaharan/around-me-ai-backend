import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001; 

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); 


app.get("/api/places", async (req, res) => {
  const { query, ll } = req.query; 
  if (!query || !ll) {
    return res.status(400).json({ error: "Missing query or ll" });
  }

  try {
    const response = await fetch(
      `https://places-api.foursquare.com/places/search?query=${encodeURIComponent(
        query
      )}&ll=${ll}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
          "X-Places-Api-Version": "2025-06-17",
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch places", details: err.message });
  }
});


app.post("/api/ai-activities", async (req, res) => {
  const { mood, weather, city, date, time } = req.body;
  if (!mood || !weather || !city || !date || !time) {
    return res.status(400).json({ error: "Missing one or more required fields" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content:
              "You are an activity suggestion generator. Always return ONLY raw JSON (no text outside JSON)." +
              `\nKeys:\n- activities: 3–5 short, vivid activity suggestions for the given mood, weather, location, date, and time.\n- keywords: one-word or very short phrases matching each activity’s main theme; must match the number of activities.\n- reasoning: friendly 2–3 sentence explanation for why these activities fit.`,
          },
          {
            role: "user",
            content: `mood: ${mood}, weather: ${weather}, location: ${city}, date: ${date}, time: ${time}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "AI request failed" });
    }

    let data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

   
    content = content.replace(/```(json)?/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (parseErr) {
      res.status(500).json({ error: "Invalid JSON returned from AI", content });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch AI activities", details: err.message });
  }
});

app.get("/api/places/image", async (req, res) => {
  try {
    const { fsq_id } = req.query;
    if (!fsq_id) {
      return res.status(400).json({ error: "Missing fsq_id" });
    }

    const response = await fetch(`https://places-api.foursquare.com/places/${fsq_id}/photos 
`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
          "X-Places-Api-Version": "2025-06-17",
        },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch Foursquare photos" });
    }

    const photos = await response.json();
    console.log(photos);

    res.json({ photos });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching photos", details: err.message });
  }
});


app.get("/api/myip", async (req, res) => {
  try {
    const ipRes = await fetch("https://api.ipify.org/?format=json");
    if (!ipRes.ok) {
      return res.status(ipRes.status).json({ error: "Failed to fetch IP" });
    }
    const { ip } = await ipRes.json();
    const locRes = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!locRes.ok) {
      return res.status(locRes.status).json({ error: "Failed to fetch location" });
    }
    const location = await locRes.json();

    res.json({
      ip,
      location: {
        city: location.city,
        region: location.region,
        country: location.country_name,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        org: location.org,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching IP/location", details: err.message });
  }
});
// ----------------------
//  Start Server
// ----------------------
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
