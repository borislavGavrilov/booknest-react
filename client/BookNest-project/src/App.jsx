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

function App() {
  const [user, setUser] = useState(null);
  const redirectTo = useNavigate();

  async function onRegister(data) {
    const request = await fetch("http://localhost:3030/users/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await request.json();

    setUser(result);

    console.log(result);
    redirectTo("/login");
  }

  function onLogin(params) {}

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
        <Route
          path="/login"
          element={<Login user={user} onLogin={onLogin} />}
        />
        <Route path="/register" element={<Register />} />
      </Routes>

      <Footer />
    </UserContext.Provider>
  );
}

export default App;
