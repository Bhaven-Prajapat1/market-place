import { useEffect, useState } from "react";
import Login from "./features/auth/pages/Login";
import SignUp from "./features/auth/pages/SignUp";

const App = () => {
  const [page, setPage] = useState(
    window.location.hash === "#signup" ? "signup" : "login",
  );

  useEffect(() => {
    const onHash = () =>
      setPage(window.location.hash === "#signup" ? "signup" : "login");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return page === "signup" ? <SignUp /> : <Login />;
};

export default App;
