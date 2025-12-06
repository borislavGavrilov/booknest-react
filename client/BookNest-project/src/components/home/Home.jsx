import { Link } from "react-router";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="flex flex-col items-center text-center mt-16 px-6 py-20 bg-white shadow-lg rounded-xl max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-800 mb-4">
          Welcome to BookNest
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mb-8 leading-relaxed">
          Explore and share amazing books from all genres. Discover fantasy,
          mystery, romance, and more in our growing collection. Join our
          community of book lovers and dive into the world of literature.
        </p>
        <Link
          to="/catalog"
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700 transition font-medium shadow-md"
        >
          Explore Catalog
        </Link>
      </section>

      {/* Optional Featured Section */}
      <section className="mt-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            Fantasy Books
          </h3>
          <p className="text-gray-600 text-sm">
            Dive into epic worlds full of magic, dragons, and heroic quests.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            Mystery & Thriller
          </h3>
          <p className="text-gray-600 text-sm">
            Solve mysteries and uncover secrets with gripping suspense.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            Romance & Drama
          </h3>
          <p className="text-gray-600 text-sm">
            Experience heartfelt stories and captivating relationships.
          </p>
        </div>
      </section>
    </div>
  );
}
