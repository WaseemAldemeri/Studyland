import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  dailyGoalSchema,
  type DailyGoalFormData,
} from "@/lib/schemas/dailyGoalValidation";
import { DailyGoalForm } from "./DailyGoalForm";
import { UsersService } from "@/api/generated";
import { parseDurationToMs, formatDuration } from "@/lib/utils/utils";

interface DailyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoalMs?: number;
}

export function DailyGoalModal({
  isOpen,
  onClose,
  currentGoalMs,
}: DailyGoalModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<DailyGoalFormData>({
    resolver: zodResolver(dailyGoalSchema),
    defaultValues: {
      duration: "03:00", // Default fallback
    },
  });

  // Reset form when opening with new data
  useEffect(() => {
    if (isOpen && currentGoalMs) {
      // Convert MS back to "HH:mm" for the input
      // Assuming you have a helper or simple math:
      const totalMinutes = Math.floor(currentGoalMs / 60000);
      form.reset({
        duration: formatDuration(totalMinutes),
      });
    }
  }, [isOpen, currentGoalMs, form]);

  const { mutate: updateGoal, isPending } = useMutation({
    mutationFn: (newGoalMs: number) => UsersService.updateDailyGoal(newGoalMs),
    onSuccess: () => {
      // Invalidate the query that fetches the user/guild goals
      queryClient.invalidateQueries({ queryKey: ["guildGoals"] }); 
      // If you store goal on "currentUser" query, invalidate that too
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      onClose();
    },
  });

  const onSubmit = (data: DailyGoalFormData) => {
    const ms = parseDurationToMs(data.duration);
    updateGoal(ms);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-4 border-primary sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Daily Goal</DialogTitle>
          <DialogDescription>
            How long do you want to study today?
          </DialogDescription>
        </DialogHeader>
        <DailyGoalForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}