"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      // Perhatikan perubahan URL endpoint sesuai dengan backend
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/forgot-password/reset`,
        { token, password }
      );

      toast.success("Password berhasil diubah");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      console.error("Gagal reset password:", error);
      const errorMsg =
        error.response?.data?.message || "Gagal mengubah password";
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
          Buat Password Baru
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-sky-500"
              placeholder="Masukkan password baru"
              minLength={6}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-sky-500"
              placeholder="Konfirmasi password baru"
              minLength={6}
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
              {loading ? "Memproses..." : "Simpan Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPasswordPage;
