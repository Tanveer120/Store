import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const UserList = ({ token }) => {
  const [users, setUsers] = useState([]);
  // State to track the ban reason for each user (keyed by user id)
  const [banReasons, setBanReasons] = useState({});
  // State for the search term to filter users by email
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/user/list");
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const toggleBan = async (userId, currentStatus, reason = "") => {
    try {
      if (!currentStatus && !reason.trim()) {
        toast.error("Please provide a reason for ban");
        return;
      }
      // Determine endpoint based on current status:
      // If user is not banned (currentStatus false), then ban them.
      const endpoint = currentStatus ? "/api/user/unban" : "/api/user/ban";
      const payload = currentStatus ? { id: userId } : { id: userId, reason };
      const response = await axios.post(backendUrl + endpoint, payload, {
        headers: { token },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        // Clear ban reason after a successful ban
        if (!currentStatus) {
          setBanReasons((prev) => ({ ...prev, [userId]: "" }));
        }
        await fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by email based on searchTerm
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <p className="mb-2 text-left">Users List</p>
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-10 bg-white mb-5 border-b border-gray-300">
        <input
          type="text"
          placeholder="Search by email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full"
        />
      </div>

      <div className="flex flex-col">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_2fr_1.5fr_1fr_1fr_2fr] gap-2 items-center py-1 px-2 border border-gray-300 bg-gray-100 text-sm">
          <div className="w-full text-left font-bold">First Name</div>
          <div className="w-full text-left font-bold">Last Name</div>
          <div className="w-full text-left font-bold">Email</div>
          <div className="w-full text-left font-bold">Phone</div>
          <div className="w-full text-left font-bold">City</div>
          <div className="w-full text-left font-bold">Status</div>
          <div className="w-full text-left font-bold">Action</div>
        </div>

        {/* User List */}
        {filteredUsers.map((user, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_1.5fr_2fr] md:grid-cols-[1fr_1fr_2fr_1.5fr_1fr_1fr_2fr] gap-2 items-center py-1 px-2 border border-gray-300 text-sm"
          >
            <div className="w-full text-left">{user.firstname}</div>
            <div className="w-full text-left">{user.lastname}</div>
            <div className="w-full text-left">{user.email}</div>
            <div className="w-full text-left">{user.phoneNumber}</div>
            <div className="w-full text-left">{user.city || "N/A"}</div>
            <div className="w-full text-left">
              {user.isBanned ? "Banned" : "Active"}
            </div>
            <div className="w-full text-left">
              {user.isBanned ? (
                <div className="flex flex-col-2 items-center justify-end gap-2">
                  {/* Tooltip for ban reason */}
                  <div className="group relative inline-block">
                    <span className="cursor-pointer rounded-full bg-gray-300 px-3.5 py-2 text-xs text-gray-700">
                      i
                    </span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max bg-gray-700 text-white text-xs p-2 rounded">
                      {user.banReason || "No reason provided"}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBan(user._id, true)}
                    className="cursor-pointer text-gray-900 hover:text-white px-1 py-2 bg-blue-200 hover:bg-blue-500 border border-blue-300"
                  >
                    Unban
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-start gap-2">
                  <input
                    type="text"
                    placeholder="Ban reason"
                    value={banReasons[user._id] || ""}
                    onChange={(e) =>
                      setBanReasons({
                        ...banReasons,
                        [user._id]: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300"
                  />
                  <button
                    onClick={() =>
                      toggleBan(user._id, false, banReasons[user._id] || "")
                    }
                    className="cursor-pointer text-gray-900 hover:text-white px-3 py-2 bg-red-200 hover:bg-red-500 border border-red-300"
                  >
                    Ban
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UserList;
