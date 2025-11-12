// src/components/stats/FilterBar.tsx

import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MultiSelectPopover,
  type MultiSelectOption,
} from "@/components/shared/MultiSelectPopover";
import { type TopicDto, type UserDto } from "@/api/generated";

interface FilterBarProps {
  // Date Range Props
  startDate: Date;
  endDate: Date;
  onDateChange: (newDates: { startDate?: Date; endDate?: Date }) => void;

  // Topic Filter Props
  allTopics: TopicDto[];
  selectedTopicIds: string[];
  onTopicsChange: (selectedIds: string[]) => void;

  // User Filter Props
  allUsers: UserDto[];
  selectedUserIds: string[];
  onUsersChange: (selectedIds: string[]) => void;
}

export function FilterBar({
  startDate,
  endDate,
  onDateChange,
  allTopics,
  selectedTopicIds,
  onTopicsChange,
  allUsers,
  selectedUserIds,
  onUsersChange,
}: FilterBarProps) {
  // Convert the DTOs into the format our MultiSelect component expects
  const topicOptions: MultiSelectOption[] =
    allTopics?.map((topic) => ({
      value: topic.id,
      label: topic.title,
    })) ?? [];

  const userOptions: MultiSelectOption[] =
    allUsers?.map((user) => ({
      value: user.id,
      label: user.displayName,
    })) ?? [];

  return (
    <div className="bg-secondary/50 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-primary mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        
        {/* --- Start Date Picker --- */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-white w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                defaultMonth={startDate}
                onSelect={(date) => onDateChange({ startDate: date })}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* --- End Date Picker --- */}
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-white w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                defaultMonth={endDate}
                onSelect={(date) => onDateChange({ endDate: date })}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* --- Topics Multi-select --- */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Topics</label>
          <MultiSelectPopover
            options={topicOptions}
            selectedValues={selectedTopicIds}
            onSelectionChange={onTopicsChange}
            placeholder="Select topics..."
            itemName="Topics"
          />
        </div>

        {/* --- Users Multi-select --- */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Compare With</label>
          <MultiSelectPopover
            options={userOptions}
            selectedValues={selectedUserIds}
            onSelectionChange={onUsersChange}
            placeholder="Select users..."
            itemName="Users"
          />
        </div>

      </div>
    </div>
  );
}