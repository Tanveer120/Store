// src/pages/Login.jsx
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const Login = () => {
  const [currentState, setCurrentState] = useState(localStorage.getItem('registrationState') || "Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [password, setPassword] = useState(localStorage.getItem('password') || '');
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '');
  const [otp, setOtp] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register/initiate", { name, email, password, phoneNumber });
        if (response.data.success) {
          toast.success(response.data.message);
          setCurrentState("Verify OTP");
          localStorage.setItem('registrationState', "Verify OTP");
          localStorage.setItem('name', name);
          localStorage.setItem('email', email);
          localStorage.setItem('password', password);
          localStorage.setItem('phoneNumber', phoneNumber);
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === "Verify OTP") {
        const response = await axios.post(backendUrl + "/api/user/register/complete", { name, email, password, phoneNumber, otp });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success(response.data.message);
          localStorage.removeItem('registrationState');
          localStorage.removeItem('name');
          localStorage.removeItem('email');
          localStorage.removeItem('password');
          localStorage.removeItem('phoneNumber');
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === "Admin Login") {
        const response = await axios.post(backendUrl + "/api/user/admin", { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success(response.data.message);
          navigate("/admin-dashboard");
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Standard user login
        const response = await axios.post(backendUrl + "/api/user/login", { email, password });
        if (response.data.success) {
          // Check if the response indicates the user is banned.
          // This check depends on how your backend sends a ban message.
          if (response.data.message && response.data.message.toLowerCase().includes("banned")) {
            toast.error("Your account has been banned.");
            // Optionally, clear any token from localStorage if already set\n            localStorage.removeItem("token");
            return;
          }
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {currentState === "Login" ? (
        ""
      ) : (
        <>
          {currentState === "Sign Up" && (
            <>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="Name"
                required
              />
              <input
                onChange={(e) => setPhoneNumber(e.target.value)}
                value={phoneNumber}
                type="text"
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="Phone Number"
                required
              />
            </>
          )}
          {currentState === "Verify OTP" && (
            <input
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              type="text"
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Enter OTP"
              required
            />
          )}
        </>
      )}
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
      />
      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p>Forgot your Password?</p>
        {currentState === "Login" ? (
          <>
            <p
              onClick={() => setCurrentState("Sign Up")}
              className="cursor-pointer"
            >
              Create Account
            </p>
            <p
              onClick={() => setCurrentState("Admin Login")}
              className="cursor-pointer"
            >
              Admin Login
            </p>
          </>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Login Here
          </p>
        )}
      </div>
      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login"
          ? "Sign In"
          : currentState === "Sign Up"
          ? "Sign Up"
          : currentState === "Verify OTP"
          ? "Verify OTP"
          : "Admin Sign In"}
      </button>
    </form>
  );
};

export default Login;
