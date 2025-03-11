import React, { useState } from "react";
import { FaCamera, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
    occupation: "Software Developer",
    location: "New York, USA",
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
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
            <button
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
            </button>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key}
                </label>
                {isEditing ? (
                  key === "bio" ? (
                    <textarea
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                  ) : (
                    <input
                      type={key === "email" ? "email" : "text"}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )
                ) : (
                  <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">
                    {value}
                  </p>
                )}
              </div>
            ))}

            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaSave />
                <span>Save Changes</span>
              </button>
            )}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Account Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">156</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-green-600">$2,450</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-2xl font-bold text-purple-600">2023</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
