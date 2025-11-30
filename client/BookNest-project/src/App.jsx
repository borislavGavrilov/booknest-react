import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import Catalog from "./components/catalog/Catalog";
import Details from "./components/details/Details";
import Create from "./components/create/Create";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import { Route, Routes } from "react-router";
import { useState } from "react";
import Edit from "./components/edit/Edit";

function App() {
  const [user, setUser] = useState(null);

  function authnUser(userData) {
    setUser({ userData });
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:bookId/details" element={<Details />} />
        <Route path="/catalog/:bookId/edit" element={<Edit />} />

        <Route path="/create" element={<Create />} />
        <Route
          path="/login"
          element={<Login user={user} onLogin={authnUser} />}
        />
        <Route path="/register" element={<Register onRegister={authnUser} />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
