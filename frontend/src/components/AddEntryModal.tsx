import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/api/api";
import { FileText, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEntryModal({ isOpen, onClose, onSuccess }: AddEntryModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.length < 10) {
      newErrors.content = "Content must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
          variant: "success",
          title: "Success! 🎉",
          description: "Your journal entry has been created successfully.",
        });
        setTitle("");
        setContent("");
        setErrors({});
        onSuccess();
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to create journal entry",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create journal entry";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      console.error("Error creating journal entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setContent("");
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Create New Journal Entry
          </DialogTitle>
          <DialogDescription>
            Share your thoughts, experiences, and reflections. Your journey matters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="What's on your mind today?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="text-base"
            />
            {errors.title && (
              <p className="text-sm font-medium text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium">
              Content
            </Label>
            <Textarea
              id="content"
              placeholder="Pour your heart out... Share your thoughts, feelings, experiences, or anything that comes to mind. This is your safe space to express yourself freely."
              className="min-h-[200px] text-base leading-relaxed resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              {errors.content && (
                <p className="text-sm font-medium text-destructive">{errors.content}</p>
              )}
              <span className="ml-auto">{content.length} characters</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Entry
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}