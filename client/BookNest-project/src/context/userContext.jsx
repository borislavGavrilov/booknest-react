import { createContext, useState } from "react";
import useFetch from "../components/hooks/useFetch";
import { useNavigate } from "react-router";

const UserContext = createContext({
  isAuthendicated: false,
  user: {
    email: "",
    password: "",
    _createdOn: 0,
    _id: "",
    accessToken: "",
  },
  onRegister() {},
  onLogin() {},
  onLogout() {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const { request } = useFetch();
  const redirectTo = useNavigate();

  async function onRegister(newUser) {
    const result = await request("/users/register", "POST", newUser);

    setUser(result);
    redirectTo("/login");
  }

  async function onLogin(email, password) {
    const result = await request("/users/login", "POST", email, password);

    setUser(result);

    redirectTo("/");
  }

  async function onLogout() {
    const token = user?.accessToken;
    return request("/users/logout", "GET", null, {
      accessToken: token,
    }).finally(() => setUser(null));
  }

  const UserContextValues = {
    user,
    isAuthendicated: !!user?.accessToken,
    onRegister,
    onLogin,
    onLogout,
  };

  return (
    <UserContext.Provider value={UserContextValues}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
