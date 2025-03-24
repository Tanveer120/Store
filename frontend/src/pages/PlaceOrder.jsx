// src/pages/PlaceOrder.jsx
import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/frontend_assets/assets";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { navigate, backendUrl, token, setCartItems, delivery_fee, products } = useContext(ShopContext);
  const [method, setMethod] = useState("cod");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });
  const navigateHook = useNavigate();
  const { state } = useLocation();
  // Extract selectedItems from the passed state; fallback to an empty array if none provided
  const selectedItems = state?.selectedItems || [];
  
  // Retrieve userId from localStorage (ensure it's stored on login)
  const userId = localStorage.getItem("userId");
  
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData(data => ({ ...data, [name]: value }));
  };
  
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      let orderItems = [];
      // Use only selectedItems to build the order
      selectedItems.forEach((item) => {
        const productData = products.find(product => product._id === item.id);
        if (productData) {
          // Clone product data (using _doc if available) and add size and quantity info
          const clonedProduct = productData._doc ? { ...productData._doc } : { ...productData };
          clonedProduct.size = item.size;
          clonedProduct.quantity = item.quantity;
          orderItems.push(clonedProduct);
        }
      });
      
      if (orderItems.length === 0) {
        toast.error("No items selected for checkout");
        return;
      }
      
      // Calculate the final amount
      const subtotal = orderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
      const finalAmount = subtotal + delivery_fee;
      if (finalAmount <= 0) {
        toast.error("Calculated order amount is zero");
        return;
      }
      
      // Retrieve userId from localStorage
      const userId = localStorage.getItem("userId"); // Ensure this is saved during login
  
      let orderData = {
        userId,
        address: formData,
        items: orderItems,
        amount: finalAmount,
      };
  
      // Only handling COD for now
      if (method === 'cod') {
        const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
        if (response.data.success) {
          // Update the cart: remove only the selected items
          setCartItems((prevCart) => {
            let updatedCart = { ...prevCart };
            selectedItems.forEach((item) => {
              if (updatedCart[item.id]) {
                // Remove the size from the product's cart data
                delete updatedCart[item.id][item.size];
                // If no sizes remain for that product, remove the product key
                if (Object.keys(updatedCart[item.id]).length === 0) {
                  delete updatedCart[item.id];
                }
              }
            });
            return updatedCart;
          });
          navigateHook('/orders');
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  
  

  // On mount, fetch profile details to pre-fill form fields
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile/getUpdateProfile`, {
          headers: { token },
        });
        if (response.data.success) {
          if(response.data.user.useForOrders===true){
            setFormData({
              firstName: response.data.user.firstname || "",
              lastName: response.data.user.lastname || "",
              email: response.data.user.email || "",
              phone: response.data.user.phoneNumber || "",
              street: response.data.user.street || "",
              city: response.data.user.city || "",
              state: response.data.user.state || "",
              zipcode: response.data.user.zipcode || "",
              country: response.data.user.country || "",
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching profile");
      }
    };

    fetchProfile();
  }, [backendUrl, token]);
  
  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY "} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First Name"
            required
          />
          <input
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last Name"
            required
          />
        </div>
        <input
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email"
          required
        />
        <input
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
          required
        />
        <div className="flex gap-3">
          <input
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
            required
          />
          <input
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
            required
          />
        </div>
        <div className="flex gap-3">
          <input
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Zipcode"
            required
          />
          <input
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
            required
          />
        </div>
        <input
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone No."
          required
        />
      </div>

      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal selectedItems={selectedItems.length ? selectedItems : undefined} />
        </div>
        <div className="mt-12">
          <Title text1={"PAYMENT "} text2={"METHOD"} />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div onClick={() => setMethod("stripe")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "stripe" ? "bg-green-400" : ""}`}></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div onClick={() => setMethod("razorpay")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "razorpay" ? "bg-green-400" : ""}`}></p>
              <img className="h-5 mx-4" src={assets.razorpay_logo} alt="Razorpay" />
            </div>
            <div onClick={() => setMethod("cod")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "cod" ? "bg-green-400" : ""}`}></p>
              <p className="text-gray-400 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button type="submit" className="bg-black text-white px-16 py-3 text-sm">
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
