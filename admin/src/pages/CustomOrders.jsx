// src/components/CustomOrders.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const CustomOrders = ({ token }) => {
  const [customOrders, setCustomOrders] = useState([]);

  const fetchCustomOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(`${backendUrl}/api/order/customorder/list`, {}, {
        headers: { token }
      });
      if (response.data.success) {
        setCustomOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/order/customorder/status`, 
        { orderId, status: event.target.value }, 
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchCustomOrders();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  return (
    <div>
      <h3>Custom Order Page</h3>
      <div>
        {customOrders.slice().reverse().map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            key={index}
          >
            {/* Show decal image if available; otherwise fallback to a default icon */}
            <img className="w-12" src={order.decal.imageUrl || assets.parcel_icon} alt="Custom Order" />
            <div>
              <p className="font-medium">
                {order.model.name} <span className="text-sm">(T-Shirt Color: {order.tshirtColor})</span>
              </p>
              <p className="mt-2">
                Decal: {order.decal.textContent ? order.decal.textContent : 'Image Decal'}
              </p>
              <div className="mt-2">
                <p>{order.address.firstName + " " + order.address.lastName}</p>
                <p>{order.address.street + ", "}</p>
                <p>
                  {order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}
                </p>
                <p>{order.address.phone}</p>
              </div>
            </div>
            <div>
              <p className="text-sm">Price: {currency}{order.price}</p>
              <p className="mt-2">Payment: {order.payment ? 'Done' : 'Pending'}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <select onChange={(event) => statusHandler(event, order._id)} value={order.status} className="p-2 font-semibold">
              <option value="Order Placed">Order Placed</option>
              <option value="Processing">Processing</option>
              <option value="Customizing">Customizing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomOrders;
