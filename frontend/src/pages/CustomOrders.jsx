// src/components/CustomOrders.jsx
import React, { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';

const CustomOrders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        backendUrl + '/api/order/customorder/user',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        // Save the custom orders in reverse order for recent-first display
        setOrderData(response.data.orders.reverse());
      } else {
        console.log(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, []);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={'MY '} text2={'CUSTOM ORDERS'} />
      </div>

      <div>
        {orderData.map((order, index) => (
          <div
            key={index}
            className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-start gap-6 text-sm">
              <div className="w-16 sm:w-20">
                {/* Display the decal image if available; otherwise fallback to the model image */}
                {order.decal && order.decal.imageUrl ? (
                  <img className="w-full" src={order.decal.imageUrl} alt="Decal" />
                ) : (
                  <img className="w-full" src={order.model.url} alt="Model" />
                )}
              </div>
              <div>
                <p className="sm:text-base font-medium">
                  {order.model.name} - {order.tshirtColor}
                </p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p className="text-lg">{currency}{order.price}</p>
                  <p>Status: {order.status}</p>
                </div>
                <p className="mt-1">
                  Date: <span className="text-gray-400">{new Date(order.date).toDateString()}</span>
                </p>
                <p className="mt-1">
                  Payment: <span className="text-gray-400">{order.paymentMethod}</span>
                </p>
                <p className="mt-1">
                  Decal:{' '}
                  <span className="text-gray-400">
                    {order.decal && order.decal.textContent
                      ? order.decal.textContent
                      : 'Image Decal'}
                  </span>
                </p>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                <p className="text-sm md:text-base">{order.status}</p>
              </div>
              <button onClick={loadOrderData} className="border px-4 py-2 text-sm font-medium rounded-sm">
                Track Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomOrders;
