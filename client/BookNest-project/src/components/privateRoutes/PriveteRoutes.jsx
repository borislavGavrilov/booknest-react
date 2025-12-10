import { Navigate } from "react-router";
import UserContext from "../../context/userContext";
import { useContext } from "react";

export default function PrivateRoutes({ children }) {
  const { isAuthendicated } = useContext(UserContext);

  if (!isAuthendicated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
