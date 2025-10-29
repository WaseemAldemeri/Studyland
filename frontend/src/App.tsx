import { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState<[unknown]>();
  useEffect(() => {
    fetch("https://localhost:5001/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <>
      <h1>Studyland</h1>
      <ol>
        {users?.map((u) => (
          <li key={u.id}>{u.displayName}</li>
        ))}
      </ol>
    </>
  );
}

export default App;
