import { Link } from "react-router";

export default function BookCard({
  date,
  genre,
  imageUrl,
  pages,
  summary,
  title,
  _id,
  _createdOn,
  _ownerId,
}) {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <img src={imageUrl} alt={title} className="w-full h-64 object-cover" />
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600">{genre}</p>
          <p className="text-gray-500">{pages}</p>
          <Link
            to={`/catalog/${_id}/details`}
            className="mt-3 inline-block text-indigo-600 hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </>
  );
}
