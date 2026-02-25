import { Navigate } from "react-router";

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />; // hoặc 403
  }

  return children;
}
