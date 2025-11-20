import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChevronLeft, ChevronRight, Brain, TrendingUp, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: string;
  count: number;
}

interface MoodStats {
  totalEntries: number;
  moodDistribution: Array<{ mood: string; count: number; percentage: number }>;
  mostFrequentMood: string;
  moodTrend: string;
  averageEntriesPerDay: number;
}

interface AIInsights {
  insights: string;
  analyzedPeriod: string;
  totalEntriesAnalyzed: number;
}

const moodColors: Record<string, string> = {
  happy: '#10b981',
  sad: '#3b82f6',
  grateful: '#f59e0b',
  angry: '#ef4444',
  anxious: '#8b5cf6',
  calm: '#06b6d4',
  energetic: '#ec4899',
  tired: '#6b7280',
  neutral: '#9ca3af',
};

const moodEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  grateful: '🙏',
  angry: '😠',
  anxious: '😰',
  calm: '😌',
  energetic: '⚡',
  tired: '😴',
  neutral: '😐',
};

export default function MoodCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selectedDaysRange, setSelectedDaysRange] = useState('30');

  useEffect(() => {
    fetchMoodCalendar();
    fetchMoodStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const fetchMoodCalendar = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = await api.get(
        `/mood/calendar?month=${month}&year=${year}`
      );
      
      // Handle the response structure from backend
      if (response.data.status && response.data.data) {
        const moods = response.data.data.moodCalendar.map((item: { date: string; mood: string }) => ({
          date: item.date,
          mood: item.mood,
          count: 1
        }));
        setMoodData(moods);
      }
    } catch (error) {
      console.error('Failed to fetch mood calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodStats = async () => {
    try {
      const response = await api.get(
        `/mood/stats?days=${selectedDaysRange}`
      );
      
      // Handle the response structure from backend
      if (response.data.status && response.data.data) {
        const data = response.data.data;
        const distribution = Object.entries(data.moodDistribution).map(([mood, count]) => ({
          mood,
          count: count as number,
          percentage: Math.round((count as number / data.totalEntries) * 100)
        }));
        
        setMoodStats({
          totalEntries: data.totalEntries,
          moodDistribution: distribution,
          mostFrequentMood: data.dominantMood,
          moodTrend: data.dominantMood, // You can enhance this with more logic
          averageEntriesPerDay: data.totalEntries / parseInt(selectedDaysRange)
        });
      }
    } catch (error) {
      console.error('Failed to fetch mood stats:', error);
    }
  };

  const fetchAIInsights = async () => {
    try {
      setInsightsLoading(true);
      const response = await api.get(
        '/mood/insights'
      );
      
      console.log('AI Insights Response:', response.data);
      
      // Handle the response structure from backend
      if (response.data.status && response.data.data) {
        setAiInsights({
          insights: response.data.data.insights,
          analyzedPeriod: response.data.data.analyzedPeriod || `${response.data.data.dateRange?.from || ''} to ${response.data.data.dateRange?.to || ''}`,
          totalEntriesAnalyzed: response.data.data.totalEntriesAnalyzed || response.data.data.totalEntries || 0
        });
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Failed to fetch AI insights:', error);
      console.error('Error response:', axiosError.response?.data);
      alert(`Failed to generate insights: ${axiosError.response?.data?.message || axiosError.message || 'Unknown error'}`);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getMoodForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return moodData.find(entry => entry.date === dateStr);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get the starting day of week (0 = Sunday)
    const startDay = monthStart.getDay();
    
    // Create empty cells for days before month starts
    const emptyCells = Array.from({ length: startDay }, (_, i) => (
      <div key={`empty-${i}`} className="h-24 bg-muted/30 rounded-lg" />
    ));

    const dayCells = days.map(day => {
      const moodEntry = getMoodForDate(day);
      const mood = moodEntry?.mood || 'neutral';
      const bgColor = moodColors[mood];
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isTodayDate = isToday(day);

      return (
        <div
          key={day.toISOString()}
          className={`h-24 rounded-lg border-2 p-2 transition-all hover:scale-105 cursor-pointer ${
            isTodayDate ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
          } ${!isCurrentMonth ? 'opacity-50' : ''}`}
          style={{
            backgroundColor: moodEntry ? `${bgColor}20` : 'transparent',
            borderColor: isTodayDate ? 'hsl(var(--primary))' : 'transparent',
          }}
        >
          <div className="flex flex-col h-full">
            <span className={`text-sm font-medium ${isTodayDate ? 'text-primary' : ''}`}>
              {format(day, 'd')}
            </span>
            {moodEntry && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">{moodEmojis[mood]}</span>
                <Badge
                  className="text-xs px-1 py-0"
                  style={{
                    backgroundColor: bgColor,
                    color: 'white',
                  }}
                >
                  {mood}
                </Badge>
                {moodEntry.count > 1 && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {moodEntry.count} entries
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });

    return [...emptyCells, ...dayCells];
  };

  const renderMoodDistributionChart = () => {
    if (!moodStats) return null;

    const data = moodStats.moodDistribution.map(item => ({
      name: item.mood,
      value: item.count,
      percentage: item.percentage,
    }));

    const renderLabel = (props: { name?: string; percentage?: number }) => {
      return `${props.name || ''} ${props.percentage || 0}%`;
    };

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={moodColors[entry.name] || '#9ca3af'} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-muted/20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Mood Calendar</h1>
        <p className="text-muted-foreground">
          Track your emotional patterns and gain AI-powered insights
        </p>
      </div>

      {/* Stats Cards */}
      {moodStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moodStats.totalEntries}</div>
              <p className="text-xs text-muted-foreground mt-1">Last {selectedDaysRange} days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Most Frequent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{moodEmojis[moodStats.mostFrequentMood]}</span>
                <div>
                  <div className="text-xl font-bold capitalize">{moodStats.mostFrequentMood}</div>
                  <p className="text-xs text-muted-foreground">mood</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mood Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div className="text-xl font-bold capitalize">{moodStats.moodTrend}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Overall tendency</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Daily Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moodStats.averageEntriesPerDay.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">entries per day</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4">
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>Your emotional patterns over time</CardDescription>
              </div>
              <Select value={selectedDaysRange} onValueChange={(value) => {
                setSelectedDaysRange(value);
                fetchMoodStats();
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {moodStats && moodStats.moodDistribution.length > 0 ? (
              renderMoodDistributionChart()
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No mood data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <CardTitle>AI Insights</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAIInsights}
                disabled={insightsLoading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {insightsLoading ? 'Analyzing...' : 'Generate Insights'}
              </Button>
            </div>
            <CardDescription>Personalized analysis powered by Gemini AI</CardDescription>
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : aiInsights ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap leading-relaxed">{aiInsights.insights}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                  <span>Period: {aiInsights.analyzedPeriod}</span>
                  <span>•</span>
                  <span>{aiInsights.totalEntriesAnalyzed} entries analyzed</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <Brain className="h-12 w-12 mb-4 opacity-20" />
                <p className="mb-2">No insights generated yet</p>
                <p className="text-sm">Click "Generate Insights" to get personalized analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mood Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Mood Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(moodEmojis).map(([mood, emoji]) => (
              <Badge
                key={mood}
                variant="outline"
                className="px-3 py-1.5"
                style={{
                  borderColor: moodColors[mood],
                  backgroundColor: `${moodColors[mood]}10`,
                }}
              >
                <span className="mr-2">{emoji}</span>
                <span className="capitalize">{mood}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
