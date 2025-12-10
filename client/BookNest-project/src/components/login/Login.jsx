import { useContext } from "react";
import UserContext from "../../context/userContext";
import { useState } from "react";
import useForm from "../hooks/useForm";
import validateLogin from "../utils/validationLogin.js";

const initialValues = {
  email: "",
  password: "",
};

export default function Login() {
  const { onLogin } = useContext(UserContext);
  const [errorState, setErrorState] = useState({});

  const { values, changeHandler } = useForm(
    onSubmit,
    initialValues,
    validateLogin
  );

  async function onSubmit() {
    const { email, password } = values;
    const errors = validateLogin(values);
    setErrorState(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setErrorState(null);

    try {
      const result = await onLogin({ email, password });

      if (!result) {
        setErrorState(
          "Login failed. Please check your email and password and try again."
        );
        return;
      }
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <section className="max-w-md mx-auto mt-24 px-4">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Login
      </h2>

      <form
        action={onSubmit}
        className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-gray-600 font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={changeHandler}
            id="email"
            placeholder="Enter your email"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition"
          />
          {errorState?.email ? (
            <p className="text-red-500 mt-1 text-sm">{errorState.email}</p>
          ) : (
            ""
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="mb-1 text-gray-600 font-medium">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={changeHandler}
            id="password"
            placeholder="Enter your password"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition"
          />
          {errorState?.password ? (
            <p className="text-red-500 mt-1 text-sm">{errorState.password}</p>
          ) : (
            ""
          )}
        </div>
        {typeof errorState === "string" && (
          <p className="text-red-600 text-center font-medium">{errorState}</p>
        )}

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
