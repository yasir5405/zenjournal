import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api/api";
import { Loader2, Download, FileJson, FileText, Database } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ExportDataSettings() {
  const { toast } = useToast();
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const downloadFile = (data: any, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = async () => {
    setIsExportingJSON(true);

    try {
      const response = await api.get("/auth/export-data?format=json");

      if (response.data.status) {
        const jsonData = JSON.stringify(response.data.data, null, 2);
        const timestamp = new Date().toISOString().split("T")[0];
        downloadFile(jsonData, `zenjournal-data-${timestamp}.json`, "application/json");
        
        toast({
          title: "Success",
          description: "Your data has been exported as JSON",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExportingJSON(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);

    try {
      const response = await api.get("/auth/export-data?format=csv");

      if (response.data.status) {
        const timestamp = new Date().toISOString().split("T")[0];
        downloadFile(response.data.data, `zenjournal-entries-${timestamp}.csv`, "text/csv");
        
        toast({
          title: "Success",
          description: "Your journal entries have been exported as CSV",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportAll = async () => {
    setIsExportingAll(true);

    try {
      const response = await api.get("/auth/export-data?format=json");

      if (response.data.status) {
        const jsonData = JSON.stringify(response.data.data, null, 2);
        const timestamp = new Date().toISOString().split("T")[0];
        downloadFile(jsonData, `zenjournal-complete-${timestamp}.json`, "application/json");
        
        toast({
          title: "Success",
          description: "Complete data export downloaded successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export Your Data</h1>
        <p className="text-muted-foreground mt-2">
          Download your journal entries, mood data, and account information
        </p>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <CardTitle>Export Formats</CardTitle>
          </div>
          <CardDescription>
            Choose the format that best suits your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* JSON Export */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <FileJson className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="text-base font-medium">Export as JSON</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Download all your data in JSON format. Includes profile, journal entries, and mood data.
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportJSON}
              disabled={isExportingJSON}
              variant="outline"
            >
              {isExportingJSON && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
          </div>

          {/* CSV Export */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="text-base font-medium">Export as CSV</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Download your journal entries in CSV format. Perfect for spreadsheet analysis.
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportCSV}
              disabled={isExportingCSV}
              variant="outline"
            >
              {isExportingCSV && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>

          {/* Complete Export */}
          <div className="flex items-center justify-between p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <Label className="text-base font-medium">Complete Data Archive</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Download everything in one comprehensive JSON file. Recommended for backups.
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportAll}
              disabled={isExportingAll}
            >
              {isExportingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Your Data</CardTitle>
          <CardDescription>
            What's included in your export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
            <p className="text-sm">
              <span className="font-medium">Profile Information:</span> Your name, email, and account settings
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
            <p className="text-sm">
              <span className="font-medium">Journal Entries:</span> All your journal entries with titles, content, and timestamps
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
            <p className="text-sm">
              <span className="font-medium">Mood Data:</span> Your mood tracking history and patterns
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
            <p className="text-sm">
              <span className="font-medium">Notification Preferences:</span> Your notification settings and preferences
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Privacy Notice:</span> Your data export will be generated in real-time
            and downloaded directly to your device. We do not store copies of your exported data on our servers.
            All exports are encrypted during transmission.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
