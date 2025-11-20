import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { api } from "@/api/api";
import { PlusCircle, Save, X, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CreateEntry = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/journal/create", {
        title: title.trim(),
        content: content.trim(),
      });

      if (response.data.status) {
        toast({
          title: "Success",
          description: "Journal entry created successfully",
        });
        navigate("/entries");
      }
    } catch (error: unknown) {
      console.error("Failed to create entry:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create entry";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/entries");
      }
    } else {
      navigate("/entries");
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center gap-2 mb-6">
        <PlusCircle className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Create New Entry</h1>
      </div>
      <div>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Write Your Thoughts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Express yourself freely. Your entries are private and secure.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Give your entry a title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={200}
                      required
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {title.length}/200 characters
                    </p>
                  </div>

                  {/* Content Textarea */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your thoughts here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows={15}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{wordCount} words</span>
                      <span>{charCount} characters</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <Save className="w-4 h-4" />
                      {isSubmitting ? "Saving..." : "Save Entry"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Writing Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Be honest and authentic with your feelings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Don't worry about grammar or structure - just write</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Include details about your day, emotions, and thoughts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Use keywords like "happy", "grateful", "anxious" to help track your moods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Reflect on what you're grateful for or what you learned</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
};

export default CreateEntry;
