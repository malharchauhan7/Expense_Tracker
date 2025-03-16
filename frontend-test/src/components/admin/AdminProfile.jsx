import React, { useEffect, useState } from "react";
import { FaCamera, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useForm } from "react-hook-form"; // Add this import
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";

const formatDate = (dateString) => {
  try {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : format(date, "MMM dd, yyyy");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "N/A";
  }
};

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(null);
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      email: "",
      member_since: "",
    },
  });

  useEffect(() => {
    HandleGetUserDetailsById();
  }, []);

  const HandleGetUserDetailsById = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        toast.error("No User Found!");
        return;
      }

      const resp = await axios.get("/api/users/" + user_id);

      setValue("name", resp.data.name);
      setValue("email", resp.data.email);
      setValue("member_since", resp.data.created_at);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch user details");
    }
  };

  const onSubmit = async (data) => {
    try {
      const user_id = localStorage.getItem("user_id");
      await axios.put(`/api/users/${user_id}`, {
        name: data.name,
        email: data.email,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Toaster />
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            {/* Profile Image */}
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={
                    image ||
                    "https://png.pngtree.com/png-vector/20190710/ourlarge/pngtree-user-vector-avatar-png-image_1541962.jpg"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <FaCamera className="text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Action Buttons */}
            {/* <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
            >
              {isEditing ? (
                <>
                  <FaTimes />
                  <span>Cancel Editing</span>
                </>
              ) : (
                <>
                  <FaEdit />
                  <span>Edit Profile</span>
                </>
              )}
            </button> */}
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("name", { required: "Name is required" })}
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  disabled={true} // Email should always be disabled
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("email")}
                />
              </div>

              {/* Member Since Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  disabled={true}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formatDate(watch("member_since"))}
                  readOnly
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  {isEditing ? (
                    <>
                      <FaTimes />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <FaEdit />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>

                {isEditing && (
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaSave />
                    <span>Save Changes</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Account Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatDate(watch("member_since"))}
              </p>
            </div>
          </div>
        </div>

        {/* <button className="w-full py-3 bg-red-500 my-5 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
          Deactivate Account
        </button> */}
      </div>
    </div>
  );
};

export default AdminProfile;
