// src/pages/Profile.jsx
import React, { useState, useEffect, useContext } from "react";
import Title from "../components/Title";
import { toast } from "react-toastify";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const Profile = () => {
  const { backendUrl, token } = useContext(ShopContext);
  
  // Form state holds user profile info
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });

  // Checkbox state to indicate that the profile should be used to auto-fill orders
  const [useForOrders, setUseForOrders] = useState(false);

  // On mount, fetch profile details from DB and update both formData and useForOrders state
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/user/profile/getUpdateProfile`,
          { headers: { token } }
        );
        
        if (response.data.success) {
          const user = response.data.user;
          setFormData({
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            street: user.street || "",
            city: user.city || "",
            state: user.state || "",
            zipcode: user.zipcode || "",
            country: user.country || "",
          });
          setUseForOrders(user.useForOrders || false);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching profile");
      }
    };

    fetchProfile();
  }, [backendUrl, token]);

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setUseForOrders(checked);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // On form submit, update the user record in the DB
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/profile/updateProfile`,
        { ...formData, useForOrders },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(response.data.message || "Error updating profile");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while updating your profile."
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <Title text1={"User "} text2={"Profile"} />
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
        <input
          name="firstname"
          value={formData.firstname}
          onChange={onChangeHandler}
          type="text"
          placeholder="First Name"
          required
          className="border p-2 w-full"
        />
        <input
          name="lastname"
          value={formData.lastname}
          onChange={onChangeHandler}
          type="text"
          placeholder="Last Name"
          required
          className="border p-2 w-full"
        />
        <input
          name="email"
          value={formData.email}
          onChange={onChangeHandler}
          type="email"
          placeholder="Email"
          required
          className="border p-2 w-full"
        />
        <input
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={onChangeHandler}
          type="text"
          placeholder="Phone Number"
          required
          className="border p-2 w-full"
        />
        <input
          name="street"
          value={formData.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street"
          required
          className="border p-2 w-full"
        />
        <div className="flex gap-3">
          <input
            name="city"
            value={formData.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
            required
            className="border p-2 flex-1"
          />
          <input
            name="state"
            value={formData.state}
            onChange={onChangeHandler}
            type="text"
            placeholder="State"
            required
            className="border p-2 flex-1"
          />
        </div>
        <div className="flex gap-3">
          <input
            name="zipcode"
            value={formData.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder="Zipcode"
            required
            className="border p-2 flex-1"
          />
          <input
            name="country"
            value={formData.country}
            onChange={onChangeHandler}
            type="text"
            placeholder="Country"
            required
            className="border p-2 flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="useForOrders"
            checked={useForOrders}
            onChange={onChangeHandler}
          />
          <label htmlFor="useForOrders">
            Use this profile for auto-filling order details
          </label>
        </div>
        <button type="submit" className="bg-black text-white px-8 py-3 text-sm">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
