import { Link } from "react-router";

export default function NotFound() {
  return (
    <section className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Oops! The page you're looking for doesn't exist.
      </h1>

      <Link
        to="/"
        className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition font-semibold shadow-md"
      >
        Back to Home
      </Link>
    </section>
  );
}
