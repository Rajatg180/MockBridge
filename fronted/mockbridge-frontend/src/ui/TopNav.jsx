import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import authApi from "../api/authApi";
import { loggedOut } from "../features/auth/authSlice";
import { toastAdded } from "../features/ui/uiSlice";

export default function TopNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      if (authApi?.logoutApi) {
        await authApi.logoutApi();
      }

      dispatch(loggedOut());
      dispatch(
        toastAdded({
          type: "success",
          message: "Logged out successfully",
        })
      );
      navigate("/login");
    } catch (error) {
      dispatch(
        toastAdded({
          type: "error",
          message: error?.response?.data?.message || "Logout failed",
        })
      );
    }
  };

  return (
    <nav>
      <NavLink to="/">Home</NavLink>
      {isAuthenticated ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <NavLink to="/login">Login</NavLink>
      )}
    </nav>
  );
}