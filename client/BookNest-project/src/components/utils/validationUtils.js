export default function validate(values) {
  const errors = {};

  if (!values.title.trim()) {
    errors.title = "Title is required";
  }

  if (values.title.length < 3) {
    errors.title = "Title must be at least 3 characters long";
  }

  if (!values.author.trim()) {
    errors.author = "Author is required";
  }

  if (values.author.length < 2) {
    errors.author = "Author must be at least 2 characters long";
  }

  if (!values.genre.trim()) {
    errors.genre = "Genre is required";
  }

  if (!values.imageUrl.trim()) {
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

  if (!values.date.trim()) {
    errors.date = "Publication date is required";
  }

  if (!values.summary.trim()) {
    errors.summary = "Summary is required";
  }
  return errors;
}
