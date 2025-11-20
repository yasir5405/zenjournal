import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { api } from "@/api/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Smile,
  Frown,
  Heart,
  AlertCircle,
  Meh,
  Activity,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface AnalyticsOverview {
  totalEntries: number;
  moodDistribution: {
    happy: number;
    sad: number;
    grateful: number;
    angry: number;
    anxious: number;
    neutral: number;
  };
  currentStreak: number;
  longestStreak: number;
  averageWords: number;
  mostProductiveDay: string;
  dayCount: { [key: number]: number };
}

interface MoodTrend {
  date: string;
  happy: number;
  sad: number;
  grateful: number;
  angry: number;
  anxious: number;
  neutral: number;
  total: number;
}

const Analytics = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [moodTrends, setMoodTrends] = useState<MoodTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        const [overviewRes, trendsRes] = await Promise.all([
          api.get("/journal/analytics/overview"),
          api.get(`/journal/analytics/mood-trends?period=${period}`),
        ]);

        if (overviewRes.data.status) {
          setOverview(overviewRes.data.data);
        }

        if (trendsRes.data.status) {
          setMoodTrends(trendsRes.data.data.trends);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  // Prepare data for pie chart
  const moodPieData = overview
    ? [
        { name: "Happy", value: overview.moodDistribution.happy, color: "#10b981" },
        { name: "Sad", value: overview.moodDistribution.sad, color: "#3b82f6" },
        { name: "Grateful", value: overview.moodDistribution.grateful, color: "#ef4444" },
        { name: "Anxious", value: overview.moodDistribution.anxious, color: "#f59e0b" },
        { name: "Angry", value: overview.moodDistribution.angry, color: "#dc2626" },
        { name: "Neutral", value: overview.moodDistribution.neutral, color: "#6b7280" },
      ].filter((item) => item.value > 0)
    : [];

  // Prepare data for line chart (simplified for readability)
  const simplifiedTrends = moodTrends.filter((_, index) => 
    period === "7" ? true : period === "30" ? index % 2 === 0 : index % 7 === 0
  );

  // Get mood icon
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy":
        return <Smile className="w-5 h-5 text-green-500" />;
      case "sad":
        return <Frown className="w-5 h-5 text-blue-500" />;
      case "grateful":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "anxious":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "angry":
        return <Zap className="w-5 h-5 text-red-600" />;
      default:
        return <Meh className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get dominant mood
  const getDominantMood = () => {
    if (!overview) return "neutral";
    const moods = overview.moodDistribution;
    return Object.keys(moods).reduce((a, b) =>
      moods[a as keyof typeof moods] > moods[b as keyof typeof moods] ? a : b
    );
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </div>
      <div className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : overview ? (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Total Entries
                    </CardTitle>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.totalEntries}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All time journals
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Current Streak
                    </CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.currentStreak}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {overview.currentStreak === 1 ? "day" : "days"} in a row
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Longest Streak
                    </CardTitle>
                    <Target className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.longestStreak}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Personal best
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Avg. Words
                    </CardTitle>
                    <Zap className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.averageWords}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per entry
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Mood Distribution and Dominant Mood */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    {moodPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={moodPieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {moodPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      {getMoodIcon(getDominantMood())}
                      <div>
                        <p className="text-sm font-medium">Dominant Mood</p>
                        <p className="text-xl font-bold capitalize">
                          {getDominantMood()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Most Productive Day</p>
                        <p className="text-xl font-bold">
                          {overview.mostProductiveDay}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Mood Breakdown</p>
                      <div className="space-y-1">
                        {Object.entries(overview.moodDistribution).map(
                          ([mood, count]) =>
                            count > 0 && (
                              <div
                                key={mood}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  {getMoodIcon(mood)}
                                  <span className="capitalize">{mood}</span>
                                </div>
                                <span className="font-medium">{count}</span>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mood Trends Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Mood Trends Over Time</CardTitle>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPeriod("7")}
                        className={`px-3 py-1 text-sm rounded ${
                          period === "7"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        7 Days
                      </button>
                      <button
                        onClick={() => setPeriod("30")}
                        className={`px-3 py-1 text-sm rounded ${
                          period === "30"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        30 Days
                      </button>
                      <button
                        onClick={() => setPeriod("90")}
                        className={`px-3 py-1 text-sm rounded ${
                          period === "90"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        90 Days
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {simplifiedTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={simplifiedTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => format(parseISO(date), "MMM d")}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(date) =>
                            format(parseISO(date as string), "MMM d, yyyy")
                          }
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="happy"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Happy"
                        />
                        <Line
                          type="monotone"
                          dataKey="sad"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Sad"
                        />
                        <Line
                          type="monotone"
                          dataKey="grateful"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="Grateful"
                        />
                        <Line
                          type="monotone"
                          dataKey="anxious"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          name="Anxious"
                        />
                        <Line
                          type="monotone"
                          dataKey="neutral"
                          stroke="#6b7280"
                          strokeWidth={2}
                          name="Neutral"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[400px]">
                      <p className="text-muted-foreground">
                        No entries in the selected period
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { day: "Sun", count: overview.dayCount[0] },
                        { day: "Mon", count: overview.dayCount[1] },
                        { day: "Tue", count: overview.dayCount[2] },
                        { day: "Wed", count: overview.dayCount[3] },
                        { day: "Thu", count: overview.dayCount[4] },
                        { day: "Fri", count: overview.dayCount[5] },
                        { day: "Sat", count: overview.dayCount[6] },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" name="Entries" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  No analytics data available. Start journaling to see your insights!
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
};

export default Analytics;
