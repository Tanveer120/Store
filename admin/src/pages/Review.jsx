// src/pages/AdminReviews.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminReviews = ({ backendUrl, token }) => {
  const [pendingReviews, setPendingReviews] = useState([]);

  const fetchPendingReviews = async () => {
    try {
        // toast.success("Trying");
      const response = await axios.get('http://localhost:4000/api/review/admin/pending', {
        headers: { token },
      });
      // console.log(response.data);
      // Check if response.data is an object with pendingReviews
      const reviewsArray = Array.isArray(response.data)
        ? response.data
          : response.data.pendingReviews || [];
        console.log(reviewsArray);
      setPendingReviews(reviewsArray);
    } catch (error) {
      toast.error("Error fetching pending reviews");
    }
  };
  

  const handleApprove = async (reviewId) => {
    try {
      await axios.patch(`http://localhost:4000/api/review/admin/${reviewId}/approve`, {}, {
        headers: { token },
      });
      toast.success("Review approved");
      fetchPendingReviews();
    } catch (error) {
      toast.error("Error approving review");
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await axios.delete(`http://localhost:4000/api/review/admin/${reviewId}/reject`, {
        headers: { token },
      });
      toast.success("Review rejected");
      fetchPendingReviews();
    } catch (error) {
      toast.error("Error rejecting review");
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  return (
    <div>
      <h2>Pending Reviews</h2>
      {pendingReviews.length ? (
        pendingReviews.map((review) => (
          <div key={review._id} className="border p-4 mb-2">
            <p>
              <strong>User:</strong> {review.user.name}
            </p>
            <p>
              <strong>Product:</strong> {review.product.name}
            </p>
            <p>
              <strong>Rating:</strong> {review.rating}
            </p>
            <p>
              <strong>Comment:</strong> {review.comment}
            </p>
            <button onClick={() => handleApprove(review._id)}>Approve</button>
            <button onClick={() => handleReject(review._id)}>Reject</button>
          </div>
        ))
      ) : (
        <p>No pending reviews.</p>
      )}
    </div>
  );
};

export default AdminReviews;
