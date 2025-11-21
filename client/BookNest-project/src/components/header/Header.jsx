import { Link } from "react-router";

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          BookNest
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-6 text-gray-700">
          <Link to="/" className="hover:text-indigo-600 transition">
            Home
          </Link>
          <Link to="/catalog" className="hover:text-indigo-600 transition">
            Catalog
          </Link>
          <Link to="/login" className="hover:text-indigo-600 transition">
            Login
          </Link>
          <Link to="/register" className="hover:text-indigo-600 transition">
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}
