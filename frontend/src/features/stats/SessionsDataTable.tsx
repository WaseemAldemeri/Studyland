// src/components/stats/SessionsDataTable.tsx

import { useState } from "react"; // Added for sorting state
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SessionsService, type SessionDto } from "@/api/generated";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  // --- NEW IMPORTS FOR SORTING ---
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarIcon,
} from "lucide-react"; // Added ArrowUpDown icon
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { SessionFormModal } from "./SessionFormModal";

interface SessionsDataTableProps {
  selectedDay: string | null;
  handleDaySelect: (date: string) => void;
}

export function SessionsDataTable({
  selectedDay,
  handleDaySelect,
}: SessionsDataTableProps) {
  const queryClient = useQueryClient();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  // This will hold the session data when editing, or be null when creating
  const [sessionToEdit, setSessionToEdit] = useState<SessionDto | null>(null);

  const handleOpenEditModal = (session: SessionDto) => {
    setSessionToEdit(session);
    setIsFormModalOpen(true);
  };
  
  const handleOpenCreateModal = () => {
    setSessionToEdit(null); // Ensure we are in "create" mode
    setIsFormModalOpen(true);
  };

  // --- NEW: State to manage sorting ---
  const [sorting, setSorting] = useState<SortingState>([]);

  // --- DATA FETCHING (no changes) ---
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessionDetails", selectedDay],
    queryFn: () => {
      // Small fix: Ensure we pass an object to the generated service
      return SessionsService.getSessions(selectedDay!);
    },
  });

  // --- MUTATIONS (no changes) ---
  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => SessionsService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessionDetails"] });
      queryClient.invalidateQueries({ queryKey: ["statsData"] });
    },
  });

  // --- MODIFIED: Column definitions with sortable headers ---
  const columns: ColumnDef<SessionDto>[] = [
    {
      accessorKey: "topic.title",
      // We now use a function for the header to make it interactive
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2"
          >
            Topic
            {!column.getIsSorted() ? (
              <ArrowUpDown className="h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        );
      },
    },
    {
      accessorKey: "duration",
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2"
          >
            Duration (HH:mm)
            {!column.getIsSorted() ? (
              <ArrowUpDown className="h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        );
      },
      cell: ({row}) => {const [hours, minutes] = row.original.duration.split(":")
        return `${hours}:${minutes}`
      }
    },
    {
      accessorKey: "startedAt",
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2"
          >
            Start Time
            {!column.getIsSorted() ? (
              <ArrowUpDown className="h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        );
      },
      cell: ({ row }) => new Date(row.original.startedAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}),
    },
    {
      id: "actions",
      header: () => <div className="text-right mr-4">Actions</div>, // Add a header for the actions column
      cell: ({ row }) => {
        const session = row.original;
        return (
          // --- MODIFIED: Replaced Dropdown with direct buttons ---
          <>
          <div className="flex items-center justify-end gap-2 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleOpenEditModal(session)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Session</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => deleteMutation.mutate(session.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Session</span>
            </Button>
          </div>
          </>
        );
      },
    },
  ];

  // --- MODIFIED: Updated table instance with sorting state ---
  const table = useReactTable({
    data: sessions ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Add the sorting state and logic
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // --- RENDER (no major changes, just uses the new table instance) ---
  return (
    <div className="min-h-[500px] bg-secondary/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-primary">
          {selectedDay
            ? `Sessions for ${selectedDay}`
            : "Select a day to see details"}
        </h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDay && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDay ? (
                  format(selectedDay, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-white w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(selectedDay!)}
                defaultMonth={new Date(selectedDay!)}
                onSelect={(date) =>
                  handleDaySelect(date?.toLocaleDateString() as string)
                }
              />
            </PopoverContent>
          </Popover>
          {selectedDay !== new Date().toLocaleDateString() && (
            <Button
              onClick={() => handleDaySelect(new Date().toLocaleDateString())}
              className="text-xs"
            >
              Today
            </Button>
          )}
        </div>
        <Button
          disabled={!selectedDay}
          onClick={handleOpenCreateModal}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </div>

     <SessionFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          sessionToEdit={sessionToEdit}
          selectedDay={selectedDay!}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading session details...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No sessions found for this day.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
