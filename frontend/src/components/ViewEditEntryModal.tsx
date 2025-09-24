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
import { 
  FileText, 
  Loader2, 
  Edit3, 
  Save, 
  Trash2, 
  X, 
  Calendar,
  Clock 
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

interface ViewEditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  onSuccess: () => void;
}

export function ViewEditEntryModal({ isOpen, onClose, entry, onSuccess }: ViewEditEntryModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  // Initialize edit values when entry changes or modal opens
  useState(() => {
    if (entry && isOpen) {
      setEditTitle(entry.title);
      setEditContent(entry.content);
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setErrors({});
    }
  });

  if (!entry) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};

    if (!editTitle.trim()) {
      newErrors.title = "Title is required";
    } else if (editTitle.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!editContent.trim()) {
      newErrors.content = "Content is required";
    } else if (editContent.length < 10) {
      newErrors.content = "Content must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setErrors({});
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await api.put(`/journal/${entry._id}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      
      if (response.data.status) {
        toast({
          variant: "success",
          title: "Success! ✨",
          description: "Your journal entry has been updated successfully.",
        });
        setIsEditing(false);
        onSuccess();
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to update journal entry",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update journal entry";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      console.error("Error updating journal entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await api.delete(`/journal/${entry._id}`);
      
      if (response.data.status) {
        toast({
          variant: "success",
          title: "Deleted",
          description: "Your journal entry has been deleted successfully.",
        });
        setShowDeleteConfirm(false);
        onSuccess();
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to delete journal entry",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete journal entry";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      console.error("Error deleting journal entry:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isDeleting) {
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Entry" : "Journal Entry"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Make changes to your journal entry" : "View and manage your journal entry"}
          </DialogDescription>
        </DialogHeader>

        {showDeleteConfirm ? (
          // Delete Confirmation
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Delete Journal Entry</h3>
                <p className="text-muted-foreground">
                  Are you sure you want to delete this journal entry? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="min-w-[100px]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : isEditing ? (
          // Edit Mode
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-base font-medium">
                Title
              </Label>
              <Input
                id="edit-title"
                placeholder="What's on your mind today?"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isSubmitting}
                className="text-base"
              />
              {errors.title && (
                <p className="text-sm font-medium text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content" className="text-base font-medium">
                Content
              </Label>
              <Textarea
                id="edit-content"
                placeholder="Pour your heart out..."
                className="min-h-[250px] text-base leading-relaxed resize-none"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                {errors.content && (
                  <p className="text-sm font-medium text-destructive">{errors.content}</p>
                )}
                <span className="ml-auto">{editContent.length} characters</span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Entry
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-6">
            {/* Entry Title */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">
                {entry.title}
              </h2>
            </div>

            {/* Entry Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Created: {formatDate(entry.createdAt)}</span>
              </div>
              {entry.updatedAt !== entry.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Updated: {formatDate(entry.updatedAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{entry.content.length} characters</span>
              </div>
            </div>

            {/* Entry Content */}
            <div className="prose prose-gray max-w-none">
              <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                {entry.content}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Entry
              </Button>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={handleEdit}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Entry
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}