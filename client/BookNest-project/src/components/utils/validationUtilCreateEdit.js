export default function validate(values) {
  const errors = {};

  if (!values?.username?.trim()) {
    errors.username = "Username is required";
  }
  if (values?.username?.length < 3) {
    errors.username = "Username must be at least 3 characters long";
  }
  if (values?.username?.length > 20) {
    errors.username = "Username cannot exceed 20 characters";
  }

  if (values?.password?.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }
  if (values?.password?.length > 50) {
    errors.password = "Password cannot exceed 50 characters";
  }

  if (!values?.title?.trim()) {
    errors.title = "Title is required";
  }

  if (values?.title?.length < 3) {
    errors.title = "Title must be at least 3 characters long";
  }

  if (!values?.author?.trim()) {
    errors.author = "Author is required";
  }

  if (values?.author?.length < 2) {
    errors.author = "Author must be at least 2 characters long";
  }

  if (!values?.genre?.trim()) {
    errors.genre = "Genre is required";
  }

  if (!values?.imageUrl?.trim()) {
    errors.imageUrl = "Image URL is required";
  }

  if (!values.pages || Number(values.pages) <= 0) {
    errors.pages = "Pages must be a positive number";
  }

  if (Number(values.pages) < 50) {
    errors.pages = "Pages must be at least 50";
  }

  if (Number(values.pages) > 10000) {
    errors.pages = "Pages cannot exceed 10,000";
  }

  if (!values?.date?.trim()) {
    errors.date = "Publication date is required";
  }

  if (!values?.summary?.trim()) {
    errors.summary = "Summary is required";
  }
  return errors;
}
