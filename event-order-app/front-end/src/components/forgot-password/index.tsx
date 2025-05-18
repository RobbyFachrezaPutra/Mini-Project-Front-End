"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Panggil API untuk mengirim email reset password
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/forgot-password`,
        { email }
      );

      toast.success("Link reset password telah dikirim ke email Anda");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      console.error("Gagal mengirim reset link:", error);

      // Tampilkan pesan error dari server jika ada
      const errorMsg =
        error.response?.data?.message || "Gagal mengirim link reset password";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-sky-100">
      <ToastContainer position="top-right" />
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-sky-700 mb-6">
          Lupa Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-sky-500"
              placeholder="Masukkan email Anda"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:bg-sky-300"
            >
              {loading ? "Memproses..." : "Kirim Link Reset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
