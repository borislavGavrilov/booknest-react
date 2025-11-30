import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";

export default function Details(props) {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3030/jsonstore/books/${bookId}`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
      })
      .catch((err) => console.error("Error fetching book details:", err));
  }, [bookId]);

  return (
    <>
      <section className="max-w-4xl mx-auto mt-20 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={book?.imageUrl}
            alt={book?.title}
            className="w-full md:w-1/3 h-auto object-cover rounded-lg shadow-md"
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {book?.title}
            </h2>
            <p className="text-gray-600 mb-2">
              <strong>Genre:</strong> {book?.genre}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Pages:</strong> {book?.pages}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Published:</strong> {book?.date}
            </p>
            <p className="text-gray-700 mb-6">{book?.summary}</p>

            {/* Action buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => alert("Edit book functionality")}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => alert("Delete book functionality")}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
              <button
                onClick={() => alert("Liked!")}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
              >
                Like ❤️
              </button>
            </div>

            <Link
              to="/catalog"
              className="inline-block text-indigo-600 hover:underline"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
