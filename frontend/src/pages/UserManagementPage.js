// pages/UserManagementPage.js
import React, { useEffect, useState } from "react";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({}); // Reset field-specific errors

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle multiple validation errors from backend
        if (data.errors) {
          const fieldSpecific = {};
          const generalErrors = [];

          for (const err of data.errors) {
            if (err.toLowerCase().includes("username")) fieldSpecific.username = err;
            else if (err.toLowerCase().includes("password")) fieldSpecific.password = err;
            else if (err.toLowerCase().includes("role")) fieldSpecific.role = err;
            else generalErrors.push(err);
          }

          setFieldErrors(fieldSpecific);
          if (generalErrors.length) setError(generalErrors.join("\n"));
        } else {
          setError(data.error || "Create failed");
        }
        return;
      }

      // Reset form and reload users
      setUsername("");
      setPassword("");
      setRole("viewer");
      setFieldErrors({});
      fetchUsers();
    } catch {
      setError("Error creating user.");
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;

    try {
      await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchUsers();
    } catch {
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👤 User Management</h1>

      <form onSubmit={handleCreate} className="mb-6 bg-white p-4 rounded shadow space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <div className="flex gap-4">
          <div className="w-1/3">
            <input
              type="text"
              placeholder="Username"
              className={`p-2 border rounded w-full ${fieldErrors.username ? 'border-red-500' : ''}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {fieldErrors.username && <p className="text-sm text-red-600">{fieldErrors.username}</p>}
          </div>
          <div className="w-1/3">
            <input
              type="password"
              placeholder="Password"
              className={`p-2 border rounded w-full ${fieldErrors.password ? 'border-red-500' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}
          </div>
          <div className="w-1/3">
            <select
              className={`p-2 border rounded w-full ${fieldErrors.role ? 'border-red-500' : ''}`}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">admin</option>
              <option value="operator">operator</option>
              <option value="viewer">viewer</option>
            </select>
            {fieldErrors.role && <p className="text-sm text-red-600">{fieldErrors.role}</p>}
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          ➕ Create User
        </button>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">👥 Existing Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Username</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Created At</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{new Date(u.created_at).toLocaleString()}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
