import { useContext } from "react";
import UserContext from "../../context/userContext";

export default function Login() {
  const { onLogin } = useContext(UserContext);

  function handleSubmit(formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    onLogin({ email, password });
  }

  return (
    <section className="max-w-md mx-auto mt-24 px-4">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Login
      </h2>

      <form
        action={handleSubmit}
        className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-gray-600 font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition"
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="mb-1 text-gray-600 font-medium">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition font-semibold shadow-md"
        >
          Login
        </button>
      </form>
    </section>
  );
}
