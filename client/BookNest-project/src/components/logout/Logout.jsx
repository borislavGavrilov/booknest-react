import { useContext, useEffect } from "react";
import UserContext from "../../context/userContext";
import { useNavigate } from "react-router";

export default function Logout() {
  const { onLogout } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    onLogout()
      .then(() => navigate("/"))
      .catch(() => {
        alert("Logout Problem");
        navigate("/");
      });
  }, [navigate]);

  return null;
}
