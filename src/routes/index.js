/* eslint-disable react/react-in-jsx-scope */
import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import { CouncilManagement } from "../pages/adminSetting/CouncilManagement/CouncilManagement";
import { QuestionManagement } from "../pages/adminSetting/QuestionManagement/QuestionManagement";
import { TopiclManagement } from "../pages/adminSetting/TopicManagement/TopicManagement";
import { UserManagement } from "../pages/adminSetting/UserManagement/UserManagement";
import Login from "../pages/login";
import { Registration } from "../pages/registration/Registration";
import { SponsorshipManagement } from "../pages/adminSetting/SponsorshipManagement/SponsorshipManagement";

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
    element: <Navigate to="/" />,
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "user",
        element: <UserManagement />,
      },
      {
        path: "council",
        element: <CouncilManagement />,
      },
      {
        path: "topic",
        element: <TopiclManagement />,
      },
      {
        path: "question",
        element: <QuestionManagement />,
      },
      {
        path: "sponsorship",
        element: <SponsorshipManagement />,
      },
    ],
  },
]);
export default router;
