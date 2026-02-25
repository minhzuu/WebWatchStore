import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("accessToken"); // kiểm tra token

  if (token) {
    return <Navigate to="/home" />; // nếu đã login => redirect về home
  }

  return children; // chưa login => cho vào route
}
