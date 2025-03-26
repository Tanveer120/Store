// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = "₹";
  const [cartData, setCartData] = useState([]); // Persistent cart from DB
  const [loading, setLoading] = useState(true);
  // selectedItems: key is the cart item's unique _id, value is boolean
  const [selectedItems, setSelectedItems] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch persistent cart from the backend
  const fetchCartData = async () => {
    try {
      if (token) {
        const userId = localStorage.getItem("userId");
        const response = await axios.post(
          `${backendUrl}/api/cart/get`,
          { userId },
          { headers: { token } }
        );
        if (response.data.success) {
          setCartData(response.data.cartData);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Toggle selection using the cart item's _id
  const handleCheckboxChange = (cartItemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [cartItemId]: !prev[cartItemId],
    }));
  };

  // Update cart quantity or remove item (if quantity is 0)
  const updateQuantity = async (productId, size, quantity) => {
    try {
      const userId = localStorage.getItem("userId");
      await axios.post(
        `${backendUrl}/api/cart/update`,
        { productId, size, quantity, userId },
        { headers: { token } }
      );
      toast.success("Cart updated successfully");
      // Refresh cart data after update
      fetchCartData();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Build filtered array of selected cart items
  const filteredCartData = cartData.filter((item) => selectedItems[item._id]);

  const proceedToCheckout = () => {
    const selectedCartItems = cartData.filter((item) => selectedItems[item._id]);
    console.log("Filtered Cart Data before checkout:", selectedCartItems);
    if (selectedCartItems.length === 0) {
      toast.error("Please select at least one product to proceed to checkout.");
      return;
    }
    navigate("/place-order", { state: { selectedItems: selectedCartItems } });
  };

  if (loading) return <p>Loading cart items...</p>;

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR "} text2={"CART"} />
      </div>

      <div>
        {cartData.map((item) => {
          const { _id, product, size, quantity } = item;
          if (!product) return null;
          return (
            <div
              key={_id}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[0.5fr_4fr_0.5fr_0.5fr] sm:grid-cols-[0.5fr_4fr_2fr_0.5fr] items-center gap-4"
            >
              {/* Checkbox keyed by the unique _id */}
              <input
                type="checkbox"
                checked={!!selectedItems[_id]}
                onChange={() => handleCheckboxChange(_id)}
              />
              <div className="flex items-start gap-6">
                <img
                  className="w-16 sm:w-20"
                  src={product.image[0]}
                  alt={product.name}
                />
                <div>
                  <p className="text-xs sm:text-lg font-medium">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-5 mt-2">
                    <p className="flex gap-2">
                      <strike>
                        {currency}
                        {product.rate}
                      </strike>
                      {currency}
                      {product.price}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                      {size}
                    </p>
                  </div>
                </div>
              </div>
              <input
                onChange={(e) =>
                  e.target.value === "" || e.target.value === "0"
                    ? null
                    : updateQuantity(product._id, size, Number(e.target.value))
                }
                className="border max-w-[50px] sm:max-w-[80px] px-2 py-1"
                type="number"
                min={1}
                defaultValue={quantity}
              />
              <img
                onClick={() => updateQuantity(product._id, size, 0)}
                className="w-4 mr-4 sm:w-5 cursor-pointer"
                src={assets.bin_icon}
                alt="Remove"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal selectedItems={filteredCartData} />
          <div className="w-full text-end">
            <button
              onClick={proceedToCheckout}
              className="bg-black text-white text-sm my-8 px-8 py-3"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
