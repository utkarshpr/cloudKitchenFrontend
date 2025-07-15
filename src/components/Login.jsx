import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import homeImage from '../pic/home.jpg';
import Footer from "./Footers";
import { toast } from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [userType, setUserType] = useState("customer");
  const allowedAdminEmails = ["upravind19@gmail.com"];

  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            localStorage.setItem("idToken", response.credential);
            
            const backendResponse = await api.post("/auth/google", {
              idToken: response.credential,
            });
            localStorage.setItem("cloudAuth", backendResponse.data.token);

            // Decode Google ID Token to extract user info
            const parts = response.credential.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              localStorage.setItem("cloudUser", JSON.stringify(payload));
            } else {
              console.error("Invalid ID token structure");
            }

            const user = JSON.parse(localStorage.getItem("cloudUser"));
            console.log(user);

            // Show success toast
           console.log("Login Successful 🎉");

            if (userType === "admin") {
              if (allowedAdminEmails.includes(user.email)) {
                navigate("/admin/dashboard");
              } else {
                toast.error("You are not authorized for admin panel.");
              }
            } else {
              navigate("/home");
            }
          } catch (error) {
            console.error("Login failed", error);
            toast.error("Login Failed ❌");
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "pill",
        text: "signin_with",
      });
    }
  }, [navigate, userType]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between">
      <img src={homeImage} alt="Cafe Hero" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 flex flex-col justify-center items-center flex-grow text-center px-4">
        <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg">Welcome to Cloud Kitchen</h1>
        <p className="text-white mt-4 text-lg md:text-xl">Freshly cooked, delivered with love ☕🍽️</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-10 w-full flex justify-center pb-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl px-6 py-6 w-[90%] max-w-sm text-center">
          <h2 className="text-xl font-bold mb-4 text-yellow-800">Sign in to Order</h2>
          <div className="flex justify-center gap-2 mb-4">
            <button onClick={() => setUserType("customer")} className={`px-4 py-2 rounded-full font-medium transition ${userType === "customer" ? "bg-yellow-400 text-black hover:bg-yellow-500" : "border border-yellow-400 text-yellow-800 hover:bg-yellow-50"}`}>Customer</button>
            <button onClick={() => setUserType("admin")} className={`px-4 py-2 rounded-full font-medium transition ${userType === "admin" ? "bg-yellow-400 text-black hover:bg-yellow-500" : "border border-yellow-400 text-yellow-800 hover:bg-yellow-50"}`}>Admin</button>
          </div>
          <div ref={googleButtonRef} className="flex justify-center"></div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}

export default Login;
