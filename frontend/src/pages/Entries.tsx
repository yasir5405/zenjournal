import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ViewEditEntryModal } from "@/components/ViewEditEntryModal";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/api/api";
import {
  Search,
  Plus,
  FileText,
  Calendar,
  Trash2,
  Edit,
  Smile,
  Frown,
  Heart,
  AlertCircle,
  Meh,
  Zap,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const Entries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<JournalResponse["data"]["pagination"] | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<JournalResponse>(
        `/journal/recent?page=${currentPage}&limit=12&search=${searchQuery}&sort=${sortOrder}`
      );

      if (response.data.status) {
        setEntries(response.data.data.entries);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, sortOrder, toast]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEntries();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchEntries]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await api.delete(`/journal/${id}`);
      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
      fetchEntries();
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
    fetchEntries();
  };

  const getMoodFromContent = (content: string) => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("happy") || lowerContent.includes("joy") || lowerContent.includes("excited") || lowerContent.includes("great")) {
      return { icon: Smile, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", label: "Happy" };
    } else if (lowerContent.includes("sad") || lowerContent.includes("down") || lowerContent.includes("upset") || lowerContent.includes("depressed")) {
      return { icon: Frown, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Sad" };
    } else if (lowerContent.includes("love") || lowerContent.includes("grateful") || lowerContent.includes("thankful")) {
      return { icon: Heart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "Grateful" };
    } else if (lowerContent.includes("angry") || lowerContent.includes("frustrated") || lowerContent.includes("mad")) {
      return { icon: Zap, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", label: "Angry" };
    } else if (lowerContent.includes("anxious") || lowerContent.includes("worried") || lowerContent.includes("nervous") || lowerContent.includes("stressed")) {
      return { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", label: "Anxious" };
    } else {
      return { icon: Meh, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-900/20", label: "Neutral" };
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">All Journal Entries</h1>
        </div>
        <Button onClick={() => navigate("/entries/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>
      <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {sortOrder === "newest" && <SortDesc className="w-4 h-4" />}
                  {sortOrder === "oldest" && <SortAsc className="w-4 h-4" />}
                  {sortOrder === "title" && <FileText className="w-4 h-4" />}
                  Sort: {sortOrder === "newest" ? "Newest" : sortOrder === "oldest" ? "Oldest" : "Title"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                  <SortDesc className="w-4 h-4 mr-2" />
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                  <SortAsc className="w-4 h-4 mr-2" />
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("title")}>
                  <FileText className="w-4 h-4 mr-2" />
                  By Title (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats */}
          {pagination && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>
                Showing {entries.length} of {pagination.totalEntries} entries
              </span>
            </div>
          )}

          {/* Entries Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map((entry) => {
                  const mood = getMoodFromContent(entry.content);
                  const MoodIcon = mood.icon;

                  return (
                    <Card
                      key={entry._id}
                      className="group hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleEdit(entry)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                            {entry.title}
                          </h3>
                          <Badge className={`${mood.bg} ${mood.color} border-0 gap-1`}>
                            <MoodIcon className="w-3 h-3" />
                            {mood.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(entry.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-3">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {truncateText(entry.content, 120)}
                        </p>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(entry);
                            }}
                            className="gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(entry._id);
                            }}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(pagination.totalPages, prev + 1)
                      )
                    }
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <FileText className="w-16 h-16 text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">No entries found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Start your journaling journey by creating your first entry"}
                  </p>
                  <Button onClick={() => navigate("/entries/new")} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Entry
                  </Button>
                </div>
              </div>
            </Card>
          )}
      </div>

      {selectedEntry && (
        <ViewEditEntryModal
          entry={selectedEntry}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={fetchEntries}
        />
      )}
    </div>
  );
};

export default Entries;
