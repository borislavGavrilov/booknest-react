import { useContext } from "react";
import { Link } from "react-router";
import UserContext from "../../context/userContext";

export default function Header() {
  const { user } = useContext(UserContext);

  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          BookNest
        </Link>

        <div className="flex gap-6 text-gray-700">
          <Link to="/" className="hover:text-indigo-600 transition">
            Home
          </Link>
          <Link to="/catalog" className="hover:text-indigo-600 transition">
            Catalog
          </Link>

          {user ? (
            <>
              <Link to="/create" className="hover:text-indigo-600">
                Add Book
              </Link>
              <Link to="/logout" className="hover:text-indigo-600 transition">
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-600 transition">
                Login
              </Link>
              <Link to="/register" className="hover:text-indigo-600 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
