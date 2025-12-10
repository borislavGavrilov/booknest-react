import { useEffect, useState } from "react";

export default function useLocalStorage() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("userData");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
    } else {
      localStorage.removeItem("userData");
    }
  }, [user, setUser]);
  return [user, setUser];
}
