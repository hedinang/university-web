/* eslint-disable react/react-in-jsx-scope */
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/login";
import { Registration } from "../pages/registration/Registration";

const router = createBrowserRouter([
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Registration />,
  },
  {
    path: "*",
    element: <Navigate to="/login" />,
  },
]);
export default router;
