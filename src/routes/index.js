/* eslint-disable react/react-in-jsx-scope */
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/login";
import { Registration } from "../pages/registration/Registration";
import AuthLayout from "../components/layouts/AuthLayout";
import { AdminSettingProvider } from "../context/AdminSettingContext";
import { UserManagement } from "../pages/adminSetting/UserManagement/UserManagement";
import AdminSetting from "../pages/adminSetting/AdminSetting";
import { CouncilManagement } from "../pages/adminSetting/CouncilManagement/CouncilManagement";

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
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "/admin-setting",
        element: (
          <AdminSettingProvider>
            {/* <DirectoryProvider> */}
              <AdminSetting />
            {/* </DirectoryProvider> */}
          </AdminSettingProvider>
        ),
        children: [
          // {
          //   element: <FileManagement />,
          // },
          // {
          //   path: "schedule",
          //   element: <FileManagement />,
          // },
          // {
          //   path: "organization",
          //   element: <OrgManagement />,
          // },
          {
            path: "user",
            element: <UserManagement />,
          },
          {
            path: "council",
            element: <CouncilManagement />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/conversation" />,
      },
    ],
  },
]);
export default router;
