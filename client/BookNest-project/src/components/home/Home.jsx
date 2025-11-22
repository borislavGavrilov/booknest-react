export default function Home() {
  return (
    <section className="flex flex-col items-center text-center mt-20 px-4">
      {/* Заглавие */}
      <h1 className="text-5xl font-bold text-indigo-700 mb-6">
        Welcome to BookNest
      </h1>

      {/* Описание */}
      <p className="text-gray-600 text-lg max-w-2xl mb-8">
        Discover, share, and explore your favorite books. A place for fantasy
        lovers, fans of Game of Thrones, House of the Dragon, and all book
        enthusiasts.
      </p>

      {/* Call-to-Action бутон */}
      <a
        href="/catalog"
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700 transition"
      >
        Explore Catalog
      </a>
    </section>
  );
}
