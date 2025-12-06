import { useNavigate } from "react-router";
import useFetch from "../hooks/useFetch";

export default function Create() {
  const navigate = useNavigate();
  const { request } = useFetch();

  async function onSubmitHandler(formData) {
    const data = Object.fromEntries(formData);

    data._createdOn = new Date();

    await request("/data/books", "POST", data);

    navigate("/catalog");
  }

  return (
    <section className="max-w-3xl mx-auto mt-20 px-4">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Add a New Book
      </h2>

      <form
        action={onSubmitHandler}
        className="bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-6"
      >
        {/* Title */}
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1 text-gray-600 font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Book title"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
            required
          />
        </div>

        {/* Author */}
        <div className="flex flex-col">
          <label htmlFor="author" className="mb-1 text-gray-600 font-medium">
            Author
          </label>
          <input
            id="author"
            name="author"
            type="text"
            placeholder="Author's name"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
            required
          />
        </div>

        {/* Genre */}
        <div className="flex flex-col">
          <label htmlFor="genre" className="mb-1 text-gray-600 font-medium">
            Genre
          </label>
          <input
            id="genre"
            name="genre"
            type="text"
            placeholder="Genre"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
            required
          />
        </div>

        {/* Pages */}
        <div className="flex flex-col">
          <label htmlFor="pages" className="mb-1 text-gray-600 font-medium">
            Pages
          </label>
          <input
            id="pages"
            name="pages"
            type="number"
            placeholder="Number of pages"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
            required
          />
        </div>

        {/* Published Date */}
        <div className="flex flex-col">
          <label htmlFor="date" className="mb-1 text-gray-600 font-medium">
            Published Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
            required
          />
        </div>

        {/* Image URL */}
        <div className="flex flex-col">
          <label htmlFor="imageUrl" className="mb-1 text-gray-600 font-medium">
            Image URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="text"
            placeholder="Book cover image URL"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
            required
          />
        </div>

        {/* Summary */}
        <div className="flex flex-col">
          <label htmlFor="summary" className="mb-1 text-gray-600 font-medium">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows="5"
            placeholder="Write a short summary"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition font-semibold shadow-md"
        >
          Add Book
        </button>
      </form>
    </section>
  );
}
