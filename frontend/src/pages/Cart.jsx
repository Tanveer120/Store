// src/pages/Cart.jsx
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  // selectedItems is an object; key format: `${productId}-${size}`, value: boolean
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const prodId in cartItems) {
        for (const size in cartItems[prodId]) {
          if (cartItems[prodId][size] > 0) {
            tempData.push({
              id: prodId,
              size,
              quantity: cartItems[prodId][size],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  const handleCheckboxChange = (id, size) => {
    setSelectedItems((prev) => ({
      ...prev,
      [`${id}-${size}`]: !prev[`${id}-${size}`],
    }));
  };

  // Derive filteredCartData from cartData using selectedItems
  const filteredCartData = cartData.filter(
    (item) => selectedItems[`${item.id}-${item.size}`]
  );

  const proceedToCheckout = () => {
    if (filteredCartData.length === 0) {
      toast.error("Please select at least one product to proceed to checkout.");
      return;
    }
    navigate("/place-order", { state: { selectedItems: filteredCartData } });
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR "} text2={"CART"} />
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item.id);
          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[0.5fr_4fr_0.5fr_0.5fr] sm:grid-cols-[0.5fr_4fr_2fr_0.5fr] items-center gap-4"
            >
              {/* Checkbox for selecting the item */}
              <input
                type="checkbox"
                checked={!!selectedItems[`${item.id}-${item.size}`]}
                onChange={() => handleCheckboxChange(item.id, item.size)}
              />
              <div className="flex items-start gap-6">
                <img className="w-16 sm:w-20" src={productData.image[0]} alt={productData.name} />
                <div>
                  <p className="text-xs sm:text-lg font-medium">{productData.name}</p>
                  <div className="flex items-center gap-5 mt-2">
                    <p className="flex gap-2">
                      <strike>{currency}{productData.rate}</strike>
                      {currency}{productData.price}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">{item.size}</p>
                  </div>
                </div>
              </div>
              <input
                onChange={(e) =>
                  e.target.value === "" || e.target.value === "0"
                    ? null
                    : updateQuantity(item.id, item.size, Number(e.target.value))
                }
                className="border max-w-[50px] sm:max-w-[80px] px-2 py-1"
                type="number"
                min={1}
                defaultValue={item.quantity}
              />
              <img
                onClick={() => updateQuantity(item.id, item.size, 0)}
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
          {/* Pass filteredCartData to CartTotal if any items are selected */}
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
