import { useNavigate } from "react-router";

export default function Create() {
  const navigate = useNavigate();
  async function onSubmitHandler(params) {
    params.preventDefault();
    const formData = new FormData(params.target);
    const data = Object.fromEntries(formData);

    data._createdOn = new Date();

    const result = await fetch("http://localhost:3030/jsonstore/games", {
      method: "POST",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const response = await result.json();
    console.log(response);

    navigate("/catalog");
  }
  return (
    <>
      <section className="max-w-3xl mx-auto mt-20 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Add New Book
        </h2>
        <form
          className="flex flex-col gap-5 bg-white p-8 rounded-2xl shadow-lg"
          onSubmit={onSubmitHandler}
        >
          <div className="flex flex-col">
            <label htmlFor="title" className="mb-1 text-gray-600 font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="Enter book title"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="genre" className="mb-1 text-gray-600 font-medium">
              Genre
            </label>
            <input
              name="genre"
              id="genre"
              type="text"
              placeholder="Enter genre"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="pages" className="mb-1 text-gray-600 font-medium">
              Pages
            </label>
            <input
              name="pages"
              id="pages"
              type="number"
              placeholder="Number of pages"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="date" className="mb-1 text-gray-600 font-medium">
              Published Date
            </label>
            <input
              name="date"
              id="date"
              type="date"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
              required
            />
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
              type="text"
              placeholder="Enter image URL"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="summary" className="mb-1 text-gray-600 font-medium">
              Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows="5"
              placeholder="Write a short summary"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-md transition"
              required
            />
          </div>

          <button
            type="submit"
            onSubmit={onSubmitHandler}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition font-semibold shadow-md"
          >
            Add Book
          </button>
        </form>
      </section>
    </>
  );
}
