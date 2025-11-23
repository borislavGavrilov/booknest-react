export default function Login() {
  return (
    <section className="max-w-md mx-auto mt-24 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Login
      </h2>

      <form className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col text-left">
          <label className="font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="flex flex-col text-left">
          <label className="font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>
    </section>
  );
}
