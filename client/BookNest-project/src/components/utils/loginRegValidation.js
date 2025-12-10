export default function validateLogin(values) {
  const errors = {};
  if (!values?.email?.trim()) {
    errors.email = "Email is required";
    return errors;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (values?.email && !emailRegex.test(values.email)) {
    errors.email = "Invalid email format";
    return errors;
  }
  if (values?.email?.length > 50) {
    errors.email = "Email cannot exceed 50 characters";
    return errors;
  }
  if (!values?.password?.length) {
    errors.password = "Password is required";
    return errors;
  }
  if (values?.password?.length < 6) {
    errors.password = "Password must be at least 6 characters long";
    return errors;
  }
  if (values?.password?.length > 50) {
    errors.password = "Password cannot exceed 50 characters";
    return errors;
  }
  if (values?.repass?.length === 0) {
    errors.repass = "Please confirm your password";
    return errors;
  }
  if (values?.password !== values?.repass) {
    errors.repass = "Passwords do not match";
    return errors;
  }

  return errors;
}
