import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/frontend_assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import StarRating from '../components/StarRating';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { backendUrl, token, products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  // States for reviews
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const fetchProductData = () => {
    products.forEach((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
      }
    });
  };

  // Fetch existing reviews using Axios
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/review/${productId}`);
      const reviewsArray = Array.isArray(response.data)
        ? response.data
        : response.data.reviews || [];
      setReviews(reviewsArray);
      setCurrentPage(1); // Reset pagination when new reviews are fetched
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  // Calculate average rating whenever reviews change
  useEffect(() => {
    if (reviews.length) {
      const avg = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
      setAverageRating(avg);
    } else {
      setAverageRating(0);
    }
  }, [reviews]);

  useEffect(() => {
    fetchProductData();
    fetchReviews();
  }, [productId, products]);

  // Handle review submission using Axios
  const submitReview = async () => {
    if (reviewRating === 0 || reviewComment.trim() === '') {
      alert('Please provide both a rating and a comment');
      return;
    }
    try {
      const response = await axios.post(
        `${backendUrl}/api/review/`,
        {
          product: productId,
          rating: reviewRating,
          comment: reviewComment,
        },
        { headers: { token } }
      );

      if (response.status === 201 || response.status === 200) {
        // toast.success('Review submitted successfully');
        
        if(response.data.status==400){
          toast.warning(response.data.message);
          setReviewComment('');
        setReviewRating(0);
        fetchReviews();
        }
        else {
          toast.success('Review submitted successfully');
        setReviewComment('');
        setReviewRating(0);
        fetchReviews();
        }
      }
      else if (response.status === 400) {
        toast.warning(response.data.message);
        toast.warning("Cnt do");
      }
      else {
        alert('Error submitting');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  // Pagination logic: Determine the reviews to display on the current page.
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* Product Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Product Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((item, index) => (
              <img 
                onClick={() => setImage(item)} 
                src={item} 
                key={index} 
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'
                alt="Product thumbnail"
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt="Product" />
          </div>
        </div>

        {/* Product Info */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            <StarRating rating={averageRating} />
            <p className='pl-2'>{averageRating.toFixed(1)} ({reviews.length}) </p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => (
                <button 
                  onClick={() => setSize(item)} 
                  className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} 
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => addToCart(productData._id, size)} 
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
          >
            ADD TO CART
          </button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy.</p>
          </div>
        </div>
      </div>

      {/* Description and review section */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews ({reviews.length})</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>{productData.description}</p>
        </div>
      </div>

      {/* Review Submission Form */}
      <div className='mt-10 border px-6 py-6'>
        <h2 className='text-xl mb-4'>Leave a Review</h2>
        <div className='mb-4'>
          <label className='block mb-2'>Rating</label>
          <select 
            value={reviewRating} 
            onChange={(e) => setReviewRating(Number(e.target.value))}
            className='border p-2'
          >
            <option value={0}>Select rating</option>
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Fair</option>
            <option value={3}>3 - Good</option>
            <option value={4}>4 - Very Good</option>
            <option value={5}>5 - Excellent</option>
          </select>
        </div>
        <div className='mb-4'>
          <label className='block mb-2'>Comment</label>
          <textarea 
            value={reviewComment} 
            onChange={(e) => setReviewComment(e.target.value)} 
            className='border p-2 w-full' 
            rows="4"
            placeholder="Write your review here..."
          />
        </div>
        <button 
          onClick={submitReview} 
          className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
        >
          Submit Review
        </button>
      </div>

      {/* Display Existing Reviews with Pagination */}
      <div className='mt-10'>
        <h2 className='text-xl mb-4'>Customer Reviews</h2>
        {currentReviews.length ? (
  currentReviews.map((rev) => (
    <div key={rev._id} className='border-b py-4'>
      <p className='font-semibold'>User: {rev.user.name}</p>
      <div className='flex items-center'>
        <StarRating rating={rev.rating} />
        <span className='ml-2'>{rev.rating} / 5</span>
      </div>
      <p className='text-md'>Comment: {rev.comment}</p>
      <p className='text-xs text-gray-400'>{new Date(rev.createdAt).toLocaleDateString()}</p>
    </div>
  ))
) : (
  <p>No reviews yet. Be the first to review!</p>
)}

        {/* Pagination Controls */}
        {reviews.length > reviewsPerPage && (
          <div className='flex justify-center mt-4 gap-4'>
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className={`px-4 py-2 border rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            >
              Previous
            </button>
            <span className='flex items-center'>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Display Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : <div className='opacity-0'></div>;
};

export default Product;
