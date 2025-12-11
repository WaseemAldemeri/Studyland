import { TopicsService } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter, Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTopicId: string) => void;
}

export function CreateTopicModal({ isOpen, onClose, onSuccess }: CreateTopicModalProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      // Assuming your API returns the created Topic object or ID
      const result = await TopicsService.createTopic({ title });
      
      toast.success("Topic created successfully");
      
      // 1. Refresh the topics list
      await queryClient.invalidateQueries({ queryKey: ["allTopics"] });
      
      // 2. Clear form and close
      setTitle("");
      if (onSuccess && result) onSuccess(result);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create topic");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic-title">Topic Title</Label>
            <Input
              id="topic-title"
              placeholder="e.g. Cardiology, Algorithms, System Design..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Creating..." : "Create Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}