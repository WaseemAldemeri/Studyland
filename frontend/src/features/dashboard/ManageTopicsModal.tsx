import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { TopicDto } from "@/api/generated";

interface ManageTopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: TopicDto[];
  isHidden: (id: string) => boolean;
  onHide: (id: string) => void;
  onUnhide: (id: string) => void;
  onUnhideAll: () => void;
}

export function ManageTopicsModal({
  isOpen,
  onClose,
  topics,
  isHidden,
  onHide,
  onUnhide,
  onUnhideAll,
}: ManageTopicsModalProps) {
  const hiddenCount = topics.filter((t) => isHidden(t.id)).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Topics</DialogTitle>
          <DialogDescription>
            Hidden topics stay out of the picker but still keep their stats.
            Toggle the eye to show or hide them.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-1 overflow-y-auto py-2">
          {topics.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No topics yet.
            </p>
          )}
          {topics.map((t) => {
            const hidden = isHidden(t.id);
            return (
              <div
                key={t.id}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-3 py-2 transition-colors",
                  hidden ? "bg-muted/50" : "hover:bg-muted/40"
                )}
              >
                <span
                  className={cn(
                    "truncate text-sm",
                    hidden && "text-muted-foreground line-through"
                  )}
                >
                  {t.title}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 shrink-0 gap-1.5 text-xs"
                  onClick={() => (hidden ? onUnhide(t.id) : onHide(t.id))}
                >
                  {hidden ? (
                    <>
                      <EyeOff className="size-3.5" /> Show
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5" /> Hide
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {hiddenCount > 0 && (
          <Button variant="outline" className="w-full" onClick={onUnhideAll}>
            Show all hidden ({hiddenCount})
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
