import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import EmailVerify from "./pages/EmailVerify";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

function App() {

  return (
    <>
      <Header/>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/email-verify" element={<EmailVerify />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
    <Footer/>

    </>
  )
}

export default App
