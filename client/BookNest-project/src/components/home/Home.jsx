import BookCard from "../bookCard/BookCard";
import { useEffect, useState } from "react";

export default function Home() {
  const [latestBooks, setLatestBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3030/jsonstore/games")
      .then((res) => res.json())
      .then((data) => {
        const booksArray = Object.values(data);
        const sortedBooks = booksArray.sort(
          (a, b) => new Date(b._createdOn) - new Date(a._createdOn)
        );
        setLatestBooks(sortedBooks.slice(0, 3));
      })
      .catch((err) => console.error("Error fetching latest books:", err));
  }, []);

  console.log(latestBooks);

  return (
    <div>
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mt-20 px-4">
        <h1 className="text-5xl font-bold text-indigo-700 mb-6">
          Welcome to BookNest
        </h1>

        <p className="text-gray-600 text-lg max-w-2xl mb-8">
          Discover, share, and explore your favorite books. A place for fantasy
          lovers, fans of Game of Thrones, House of the Dragon, and all book
          enthusiasts.
        </p>

        <a
          href="/catalog"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700 transition"
        >
          Explore Catalog
        </a>
      </section>

      {/* Latest Books Section */}
      <section className="max-w-6xl mx-auto mt-20 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Latest Added Books
        </h2>{" "}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {latestBooks.map((book) => (
            <BookCard key={book._id} {...book} />
          ))}
        </div>
      </section>
    </div>
  );
}
