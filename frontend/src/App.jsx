import { useEffect, useState } from "react";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

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
