// src/features/sessions/SessionForm.tsx
import { type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { type SessionFormData } from "@/lib/schemas/sessionValidation";
import { type TopicDto } from "@/api/generated";
import { DurationInput } from "@/components/shared/DurationInput"; 

interface SessionFormProps {
  form: UseFormReturn<SessionFormData>;
  onSubmit: (data: SessionFormData) => void;
  allTopics: TopicDto[];
  isSubmitting: boolean;
  onCancel: () => void;
}

export function SessionForm({
  form,
  onSubmit,
  allTopics,
  isSubmitting,
  onCancel,
}: SessionFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Topic Selector --- */}
        <FormField
          control={form.control}
          name="topicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Topic</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic to study" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="h-5 w-full"><FormMessage /></div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* --- Start Time Input --- */}
          <FormField
            control={form.control}
            name="startedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Start Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toTimeString().slice(0, 5)
                        : ""
                    }
                    onChange={(e) => {
                      const time = e.target.value;
                      // When the time input changes, we only update the hours and minutes
                      // of our existing Date object to preserve the day.
                      const newDate = new Date(field.value);
                      const [hours, minutes] = time.split(":");
                      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                      field.onChange(newDate);
                    }}
                  />
                </FormControl>

                <div className="h-5 w-full"><FormMessage /></div>
              </FormItem>
            )}
          />

          {/* --- Duration Input --- */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Duration (HH:mm)</FormLabel>
                <FormControl>
                  <DurationInput placeholder="HH:mm" {...field} />
                </FormControl>
                <div className="h-5 w-full"><FormMessage /></div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Session"}
          </Button>
        </div>
      </form>
    </Form>
  );
}