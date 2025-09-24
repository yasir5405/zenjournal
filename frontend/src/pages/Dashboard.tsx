import { AppSidebar } from "@/components/app-sidebar";
import { AddEntryModal } from "@/components/AddEntryModal";
import { ViewEditEntryModal } from "@/components/ViewEditEntryModal";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { api } from "@/api/api";
import { Calendar, FileText, Plus, Clock } from "lucide-react";

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

const Dashboard = () => {
  const userData = useSelector((state: any) => state.auth.userData);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<JournalResponse['data']['pagination'] | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const response = await api.get<JournalResponse>("/journal");
      if (response.data.status) {
        setJournals(response.data.data.entries);
        setPagination(response.data.data.pagination);
      } else {
        setError("Failed to fetch journals");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch journals";
      setError(errorMessage);
      console.error("Error fetching journals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleAddEntrySuccess = () => {
    // Refresh the journals list after successful entry creation
    fetchJournals();
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewModalOpen(true);
  };

  const handleViewModalSuccess = () => {
    // Refresh the journals list after successful update/delete
    fetchJournals();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background">
          <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-card/50">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex items-center gap-2">
                  {/* <FileText className="h-5 w-5 text-primary" /> */}
                  <div className="text-lg font-semibold text-foreground">
                    Journal Dashboard
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 bg-muted/20">
              {/* Welcome Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      Welcome back, {userData?.name || userData?.email?.split('@')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-muted-foreground">
                      Ready to continue your journaling journey?
                    </p>
                  </div>
                  <Button className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    New Entry
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pagination?.totalEntries || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Your journaling collection
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {journals.filter(j => new Date(j.createdAt).getMonth() === new Date().getMonth()).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entries this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {journals.length > 0 ? formatDate(journals[0].createdAt).split(',')[0] : 'None'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last entry date
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Journal Entries Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-foreground">Recent Entries</h2>
                  {pagination && pagination.totalEntries > 0 && (
                    <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold">
                      {pagination.totalEntries} total entries
                    </span>
                  )}
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6">
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <Card className="p-8 text-center border-destructive/50 bg-destructive/5">
                    <CardContent>
                      <p className="text-destructive font-medium">Error loading journals</p>
                      <p className="text-muted-foreground text-sm mt-1">{error}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Empty State */}
                {!loading && !error && journals.length === 0 && (
                  <Card className="p-12 text-center">
                    <CardContent className="space-y-4">
                      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">No journal entries yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Start your mindfulness journey by creating your first journal entry.
                        </p>
                        <Button className="flex items-center gap-2 mx-auto" onClick={() => setIsAddModalOpen(true)}>
                          <Plus className="h-4 w-4" />
                          Create Your First Entry
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Journal Entries Grid */}
                {!loading && !error && journals.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {journals.map((journal) => (
                      <Card 
                        key={journal._id} 
                        className="group hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-primary/20"
                        onClick={() => handleViewEntry(journal)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                              {journal.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(journal.createdAt)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                            {truncateContent(journal.content)}
                          </p>
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center rounded-full border text-foreground px-2.5 py-0.5 text-xs font-semibold">
                                {journal.content.length} characters
                              </span>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                Read More →
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Load More Button */}
                {pagination && pagination.hasNextPage && (
                  <div className="text-center pt-6">
                    <Button variant="outline" className="w-auto">
                      Load More Entries
                    </Button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </SidebarInset>

        {/* Add Entry Modal */}
        <AddEntryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddEntrySuccess}
        />

        {/* View/Edit Entry Modal */}
        <ViewEditEntryModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          entry={selectedEntry}
          onSuccess={handleViewModalSuccess}
        />
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
