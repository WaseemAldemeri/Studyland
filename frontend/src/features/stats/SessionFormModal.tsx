// src/features/sessions/SessionFormModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  sessionFormSchema,
  type SessionFormData,
} from "@/lib/schemas/sessionValidation";
import { SessionForm } from "./SessionForm";
import {
  TopicsService,
  SessionsService,
  type SessionDto,
  type CreateSessionDto,
  type UpdateSessionDto,
} from "@/api/generated";
import { parseDurationToMs } from "@/lib/utils/utils";

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: SessionDto | null;
  selectedDay: string;
}

export function SessionFormModal({
  isOpen,
  onClose,
  sessionToEdit,
  selectedDay,
}: SessionFormModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    mode: "onTouched"
  });

  const { data: allTopics = [] } = useQuery({
    queryKey: ["allTopics"],
    queryFn: () => TopicsService.getTopics(),
  });

  useEffect(() => {
    if (isOpen && sessionToEdit) {
      // EDIT MODE: Populate form with existing session data
      form.reset({
        startedAt: new Date(sessionToEdit.startedAt),
        duration: sessionToEdit.duration.slice(0, 5), // Use HH:mm format
        topicId: sessionToEdit.topic.id,
      });
    } else if (isOpen) {
      // CREATE MODE: Reset to defaults for the selected day
      const defaultStartTime = new Date(selectedDay);
      defaultStartTime.setHours(12, 0, 0, 0);
      form.reset({
        startedAt: defaultStartTime,
        duration: "00:45",
        topicId: allTopics.find(t => t.title === "Uncategorized")?.id,
      });
    }
  }, [sessionToEdit, isOpen, form, selectedDay, allTopics]);

  const { mutate: createSession, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreateSessionDto) => SessionsService.createSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessionDetails"] });
      queryClient.invalidateQueries({ queryKey: ["statsData"] });
      onClose();
    },
  });

  const { mutate: updateSession, isPending: isUpdating } = useMutation({
    mutationFn: (data: {sessionId: string, payload: UpdateSessionDto}) => SessionsService.updateSession(data.sessionId, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessionDetails"] });
      queryClient.invalidateQueries({ queryKey: ["statsData"] });
      onClose();
    },
  });

  const onSubmit = async (data: SessionFormData) => {
    const payload: CreateSessionDto = {
      startedAt: data.startedAt.toISOString(),
      durationMs: parseDurationToMs(data.duration),
      topicId: data.topicId,
    };

    if (sessionToEdit) {
      updateSession({ sessionId: sessionToEdit.id, payload: payload });
    } else {
      createSession(payload);
    }

  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rouned-2xl border-4 border-primary">
        <DialogHeader>
          <DialogTitle>
            {sessionToEdit ? "Edit Session" : "Add New Session"}
          </DialogTitle>
          <DialogDescription>
            {sessionToEdit
              ? "Update the details for this study session."
              : `Add a new session for ${selectedDay}.`}
          </DialogDescription>
        </DialogHeader>
        <SessionForm
          form={form}
          onSubmit={onSubmit}
          allTopics={allTopics}
          isSubmitting={isCreating || isUpdating}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
