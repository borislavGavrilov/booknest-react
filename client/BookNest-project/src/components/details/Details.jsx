import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import UserContext from "../../context/userContext";
import useFetch from "../hooks/useFetch";
import { useNavigate } from "react-router";

export default function Details() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const { user } = useContext(UserContext);
  const { request } = useFetch();
  const redirect = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3030/data/books/${bookId}`)
      .then((res) => res.json())
      .then((data) => setBook(data))
      .catch((err) => console.error("Error fetching book details:", err));
  }, [bookId]);

  if (!book) {
    return (
      <div className="text-center mt-20 text-gray-600 text-xl">
        Loading book details...
      </div>
    );
  }

  const deleteBookHandler = async () => {
    alert("Are you sure you want to delete this book? ");

    try {
      await request(`/data/books/${bookId}`, "DELETE");
      redirect("/catalog");
    } catch (error) {
      alert("Cant delete this booj", error.message);
    }
  };

  return (
    <section className="max-w-4xl mx-auto mt-20 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book Image */}
        <div className="w-full md:w-1/3 flex justify-center items-center bg-gray-100 rounded-lg shadow-lg overflow-hidden">
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-auto max-h-96 object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {book.title}
            </h2>
            <p className="text-gray-600 mb-2">
              <strong>Genre:</strong> {book.genre}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Pages:</strong> {book.pages}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Published:</strong> {book.date}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Author:</strong> {book.author}
            </p>
            <p className="text-gray-700 mb-6">{book.summary}</p>
          </div>

          {user && (
            <div className="flex flex-wrap gap-4 mb-6">
              <Link
                to={`/catalog/${bookId}/edit`}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Edit
              </Link>
              <button
                onClick={deleteBookHandler}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
              <button
                onClick={() => alert("Liked!")}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Like ❤️
              </button>
            </div>
          )}

          <Link
            to="/catalog"
            className="inline-block text-green-600 hover:underline font-medium"
          >
            &larr; Back to Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
