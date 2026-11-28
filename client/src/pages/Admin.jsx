import { useEffect, useState } from "react";

const roles = ["admin", "agent", "owner", "buyer"];
const statuses = ["active", "disabled"];

export const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not load users");
        if (active) setUsers(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const updateUser = async (userId, field, value) => {
    try {
      setError(null);
      const res = await fetch(`/api/admin/users/${userId}/${field}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not update user");
      setUsers((current) =>
        current.map((item) => (item._id === userId ? data : item)),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading users...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-3 py-8">
      <h1 className="text-3xl font-semibold mb-6">User Administration</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="w-full text-left">
          <thead className="border-b">
            <tr>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="p-3">{item.username}</td>
                <td className="p-3">{item.email}</td>
                <td className="p-3">
                  <select
                    className="border rounded p-2"
                    value={item.role}
                    onChange={(event) =>
                      updateUser(item._id, "role", event.target.value)
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <select
                    className="border rounded p-2"
                    value={item.status}
                    onChange={(event) =>
                      updateUser(item._id, "status", event.target.value)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
