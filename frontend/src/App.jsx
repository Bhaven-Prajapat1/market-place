import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./features/auth/pages/Login";
import SignUp from "./features/auth/pages/SignUp";
import Home from "./features/home/pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
