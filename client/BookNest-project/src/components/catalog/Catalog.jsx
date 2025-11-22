import { useEffect, useState } from "react";
import BookCard from "../bookCard/BookCard";

export default function Catalog() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3030/jsonstore/games")
      .then((res) => res.json())
      .then((data) => {
        const booksArray = Object.values(data);
        setBooks(booksArray);
      })
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  return (
    <section className="max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">Book Catalog</h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Статична книга */}

        {books.map((book) => (
          <BookCard key={book._id} {...book} />
        ))}
      </div>
    </section>
  );
}
