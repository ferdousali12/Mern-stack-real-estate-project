import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../context/user-context.js";

export const Header = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("searchTerm") || "",
  );
  const [signingOut, setSigningOut] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/?searchTerm=${encodeURIComponent(term)}` : "/");
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch {
      setUser(null);
      navigate("/");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3 gap-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Ferdous</span>
            <span className="text-slate-700">Estate</span>
          </h1>
        </Link>

        <form
          onSubmit={handleSearch}
          className="bg-slate-100 p-3 rounded-lg flex items-center flex-1 max-w-sm"
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none w-full"
          />
          <button type="submit" aria-label="Search">
            <FaSearch className="text-slate-600" />
          </button>
        </form>

        <ul className="flex gap-4 items-center">
          <Link to="/">
            <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
              Home
            </li>
          </Link>

          <Link to="/about">
            <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
              About
            </li>
          </Link>

          {user ? (
            <>
              {["admin", "agent", "owner"].includes(user.role) && (
                <Link to="/create-listing">
                  <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
                    Create listing
                  </li>
                </Link>
              )}
              {user.role === "admin" && (
                <Link to="/admin">
                  <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
                    Admin
                  </li>
                </Link>
              )}
              <Link to="/profile">
                <li className="text-slate-700 hover:underline cursor-pointer">
                  {user.username}
                </li>
              </Link>
              <li>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-slate-700 hover:underline disabled:opacity-60"
                >
                  {signingOut ? "..." : "Sign out"}
                </button>
              </li>
            </>
          ) : (
            <>
              <Link to="/sign-in">
                <li className="text-slate-700 hover:underline cursor-pointer">
                  Sign in
                </li>
              </Link>
              <Link to="/sign-up">
                <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
                  Sign up
                </li>
              </Link>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};
