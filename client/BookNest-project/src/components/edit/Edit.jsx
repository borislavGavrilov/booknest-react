import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useFetch from "../hooks/useFetch";
import useForm from "../hooks/useForm";
import validate from "../utils/validationUtils.js";
const initialValues = {
  title: "",
  author: "",
  genre: "",
  pages: "",
  date: "",
  imageUrl: "",
  summary: "",
};
export default function Edit() {
  const { bookId } = useParams();
  const { request } = useFetch();
  const navigate = useNavigate();
  const [error, setErrors] = useState(null);

  const { values, setValues, changeHandler, errors } = useForm(
    submitHandler,
    initialValues,
    validate
  );

  useEffect(() => {
    fetch(`http://localhost:3030/data/books/${bookId}`)
      .then((response) => response.json())
      .then((data) => setValues(data));
  }, [bookId, setValues]);

  async function submitHandler() {
    try {
      if (Object.keys(errors).length > 0) {
        setErrors("Please fix the validation errors before submitting.");
        return;
      }

      request(`/data/books/${bookId}`, "PUT", values);
      setErrors(null);
      navigate("/catalog");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <>
      <section className="max-w-3xl mx-auto mt-20 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Add New Book
        </h2>
        <form
          className="flex flex-col gap-5 bg-white p-8 rounded-2xl shadow-lg"
          action={submitHandler}
        >
          <div className="flex flex-col">
            <label htmlFor="title" className="mb-1 text-gray-600 font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={values.title}
              onChange={changeHandler}
              placeholder="Enter book title"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
            />
            {errors.title && <p className="text-red-500">{errors.title}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="author" className="mb-1 text-gray-600 font-medium">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={values.author || ""}
              onChange={changeHandler}
              placeholder="Enter author name"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
            />
            {errors.author && <p className="text-red-500">{errors.author}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="genre" className="mb-1 text-gray-600 font-medium">
              Genre
            </label>
            <input
              name="genre"
              id="genre"
              type="text"
              value={values.genre}
              onChange={changeHandler}
              placeholder="Enter genre"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
            />
            {errors.genre && <p className="text-red-500">{errors.genre}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="pages" className="mb-1 text-gray-600 font-medium">
              Pages
            </label>
            <input
              name="pages"
              id="pages"
              type="number"
              value={values.pages}
              onChange={changeHandler}
              placeholder="Number of pages"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
            />
            {errors.pages && <p className="text-red-500">{errors.pages}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="date" className="mb-1 text-gray-600 font-medium">
              Published Date
            </label>
            <input
              name="date"
              id="date"
              value={values.date}
              onChange={changeHandler}
              type="date"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
            />
            {errors.date && <p className="text-red-500">{errors.date}</p>}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="imageUrl"
              className="mb-1 text-gray-600 font-medium"
            >
              Image URL
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              value={values.imageUrl}
              onChange={changeHandler}
              type="text"
              placeholder="Enter image URL"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
            />
            {errors.imageUrl && (
              <p className="text-red-500">{errors.imageUrl}</p>
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
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
            />
            {errors.summary && <p className="text-red-500">{errors.summary}</p>}
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition font-semibold shadow-md"
          >
            Edit Book
          </button>
        </form>
      </section>
    </>
  );
}
