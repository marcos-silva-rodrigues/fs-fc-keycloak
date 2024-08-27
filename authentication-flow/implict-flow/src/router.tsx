import { createBrowserRouter } from "react-router-dom";
import { Login } from "./Login";
import { Logout } from "./Logout";
import { Callback } from "./Callback";
import { Admin } from "./Admin";
import { PrivateRoute } from "./PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "login",
    element: <Login />
  },
  {
    path: "logout",
    element: <Logout />
  },
  {
    path: "admin",
    element: <PrivateRoute>
      <Admin />
    </PrivateRoute>
  },
  {
    path: "callback",
    element: <Callback />
  }
]);
