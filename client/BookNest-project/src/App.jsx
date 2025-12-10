import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import Catalog from "./components/catalog/Catalog";
import Details from "./components/details/Details";
import Create from "./components/create/Create";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import { Route, Routes } from "react-router";
import Edit from "./components/edit/Edit";
import PrivateRoutes from "./components/privateRoutes/PriveteRoutes";
import NotFound from "./components/notFound/NotFound";
import Logout from "./components/logout/logout";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />

        <Route path="/catalog/:bookId/details" element={<Details />} />
        <Route
          path="/catalog/:bookId/edit"
          element={
            <PrivateRoutes>
              <Edit />
            </PrivateRoutes>
          }
        />

        <Route
          path="/create"
          element={
            <PrivateRoutes>
              <Create />
            </PrivateRoutes>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
