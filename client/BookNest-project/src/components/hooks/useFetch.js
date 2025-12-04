import { useContext } from "react";
import UserContext from "../../context/userContext";

const baseUrl = "http://localhost:3030";

export default function useFetch() {
  const { user, isAuthendicated } = useContext(UserContext);

  const request = async (url, method = "GET", data = null, config = {}) => {
    const options = {
      method,
      headers: {},
    };

    if (data) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(data);
    }

    const token = config.accessToken || (isAuthendicated && user?.accessToken);

    if (token) {
      options.headers["X-Authorization"] = token;
    }

    const response = await fetch(`${baseUrl}${url}`, options);

    if (response.status === 204) return null;

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response.json();
  };

  return { request };
}
