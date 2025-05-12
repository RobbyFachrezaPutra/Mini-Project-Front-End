"use client";

import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "@/lib/axiosInstance";

const ProfilePage = () => {
  const router = useRouter();

  const userAuth = useAppSelector((state) => state.auth);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    first_name: "",
    last_name: "",
    email: "",
    profile_picture: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setFormData({
      first_name: storedUser.first_name || "",
      last_name: storedUser.last_name || "",
      email: storedUser.email || "",
      profile_picture: storedUser.profile_picture || "/default-profile.png",
    });
    setLoading(false);
  }, [setFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = getCookie("access_token");

      if (!token) {
        setError("No token found, please log in.");
        return;
      }

      const response = await api.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/profile/edit-profile`, formData);

      localStorage.removeItem("user");
      localStorage.setItem("user", JSON.stringify(response.data.data));
      setUserData(response.data.data);
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui!");
    } catch (err) {
      console.error(" Gagal update profile:", err);
      setError("Failed to save changes.");
      toast.error("Gagal menyimpan perubahan profil.");
    }
  };

  if (loading) {
    return <div className="text-center text-lg text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-500">{error}</div>;
  }

  return (
    <section className="flex justify-center items-center min-h-screen bg-sky-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="mb-4 text-sky-600 hover:underline"
        >
          ← Back to Home
        </button>

        <div className="text-center mb-6">
          <img
            src={formData.profile_picture}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto border-4 border-sky-500 mb-4"
          />
          <h1 className="text-3xl font-semibold text-sky-700 mt-4">
            {formData.first_name} {formData.last_name}
          </h1>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="font-medium text-gray-700">First Name:</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="font-medium text-gray-700">Last Name:</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          {/* Email */}
          <div>
            <label className="font-medium text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full p-2 border rounded mt-1 bg-gray-100"
            />
          </div>

          {/* Password (hidden) */}
          <div>
            <label className="font-medium text-gray-700">Password:</label>
            <input
              type="password"
              value="********"
              disabled
              className="w-full p-2 border rounded mt-1 bg-gray-100"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {isEditing ? (
              <>
                <button
                  className="bg-sky-600 text-white p-2 rounded hover:bg-sky-700"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
                <button
                  className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="bg-sky-600 text-white p-2 rounded hover:bg-sky-700"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Change/Reset Password */}
          <div className="mt-6 text-center">
            <button
              className="text-sky-600 hover:underline"
              onClick={() => alert("Change password functionality!")}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
