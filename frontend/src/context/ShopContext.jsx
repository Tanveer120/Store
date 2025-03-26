// src/context/ShopContext.jsx
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 40;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select product Size");
      return;
    }
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { userId, itemId, size },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Product added to cart");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // Poll to check if the user is banned
  useEffect(() => {
    const interval = setInterval(async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${backendUrl}/api/user/profile/getUpdateProfile`,
            { headers: { token } }
          );
          if (
            response.data.success &&
            response.data.user &&
            response.data.user.isBanned
          ) {
            toast.error("Your account has been banned. Please contact support.");
            setToken("");
            localStorage.removeItem("token");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error checking banned status:", error);
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    addToCart,
    getProductsData,
    navigate,
    backendUrl,
    token,
    setToken,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
