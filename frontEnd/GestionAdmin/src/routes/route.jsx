import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../components/login";
import Dashboard from "../components/dashboard";
import ProtectedRoute from "../components/ProtectedRoute";

import Stats from "../components/Stats";
import Comments from "../components/Comments";
import Posts from "../components/Posts";
import Reservation from "../components/reservations";


const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Stats /> },            
      { path: "comments", element: <Comments /> },    
      { path: "posts", element: <Posts /> },   
      { path: "reservations", element: <Reservation /> } ,     
    ],
  },
]);

export default router;
