export default function Catalog() {
  return (
    <section className="max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">Book Catalog</h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Статична книга */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
          <img
            src="/images/got1.png"
            alt="A Game of Thrones"
            className="w-full h-64 object-cover"
          />
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-800">
              A Game of Thrones
            </h3>
            <p className="text-gray-600">Epic Fantasy</p>
            <p className="text-gray-500">694 pages</p>
            <a
              href="/details/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
              className="mt-3 inline-block text-indigo-600 hover:underline"
            >
              View Details
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
