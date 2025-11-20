import { journalModel } from "../models/journal.model.js";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Helper function to get mood from content (enhanced)
const getMoodFromContent = (content) => {
  const lowerContent = content.toLowerCase();
  
  // Define mood categories with keywords
  const moodKeywords = {
    happy: ['happy', 'joy', 'joyful', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'delighted', 'cheerful', 'pleased', 'content'],
    sad: ['sad', 'down', 'upset', 'depressed', 'unhappy', 'miserable', 'gloomy', 'melancholy', 'blue', 'disappointed'],
    grateful: ['grateful', 'thankful', 'blessed', 'appreciate', 'fortunate', 'luck'],
    angry: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated', 'furious', 'rage'],
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'concerned', 'overwhelmed'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'composed'],
    energetic: ['energetic', 'motivated', 'productive', 'active', 'driven'],
    tired: ['tired', 'exhausted', 'fatigued', 'drained', 'weary', 'sleepy']
  };

  let moodScores = {};
  
  // Calculate scores for each mood
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    moodScores[mood] = keywords.filter(keyword => lowerContent.includes(keyword)).length;
  }

  // Find mood with highest score
  const dominantMood = Object.keys(moodScores).reduce((a, b) => 
    moodScores[a] > moodScores[b] ? a : b
  );

  // If no keywords found, return neutral
  if (moodScores[dominantMood] === 0) {
    return 'neutral';
  }

  return dominantMood;
};

// Get mood calendar data (all entries with mood analysis)
export const getMoodCalendar = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Build date filter if month/year provided
    let dateFilter = { user: userId };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter.createdAt = { $gte: startDate, $lte: endDate };
    }

    const entries = await journalModel.find(dateFilter).sort({ createdAt: -1 });

    // Analyze mood for each entry
    const moodData = entries.map(entry => {
      const mood = getMoodFromContent(entry.content);
      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      
      return {
        date,
        mood,
        entryId: entry._id,
        title: entry.title,
        hasEntry: true
      };
    });

    // Group by date (in case multiple entries per day, use dominant mood)
    const moodByDate = {};
    moodData.forEach(item => {
      if (!moodByDate[item.date]) {
        moodByDate[item.date] = item;
      }
    });

    res.status(200).json({
      status: true,
      message: "Mood calendar data retrieved successfully",
      data: {
        moodCalendar: Object.values(moodByDate),
        totalEntries: entries.length
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get AI-powered mood insights using Gemini
export const getMoodInsights = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Get last 30 days of entries
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await journalModel.find({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    if (entries.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No entries found for mood analysis",
        data: {
          insights: "Start journaling to receive personalized mood insights!",
          analyzedPeriod: "Last 30 days",
          totalEntriesAnalyzed: 0
        }
      });
    }

    // Analyze moods
    const moodDistribution = {};
    entries.forEach(entry => {
      const mood = getMoodFromContent(entry.content);
      moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
    });

    // Prepare data for AI analysis
    const moodSummary = Object.entries(moodDistribution)
      .map(([mood, count]) => `${mood}: ${count} entries`)
      .join(', ');

    const recentEntries = entries.slice(0, 5).map(e => ({
      title: e.title,
      excerpt: e.content.substring(0, 200)
    }));

    // Generate insights using Gemini
    const prompt = `As a compassionate mental health assistant, analyze the following journal data from the last 30 days and provide supportive, actionable insights:

Mood Distribution: ${moodSummary}
Total Entries: ${entries.length}

Recent Entry Samples:
${recentEntries.map((e, i) => `${i + 1}. ${e.title}: ${e.excerpt}...`).join('\n')}

Provide:
1. A brief overview of their emotional patterns
2. Positive observations and strengths
3. Areas that might need attention
4. 2-3 practical suggestions for emotional well-being
5. Encouraging words

Keep the response warm, supportive, and under 300 words.`;

    let insightText = '';
    
    try {
      // Create the model with API key
      const model = google('models/gemini-2.5-flash', {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });

      const result = await generateText({
        model,
        prompt,
        maxTokens: 500,
      });
      
      insightText = result.text;
    } catch (aiError) {
      console.error("Gemini API error:", aiError);
      // Fallback to rule-based insights if AI fails
      insightText = `Based on your ${entries.length} journal entries over the last 30 days, here's what we observed:

**Emotional Patterns:** ${moodSummary}

Your most frequent mood has been **${Object.keys(moodDistribution).reduce((a, b) => moodDistribution[a] > moodDistribution[b] ? a : b)}**. This shows you've been actively reflecting on your experiences.

**Positive Observations:** You're maintaining a consistent journaling practice, which is excellent for mental health awareness and emotional processing.

**Suggestions for Well-being:**
1. Continue your journaling routine - consistency is key
2. Try to identify patterns between your daily activities and moods
3. Practice gratitude by noting positive moments each day

Keep up the great work with your self-reflection journey! 🌟`;
    }

    res.status(200).json({
      status: true,
      message: "Mood insights generated successfully",
      data: {
        insights: insightText,
        moodDistribution,
        totalEntries: entries.length,
        analyzedPeriod: `${thirtyDaysAgo.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`,
        totalEntriesAnalyzed: entries.length,
        dateRange: {
          from: thirtyDaysAgo.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        }
      }
    });

  } catch (error) {
    console.error("Error generating mood insights:", error);
    console.error("Error details:", error.message);
    console.error("API Key present:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    
    const customError = new Error("Failed to generate AI insights. Please check your API key and try again.");
    customError.statusCode = 500;
    next(customError);
  }
};

// Log a standalone mood entry (without full journal)
export const logMood = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { mood, note } = req.body;

    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Validate mood
    const validMoods = ['happy', 'sad', 'grateful', 'angry', 'anxious', 'calm', 'energetic', 'tired', 'neutral'];
    if (!validMoods.includes(mood)) {
      const error = new Error("Invalid mood value");
      error.statusCode = 400;
      return next(error);
    }

    // Create a quick mood journal entry
    const title = `Mood Check - ${new Date().toLocaleDateString()}`;
    const content = note || `Feeling ${mood} today.`;

    const moodEntry = await journalModel.create({
      title,
      content,
      user: userId
    });

    res.status(201).json({
      status: true,
      message: "Mood logged successfully",
      data: {
        entry: moodEntry,
        mood
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get mood statistics
export const getMoodStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { days = 30 } = req.query;

    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await journalModel.find({
      user: userId,
      createdAt: { $gte: startDate }
    });

    // Calculate mood distribution
    const moodDistribution = {};
    const moodByDate = {};

    entries.forEach(entry => {
      const mood = getMoodFromContent(entry.content);
      const date = new Date(entry.createdAt).toISOString().split('T')[0];

      // Overall distribution
      moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;

      // By date
      if (!moodByDate[date]) {
        moodByDate[date] = {};
      }
      moodByDate[date][mood] = (moodByDate[date][mood] || 0) + 1;
    });

    // Find dominant mood
    const dominantMood = Object.keys(moodDistribution).reduce((a, b) =>
      moodDistribution[a] > moodDistribution[b] ? a : b, 'neutral'
    );

    res.status(200).json({
      status: true,
      message: "Mood statistics retrieved successfully",
      data: {
        moodDistribution,
        dominantMood,
        totalEntries: entries.length,
        dateRange: {
          from: startDate.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        },
        dailyMoods: moodByDate
      }
    });

  } catch (error) {
    next(error);
  }
};
