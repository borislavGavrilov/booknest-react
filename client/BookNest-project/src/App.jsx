import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import Catalog from "./components/catalog/Catalog";
import Details from "./components/details/Details";
import Create from "./components/create/Create";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import { Route, Routes, useNavigate } from "react-router";
import { useState } from "react";
import Edit from "./components/edit/Edit";
import UserContext from "./context/userContext";
import useFetch from "./components/hooks/useFetch";

function App() {
  const [user, setUser] = useState(null);
  const { request } = useFetch();
  const redirectTo = useNavigate();

  async function onRegister(newUser) {
    const result = await request("/users/register", "POST", newUser);

    setUser(result);
    redirectTo("/login");
  }

  async function onLogin(email, password) {
    console.log(email, password);

    const result = await request("/users/login", "POST", email, password);

    setUser(result);

    redirectTo("/");
    console.log(result);
  }

  const UserContextValues = {
    user,
    isAuthendicated: !!user?.accessToken,
    onRegister,
    onLogin,
  };

  return (
    <UserContext.Provider value={UserContextValues}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:bookId/details" element={<Details />} />
        <Route path="/catalog/:bookId/edit" element={<Edit />} />

        <Route path="/create" element={<Create />} />
        <Route path="/login" element={<Login user={user} />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      <Footer />
    </UserContext.Provider>
  );
}

export default App;
