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

        <div className="flex gap-6 text-gray-700 items-center flex-wrap md:flex-nowrap">
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
