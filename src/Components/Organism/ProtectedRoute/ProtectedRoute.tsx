import { Navigate, useLocation } from "react-router-dom";
import { ReactElement } from "react";
import { useAppSelector } from "../../../hooks/store.hooks";

interface ProtectedRouteProps {
  children: ReactElement;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
