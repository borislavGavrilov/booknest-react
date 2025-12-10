import { useNavigate } from "react-router";
import useFetch from "../hooks/useFetch";
import useForm from "../hooks/useForm";
import validate from "../utils/validationUtilCreateEdit.js";
import { useState } from "react";

const initialValues = {
  title: "",
  author: "",
  genre: "",
  pages: "",
  date: "",
  imageUrl: "",
  summary: "",
};

export default function Create() {
  const navigate = useNavigate();
  const { request } = useFetch();
  const [error, setError] = useState(null);

  const { values, changeHandler, errors } = useForm(
    onSubmitHandler,
    initialValues,
    validate
  );

  console.log(errors);

  async function onSubmitHandler(values) {
    const data = Object.fromEntries(values);
    setError(errors);
    console.log(error);

    data._createdOn = new Date();

    if (Object.keys(errors).length > 0) {
      return;
    }

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
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1 text-gray-600 font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={values.title}
            onChange={changeHandler}
            type="text"
            placeholder="Book title"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
          />
          {error?.title && (
            <p className="text-red-500 text-sm mt-1">{error?.title}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="author" className="mb-1 text-gray-600 font-medium">
            Author
          </label>
          <input
            id="author"
            name="author"
            value={values.author}
            onChange={changeHandler}
            type="text"
            placeholder="Author's name"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
          />
          {error?.author && (
            <p className="text-red-500 text-sm mt-1">{error?.author}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="genre" className="mb-1 text-gray-600 font-medium">
            Genre
          </label>
          <input
            id="genre"
            name="genre"
            value={values.genre}
            onChange={changeHandler}
            type="text"
            placeholder="Genre"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
          />
          {error?.genre && (
            <p className="text-red-500 text-sm mt-1">{error?.genre}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="pages" className="mb-1 text-gray-600 font-medium">
            Pages
          </label>
          <input
            id="pages"
            name="pages"
            value={values.pages}
            onChange={changeHandler}
            type="number"
            placeholder="Number of pages"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
          />
          {error?.pages && (
            <p className="text-red-500 text-sm mt-1">{error?.pages}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="date" className="mb-1 text-gray-600 font-medium">
            Published Date
          </label>
          <input
            id="date"
            name="date"
            value={values.date}
            onChange={changeHandler}
            type="date"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
          />
          {error?.date && (
            <p className="text-red-500 text-sm mt-1">{error?.date}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="imageUrl" className="mb-1 text-gray-600 font-medium">
            Image URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            value={values.imageUrl}
            onChange={changeHandler}
            type="text"
            placeholder="Book cover image URL"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
          />
          {error?.imageUrl && (
            <p className="text-red-500 text-sm mt-1">{error?.imageUrl}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="summary" className="mb-1 text-gray-600 font-medium">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            value={values.summary}
            onChange={changeHandler}
            rows="5"
            placeholder="Write a short summary"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-md transition"
          />
          {error?.summary && (
            <p className="text-red-500 text-sm mt-1">{error?.summary}</p>
          )}
        </div>

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
