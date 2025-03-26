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
  const { backendUrl, token, delivery_fee, products } = useContext(ShopContext);
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
  const { state } = useLocation();
  const selectedItems = state?.selectedItems || [];
  const userId = localStorage.getItem("userId");

  console.log("Received selectedItems in PlaceOrder:", selectedItems);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/user/profile/getUpdateProfile`,
          { headers: { token } }
        );
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
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const removeOrderedItemsFromCart = async () => {
    try {
      // For each selected item, call the update endpoint with quantity = 0 to remove it
      await Promise.all(
        selectedItems.map((item) =>
          axios.post(
            `${backendUrl}/api/cart/update`,
            { productId: item.product._id, size: item.size, quantity: 0, userId },
            { headers: { token } }
          )
        )
      );
    } catch (error) {
      console.error("Error removing items from cart:", error);
      // Optionally, show a toast warning if removal fails
      toast.error("Some items could not be removed from the cart.");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const orderItems = selectedItems
        .map((item) => {
          console.log("item:", item);
          const productData = products.find(
            (product) => product._id === item.product._id
          );
          console.log("productData:", productData);
          return productData
            ? {
                id: productData._id,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                size: item.size,
                quantity: item.quantity,
              }
            : null;
        })
        .filter(Boolean);

      console.log("orderItems:", orderItems);

      const subtotal = orderItems.reduce(
        (acc, curr) => acc + curr.price * curr.quantity,
        0
      );
      const finalAmount = subtotal + delivery_fee;
      if (finalAmount <= 0) {
        toast.error("Calculated order amount is zero.");
        return;
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: finalAmount,
        method,
      };
      console.log(orderData);
      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        orderData,
        { headers: { token } }
      );

      if (response.data.success) {
        // Remove ordered items from the persistent cart
        await removeOrderedItemsFromCart();

        toast.success("Order placed successfully!");
        navigate("/orders");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY " text2="INFORMATION" />
        </div>
        <div className="flex gap-3">
          <input
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First Name"
            required
          />
          <input
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last Name"
            required
          />
        </div>
        <input
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email"
          required
        />
        <input
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
          required
        />
        <div className="flex gap-3">
          <input
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
            required
          />
          <input
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border rounded py-1.5 px-3.5 w-full"
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
            className="border rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Zipcode"
            required
          />
          <input
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
            required
          />
        </div>
        <input
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone No."
          required
        />
      </div>

      <div className="mt-8">
        <CartTotal selectedItems={selectedItems} />
        <div className="mt-12">
          <Title text1="PAYMENT " text2="METHOD" />
          <div className="flex gap-3 flex-col lg:flex-row">
            {["stripe", "razorpay", "cod"].map((payMethod) => (
              <div
                key={payMethod}
                onClick={() => setMethod(payMethod)}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === payMethod ? "bg-green-400" : ""
                  }`}
                ></p>
                <p className="text-gray-400 text-sm font-medium mx-4">
                  {payMethod.toUpperCase()}
                </p>
              </div>
            ))}
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
