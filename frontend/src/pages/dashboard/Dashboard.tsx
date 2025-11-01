import { useEffect, useState } from "react";
import {
  SessionsService,
  UsersService,
  type SessionDto,
} from "../../api/generated";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

function Dashboard() {
  const [sessions, setSessions] = useState<SessionDto[]>();
  
  const {data: users, isLoading: usersLoading} = useQuery({queryKey: ["users"], queryFn: UsersService.getUsers});

  useEffect(() => {
    SessionsService.getSessionsList().then((data) =>
      setSessions(data.slice(0, 10))
    );
  }, []);

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
              onClick={() => SessionsService.deleteSession(s.id)}
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

