import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/user-context.js";

function ProfileForm({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    password: "",
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setError(null);
    setSuccess(false);
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setError(null);
      setSuccess(false);

      const res = await fetch(`/api/user/${user._id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Profile update failed");
      }

      onUpdate(data);
      setFormData((current) => ({ ...current, password: "" }));
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2 mb-7">
        <div className="h-20 w-20 rounded-full bg-slate-300 flex items-center justify-center text-3xl font-semibold text-slate-600">
          {user.username?.charAt(0).toUpperCase()}
        </div>
        <p className="text-slate-600">{user.email}</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          className="border p-3 rounded-lg"
          id="username"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          className="border p-3 rounded-lg"
          id="email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="new password (optional)"
          className="border p-3 rounded-lg"
          id="password"
          value={formData.password}
          onChange={handleChange}
        />
        <button
          disabled={updating}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {updating ? "Updating..." : "Update profile"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-600">Profile updated.</p>}
      </form>

      {["admin", "agent", "owner"].includes(user.role) && (
        <Link
          to="/create-listing"
          className="block mt-7 text-center bg-slate-200 p-3 rounded-lg hover:bg-slate-300"
        >
          Create a listing
        </Link>
      )}
    </>
  );
}

export const Profile = () => {
  const { user, setUser } = useUser();

  if (!user) {
    return <div className="p-3 max-w-lg mx-auto text-center">Loading...</div>;
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Profile</h1>
      <ProfileForm key={user._id} user={user} onUpdate={setUser} />
    </div>
  );
};
