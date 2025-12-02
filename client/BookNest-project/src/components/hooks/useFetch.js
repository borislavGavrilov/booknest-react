const baseUrl = "http://localhost:3030";

export default function useFetch() {
  const request = async (url, method, data) => {
    let options = {};

    if (method) {
      options.method = method;
    }

    if (data) {
      options.headers = {
        "content-type": "application/json",
      };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${baseUrl}${url}`, options);

    if (!response.ok) {
      alert("Problem in request");
      return;
    }

    const result = await response.json();

    return result;
  };
  return {
    request,
  };
}
