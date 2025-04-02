// src/pages/PlaceCustomOrder.jsx
import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Helper function to retrieve a cookie by name
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

const PlaceCustomOrder = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
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
  
  const navigate = useNavigate();

  // Retrieve the custom order data from the cookie and decode it.
  const customOrderCookie = getCookie("customOrder");
  const customOrder = customOrderCookie ? JSON.parse(decodeURIComponent(customOrderCookie)) : {};
  console.log(customOrder)

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Optionally, prefill delivery details from user profile.
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile/getUpdateProfile`, {
          headers: { token },
        });
        if (response.data.success && response.data.user.useForOrders) {
          const user = response.data.user;
          setFormData({
            firstName: user.firstname || "",
            lastName: user.lastname || "",
            email: user.email || "",
            phone: user.phoneNumber || "",
            street: user.street || "",
            city: user.city || "",
            state: user.state || "",
            zipcode: user.zipcode || "",
            country: user.country || "",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching profile");
      }
    };
    fetchProfile();
  }, [backendUrl, token]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        userId,
        address: formData,
        tshirtColor: customOrder.tshirtColor,
        model: customOrder.model,
        decal: customOrder.decal,
        price: customOrder.price,
        status: "Order Placed",
        paymentMethod: method,
        payment: method === "cod" ? false : false // Adjust if needed
      };

      const response = await axios.post(
        `${backendUrl}/api/order/custom-order`,
        orderData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Custom order placed successfully!");
        // Clear the cookie after successful order
        document.cookie = "customOrder=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/custom-orders/list");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to place custom order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY " text2="INFORMATION" />
        </div>
        <div className="flex gap-3">
          <input onChange={onChangeHandler} name="firstName" value={formData.firstName} className="border rounded py-1.5 px-3.5 w-full" type="text" placeholder="First Name" required />
          <input onChange={onChangeHandler} name="lastName" value={formData.lastName} className="border rounded py-1.5 px-3.5 w-full" type="text" placeholder="Last Name" required />
        </div>
        <input onChange={onChangeHandler} name="email" value={formData.email} className="border rounded py-1.5 px-3.5 w-full" type="email" placeholder="Email" required />
        <input onChange={onChangeHandler} name="street" value={formData.street} className="border rounded py-1.5 px-3.5 w-full" type="text" placeholder="Street" required />
        <div className="flex gap-3">
          <input onChange={onChangeHandler} name="city" value={formData.city} className="border rounded py-1.5 px-3.5 w-full" type="text" placeholder="City" required />
          <input onChange={onChangeHandler} name="state" value={formData.state} className="border rounded py-1.5 px-3.5 w-full" type="text" placeholder="State" required />
        </div>
        <div className="flex gap-3">
          <input onChange={onChangeHandler} name="zipcode" value={formData.zipcode} className="border rounded py-1.5 px-3.5 w-full" type="number" placeholder="Zipcode" required />
          <input onChange={onChangeHandler} name="country" value={formData.country} className="border rounded py-1.5 px-3.5 w-full" type="text" placeholder="Country" required />
        </div>
        <input onChange={onChangeHandler} name="phone" value={formData.phone} className="border rounded py-1.5 px-3.5 w-full" type="number" placeholder="Phone No." required />
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Custom Order Summary</h2>
          <p><strong>T-Shirt Color:</strong> {customOrder.tshirtColor}</p>
          <p><strong>Model:</strong> {customOrder.model ? customOrder.model.name : ""}</p>
          <p><strong>Price:</strong> ₹{customOrder.price}</p>
          {customOrder.decal && customOrder.decal.textContent && (
            <p><strong>Text:</strong> {customOrder.decal.textContent}</p>
          )}
        </div>
        <div className="mt-12">
          <Title text1="PAYMENT " text2="METHOD" />
          <div className="flex gap-3 flex-col lg:flex-row">
            {["cod"].map((payMethod) => (
              <div
                key={payMethod}
                onClick={() => setMethod(payMethod)}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === payMethod ? "bg-green-400" : ""}`}></p>
                <p className="text-gray-400 text-sm font-medium mx-4">{payMethod.toUpperCase()}</p>
              </div>
            ))}
          </div>
          <div className="text-right mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-16 py-3 text-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed relative"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "PLACE CUSTOM ORDER"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceCustomOrder;
