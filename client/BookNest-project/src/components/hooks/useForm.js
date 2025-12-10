import { useState } from "react";

export default function useForm(callback, initialValues) {
  const [values, setValues] = useState(initialValues);

  const changeHandler = (e) => {
    setValues((state) => ({
      ...state,
      [e.target.name]: e.target.value,
    }));
  };

  const formAction = (formData) => {
    callback(values, formData);
  };

  return {
    values,
    setValues,
    changeHandler,
    formAction,
  };
}
