"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "@/lib/axiosInstance";

const ProfilePage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userAuth = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_picture: "",
    password: "", // New password field
    new_password: "", // For password change
    confirm_password: "", // For password confirmation
    referral_code: "", // New referral code field
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Toggle password fields

  useEffect(() => {
    //   const fetchProfileData = async () => {
    //     try {
    //       const token = getCookie("acces_token");
    //       if (!token) {
    //         setError("No token found, please log in.");
    //         return;
    //       }

    //       const response = await axios.get(
    //         `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/profile/user-profile`,
    //         {
    //           headers: {
    //             Authorization: `Bearer ${token}`,
    //           },
    //         }
    //       );

    //       const user = response.data.data; // Ambil dari data.data
    //       console.log("Data user:", user);

    //       setUserData(user);
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setFormData({
      first_name: storedUser.first_name || "",
      last_name: storedUser.last_name || "",
      email: storedUser.email || "",
      profile_picture: storedUser.profile_picture || "/default-profile.png",
      password: "",
      new_password: "",
      confirm_password: "",
      referral_code: userAuth.referral_code || "",      
    });

    //   setLoading(false);
    //     } catch (err) {
    //       console.error(" Gagal fetch data:", err);
    //       setError("Failed to fetch profile data.");
    //       setLoading(false);
    //     }
    //   };

    //   fetchProfileData();

    setLoading(false);
  }, [userAuth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran gambar maksimal 2MB");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          profile_picture: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = async () => {
    if (!confirm("Yakin ingin menghapus foto profil?")) return;

    try {
      const token = getCookie("acces_token");
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/profile/delete-profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData((prev) => ({
        ...prev,
        profile_picture: "/default-profile.png",
      }));
      setSelectedFile(null);
      toast.success("Foto profil berhasil dihapus");
    } catch (err: any) {
      console.error("Error detail:", err.response?.data);
      toast.error(err.response?.data?.message || "Gagal menghapus foto profil");
    }
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scale = Math.min(MAX_WIDTH / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => resolve(blob as Blob), "image/jpeg", 0.7);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    try {
      const token = getCookie("access_token");

      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      // Buat instance FormData baru
      const formPayload = new FormData();

      // Append data dari state formData
      formPayload.append("first_name", formData.first_name);
      formPayload.append("last_name", formData.last_name);
      formPayload.append("referral_code", formData.referral_code);

      if (selectedFile) {
        const compressedBlob = await compressImage(selectedFile);
        formPayload.append("profile_picture", compressedBlob, "profile.jpg");
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/profile/edit-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      localStorage.removeItem("user");
      localStorage.setItem("user", JSON.stringify(response.data.data));
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui!");
    } catch (err) {
      console.error("Gagal update profile:", err);
      toast.error("Gagal menyimpan perubahan profil.");
    }
  };

  if (loading)
    return <div className="text-center text-lg text-gray-600">Loading...</div>;
  if (error)
    return <div className="text-center text-lg text-red-500">{error}</div>;

  return (
    <section className="flex justify-center items-center min-h-screen bg-sky-100">
      <ToastContainer position="top-right" />
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <button
          onClick={() => router.push("/")}
          className="mb-4 text-sky-600 hover:underline"
        >
          ← Back to Home
        </button>

        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img
              src={formData.profile_picture}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto border-4 border-sky-500 mb-4 cursor-pointer"
              onClick={() => isEditing && fileInputRef.current?.click()}
            />
            {isEditing && (
              <div className="absolute bottom-2 right-2 flex gap-2">
                <label className="bg-sky-600 text-white p-2 rounded-full hover:bg-sky-700 cursor-pointer">
                  ✏️
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                  />
                </label>
                {/* 🆕 [TAMBAHAN] Tombol hapus foto */}
                {formData.profile_picture !== "/default-profile.png" && (
                  <button
                    onClick={handleRemovePicture}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                    title="Hapus foto profil"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-semibold text-sky-700 mt-4">
            {formData.first_name} {formData.last_name}
          </h1>
        </div>

        <div className="space-y-4">
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

          <div>
            <label className="font-medium text-gray-700">Referral Code:</label>
            <input
              type="text"
              name="referral_code"
              value={formData.referral_code}
              disabled
              className="w-full p-2 border rounded mt-1 bg-gray-100"
            />
          </div>

          {isEditing && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push("/pages/reset-password")}
                className="text-sky-600 hover:underline text-sm"
              >
                Ubah Password
              </button>
            </div>
          )}

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
                  onClick={() => {
                    setIsEditing(false);
                  }}
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
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
