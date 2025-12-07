import { useContext } from "react";
import { Link } from "react-router";
import UserContext from "../../context/userContext";

export default function Header() {
  const { user } = useContext(UserContext);
  const navLinkClass =
    "hover:text-green-600 transition duration-300 font-medium";

  return (
    <header className="bg-linear-to-r from-green-50 via-white to-green-50 shadow-md">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-6">
        <Link to="/" className="text-3xl font-extrabold text-green-600">
          BookNest
        </Link>

        <div className="flex items-center gap-6 text-gray-700 flex-wrap md:flex-nowrap">
          <Link to="/" className={navLinkClass}>
            Home
          </Link>
          <Link to="/catalog" className={navLinkClass}>
            Catalog
          </Link>

          {user ? (
            <>
              <Link to="/create" className={navLinkClass}>
                Add Book
              </Link>

              <Link to="/logout" className={navLinkClass}>
                Logout
              </Link>

              <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full shadow-sm border border-green-300 animate-fadeIn">
                <span className="text-green-700 font-medium text-sm">
                  {user.email}
                </span>
                <span className="text-green-600 text-lg">📚</span>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={navLinkClass}>
                Login
              </Link>
              <Link to="/register" className={navLinkClass}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
