import { journalModel } from "../models/journal.model.js";

// Helper function to get mood from content (same as frontend logic)
const getMoodFromContent = (content) => {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('happy') || lowerContent.includes('joy') || lowerContent.includes('excited') || lowerContent.includes('great') || lowerContent.includes('wonderful')) {
    return 'happy';
  } else if (lowerContent.includes('sad') || lowerContent.includes('down') || lowerContent.includes('upset') || lowerContent.includes('depressed')) {
    return 'sad';
  } else if (lowerContent.includes('love') || lowerContent.includes('grateful') || lowerContent.includes('thankful') || lowerContent.includes('blessed')) {
    return 'grateful';
  } else if (lowerContent.includes('angry') || lowerContent.includes('frustrated') || lowerContent.includes('mad') || lowerContent.includes('annoyed')) {
    return 'angry';
  } else if (lowerContent.includes('anxious') || lowerContent.includes('worried') || lowerContent.includes('nervous') || lowerContent.includes('stressed')) {
    return 'anxious';
  } else {
    return 'neutral';
  }
};

// Get analytics overview
export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Get all entries for the user
    const allEntries = await journalModel.find({ user: userId }).sort({ createdAt: -1 });
    
    // Calculate total entries
    const totalEntries = allEntries.length;

    // Calculate mood distribution
    const moodDistribution = {
      happy: 0,
      sad: 0,
      grateful: 0,
      angry: 0,
      anxious: 0,
      neutral: 0
    };

    allEntries.forEach(entry => {
      const mood = getMoodFromContent(entry.content);
      moodDistribution[mood]++;
    });

    // Calculate current writing streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (allEntries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Sort entries by date
      const sortedEntries = [...allEntries].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // Get unique dates
      const uniqueDates = [...new Set(sortedEntries.map(entry => {
        const date = new Date(entry.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }))].sort((a, b) => b - a);

      // Calculate current streak
      let expectedDate = today.getTime();
      for (let dateTime of uniqueDates) {
        if (dateTime === expectedDate || dateTime === expectedDate - 86400000) {
          currentStreak++;
          expectedDate = dateTime - 86400000;
        } else {
          break;
        }
      }

      // Calculate longest streak
      tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const diff = uniqueDates[i - 1] - uniqueDates[i];
        if (diff === 86400000) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    // Get average entry length
    const totalWords = allEntries.reduce((sum, entry) => 
      sum + entry.content.split(/\s+/).length, 0
    );
    const averageWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

    // Get most productive day of week
    const dayCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    allEntries.forEach(entry => {
      const day = new Date(entry.createdAt).getDay();
      dayCount[day]++;
    });
    
    const maxDay = Object.keys(dayCount).reduce((a, b) => 
      dayCount[a] > dayCount[b] ? a : b
    );
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostProductiveDay = dayNames[maxDay];

    res.status(200).json({
      status: true,
      message: "Analytics overview retrieved successfully",
      data: {
        totalEntries,
        moodDistribution,
        currentStreak,
        longestStreak,
        averageWords,
        mostProductiveDay,
        dayCount
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get mood trends over time
export const getMoodTrends = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { period = '30' } = req.query; // Default to 30 days

    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get entries from the specified period
    const entries = await journalModel.find({
      user: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Group by date and calculate mood
    const moodByDate = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      const mood = getMoodFromContent(entry.content);
      
      if (!moodByDate[date]) {
        moodByDate[date] = {
          date,
          happy: 0,
          sad: 0,
          grateful: 0,
          angry: 0,
          anxious: 0,
          neutral: 0,
          total: 0
        };
      }
      
      moodByDate[date][mood]++;
      moodByDate[date].total++;
    });

    // Convert to array and fill missing dates
    const trends = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (moodByDate[dateStr]) {
        trends.push(moodByDate[dateStr]);
      } else {
        trends.push({
          date: dateStr,
          happy: 0,
          sad: 0,
          grateful: 0,
          angry: 0,
          anxious: 0,
          neutral: 0,
          total: 0
        });
      }
    }

    res.status(200).json({
      status: true,
      message: "Mood trends retrieved successfully",
      data: {
        trends,
        period: daysAgo
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get writing activity calendar data
export const getActivityCalendar = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Get all entries for the user
    const entries = await journalModel.find({ user: userId });

    // Group by date
    const activityByDate = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      
      if (!activityByDate[date]) {
        activityByDate[date] = {
          date,
          count: 0,
          wordCount: 0
        };
      }
      
      activityByDate[date].count++;
      activityByDate[date].wordCount += entry.content.split(/\s+/).length;
    });

    // Convert to array
    const activity = Object.values(activityByDate);

    res.status(200).json({
      status: true,
      message: "Activity calendar data retrieved successfully",
      data: {
        activity
      }
    });

  } catch (error) {
    next(error);
  }
};
