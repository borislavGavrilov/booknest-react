import { useContext } from "react";
import UserContext from "../../context/userContext";
import useForm from "../hooks/useForm";
import validateRegister from "../utils/loginRegValidation.js";
import { useState } from "react";
const initialValues = {
  email: "",
  password: "",
  repass: "",
};

export default function Register() {
  const { onRegister } = useContext(UserContext);
  const [errorState, setErrorState] = useState({});

  const { values, changeHandler } = useForm(handleSubmit, initialValues);

  async function handleSubmit() {
    const { email, password } = values;

    const errors = validateRegister(values);
    setErrorState(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const result = await onRegister({ email, password });

    if (result === null) {
      setErrorState(
        "Registration failed. A user with the same email already exists."
      );
      return;
    }
  }

  return (
    <section className="max-w-md mx-auto mt-24 px-4">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Register
      </h2>

      <form
        action={handleSubmit}
        className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg"
      >
        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-gray-600 font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={values.email}
            onChange={changeHandler}
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
            id="password"
            name="password"
            value={values.password}
            onChange={changeHandler}
            placeholder="Enter your password"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition"
          />
          {errorState?.password ? (
            <p className="text-red-500 mt-1 text-sm">{errorState.password}</p>
          ) : (
            ""
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="repass" className="mb-1 text-gray-600 font-medium">
            Repeat Password
          </label>
          <input
            type="password"
            id="repass"
            name="repass"
            value={values.repass}
            onChange={changeHandler}
            placeholder="Repeat your password"
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition"
          />
          {errorState?.repass ? (
            <p className="text-red-500 mt-1 text-sm">{errorState.repass}</p>
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
          Register
        </button>
      </form>
    </section>
  );
}
