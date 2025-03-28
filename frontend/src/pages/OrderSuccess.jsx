// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderSuccess = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const session_id = queryParams.get('session_id');
  const orderId = queryParams.get('orderId');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;
    
    const verifyPayment = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/order/verify?session_id=${session_id}&orderId=${orderId}`
        );
        console.log("Verification response:", response.data);
        if (response.data.success) {
          toast.success("Payment confirmed! Order placed successfully.");
          navigate('/orders');
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            // Retry after 3 seconds
            setTimeout(verifyPayment, 3000);
          } else {
            toast.error(response.data.message || "Payment not confirmed.");
          }
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Error verifying payment.");
      } finally {
        setLoading(false);
      }
    };

    if (session_id && orderId) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [session_id, orderId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? <p>Verifying payment...</p> : <p>Redirecting...</p>}
    </div>
  );
};

export default OrderSuccess;
