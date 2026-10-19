import { createBrowserRouter, Navigate } from "react-router";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/interview/:interviewId",
        element: <Interview />
    },
    {
        path: "/login",
        element: <Navigate to="/" replace />
    },
    {
        path: "/register",
        element: <Navigate to="/" replace />
    }
])
