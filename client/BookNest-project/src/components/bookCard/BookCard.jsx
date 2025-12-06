import { Link } from "react-router";

export default function BookCard({ genre, imageUrl, pages, title, _id }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col">
      <div className="w-full flex justify-center items-center bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto max-h-72 object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600">{genre}</p>
          <p className="text-gray-500">{pages} pages</p>
        </div>
        <Link
          to={`/catalog/${_id}/details`}
          className="mt-4 inline-block text-green-600 hover:underline font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
