import { Router } from "express";
import {
  getMoodCalendar,
  getMoodInsights,
  logMood,
  getMoodStats
} from "../controllers/mood.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const moodRouter = Router();

// GET /mood/calendar - Get mood calendar data
moodRouter.get("/calendar", verifyJWT, getMoodCalendar);

// GET /mood/insights - Get AI-powered mood insights using Gemini
moodRouter.get("/insights", verifyJWT, getMoodInsights);

// POST /mood/log - Log a quick mood entry
moodRouter.post("/log", verifyJWT, logMood);

// GET /mood/stats - Get mood statistics
moodRouter.get("/stats", verifyJWT, getMoodStats);

export { moodRouter };
