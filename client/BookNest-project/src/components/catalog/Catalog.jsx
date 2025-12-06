import { useEffect, useState } from "react";
import BookCard from "../bookCard/BookCard";
import useFetch from "../hooks/useFetch";

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const { request } = useFetch();

  useEffect(() => {
    request("/data/books")
      .then((result) => {
        if (!result) {
          setBooks([]);
          return;
        }
        setBooks(result);
      })
      .catch((err) => alert(err));
  }, []);

  return (
    <section className="max-w-6xl mx-auto mt-12 px-4">
      <h2 className="text-3xl font-bold text-green-600 mb-8 text-center">
        Explore Our Book Collection
      </h2>

      {books.length === 0 ? (
        <div className="text-center mt-20 text-gray-500 text-xl">
          There are no books added yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <BookCard key={book._id} {...book} />
          ))}
        </div>
      )}
    </section>
  );
}
