import { SessionsService, UsersService } from "../../api/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

function Dashboard() {

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: UsersService.getUsers,
  });

  const { data: sessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: SessionsService.getSessionsList,
  });

  const queryClient = useQueryClient();

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => SessionsService.deleteSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });

  return (
    <>
      <h1 className="bg-purple-300 text-2xl text-center">Studyland</h1>
      {usersLoading && <div>Users are loading...</div>}
      <ol className="ml-5">
        {users?.map((u) => (
          <li key={u.id} className="font-bold my-2">
            {u.displayName}
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-4">
        {sessions?.map((s) => (
          <div key={s.id} className="flex gap-8 items-center border-2">
            <ul>
              <li>Session: {s.id}</li>
              <li>Started at: {s.startedAt}</li>
              <li>duration: {s.duration}</li>
              <li>durationMs: {s.durationMs}</li>
              <li>topic: {s.topic.title}</li>
              <li>username: {s.user.displayName}</li>
            </ul>
            <Button
              onClick={() => deleteSessionMutation.mutate(s.id)}
              disabled={deleteSessionMutation.isPending}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Dashboard;
