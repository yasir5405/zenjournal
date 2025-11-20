import { ViewEditEntryModal } from "@/components/ViewEditEntryModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/api/api";
import { 
  FileText, 
  Clock, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Heart,
  Smile,
  Frown,
  Meh,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    email: string;
    name?: string;
  };
}

interface JournalResponse {
  status: boolean;
  message: string;
  data: {
    entries: JournalEntry[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalEntries: number;
      entriesPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

const RecentEntries = () => {
  const { toast } = useToast();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchJournals = useCallback(async (page = 1, search = "", sort = "newest") => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(search && { search }),
        sort: sort
      });

            const response = await api.get(`/journal/recent?${params.toString()}`);
      
      if (response.data.status) {
        const journalData = response.data as JournalResponse;
        setJournals(journalData.data.entries);
        setCurrentPage(journalData.data.pagination.currentPage);
        setTotalPages(journalData.data.pagination.totalPages);
        setTotalEntries(journalData.data.pagination.totalEntries);
      } else {
        setError(response.data.message || "Failed to fetch journal entries");
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to fetch journal entries",
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch journal entries";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
    fetchJournals(1, debouncedSearchQuery, sortBy);
  }, [debouncedSearchQuery, sortBy, fetchJournals]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchJournals(currentPage, debouncedSearchQuery, sortBy);
    }
  }, [currentPage, debouncedSearchQuery, sortBy, fetchJournals]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setDebouncedSearchQuery(searchQuery); // Immediate search on form submit
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchJournals(currentPage, debouncedSearchQuery, sortBy);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const getMoodFromContent = (content: string) => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('happy') || lowerContent.includes('joy') || lowerContent.includes('excited')) {
      return { icon: Smile, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Happy' };
    } else if (lowerContent.includes('sad') || lowerContent.includes('down') || lowerContent.includes('upset')) {
      return { icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Sad' };
    } else if (lowerContent.includes('love') || lowerContent.includes('grateful')) {
      return { icon: Heart, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Grateful' };
    } else {
      return { icon: Meh, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', label: 'Neutral' };
    }
  };

  const getPreview = (content: string) => {
    return content.length > 120 ? content.substring(0, 120) + "..." : content;
  };

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Recent Entries</h1>
        </div>
        <div className="space-y-4">
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Entries</h3>
                  <p className="text-gray-500">{error}</p>
                  <Button 
                    onClick={() => fetchJournals(currentPage, searchQuery, sortBy)} 
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Recent Entries</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalEntries} total entries
        </div>
      </div>
      <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" size="sm" className="px-3">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Entries Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-64">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : journals.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Entries Found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? "Try adjusting your search terms" : "Start writing your first journal entry"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {journals.map((entry) => {
                const mood = getMoodFromContent(entry.content);
                const MoodIcon = mood.icon;
                
                return (
                  <Card
                    key={entry._id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                    onClick={() => handleViewEntry(entry)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {entry.title}
                        </CardTitle>
                        <Badge variant="secondary" className={`${mood.bg} ${mood.color} border-0 ml-2 flex-shrink-0`}>
                          <MoodIcon className="h-3 w-3 mr-1" />
                          {mood.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(entry.createdAt)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {getPreview(entry.content)}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          {entry.content.split(' ').length} words
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
      </div>

      {/* View/Edit Modal */}
      <ViewEditEntryModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        entry={selectedEntry}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default RecentEntries;