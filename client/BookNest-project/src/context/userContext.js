import { createContext } from "react";

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
});

export default UserContext;
