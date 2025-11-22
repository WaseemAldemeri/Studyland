import { type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DurationInput } from "@/components/shared/DurationInput"; 
import { type DailyGoalFormData } from "@/lib/schemas/dailyGoalValidation";

interface DailyGoalFormProps {
  form: UseFormReturn<DailyGoalFormData>;
  onSubmit: (data: DailyGoalFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function DailyGoalForm({
  form,
  onSubmit,
  isSubmitting,
  onCancel,
}: DailyGoalFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Daily Goal (HH:mm)</FormLabel>
              <FormControl>
                <DurationInput 
                  placeholder="03:00" 
                  {...field} 
                  autoFocus // Nice UX touch
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Update Goal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}