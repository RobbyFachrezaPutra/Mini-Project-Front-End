"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";

import { useAppDispatch } from "@/lib/redux/hooks";

import { login } from "@/lib/redux/slices/authSlice";
import axios from "axios";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";

// 1. Buat Yup schema sesuai IRegisterParam
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  return (
    <section className="flex justify-center items-center min-h-screen bg-sky-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-sky-700 md:text-3xl lg:text-4xl">
          Login
        </h1>

        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/auth/login`,
                values,
                {
                  withCredentials: true,
                }
              );

              if (!res.data) {
                const errorData = await res.data;
                toast.error(
                  `Gagal: ${errorData.message || "Terjadi kesalahan"}`
                );
              } else {
                toast.success("Berhasil login!");
                console.log("User data:", res.data);
                const responseData = res.data;
                dispatch(
                  login({
                    email: responseData.data.email,
                    first_name: responseData.data.first_name,
                    last_name: responseData.data.last_name,
                    profile_picture: responseData.data.profile_picture,
                    role: responseData.data.role,
                    isLogin: true,
                  })
                );
                resetForm();
                router.push("/");
              }
            } catch (error) {
              console.error(error);
              alert("Gagal koneksi ke server");
            }
          }}
        >
          {({ handleSubmit }) => (
            <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Email:
                </label>
                <Field
                  name="email"
                  type="email"
                  className="w-full p-2 border rounded mt-1"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Password:
                </label>
                <Field
                  name="password"
                  type="password"
                  className="w-full p-2 border rounded mt-1"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-sky-600 text-white p-2 rounded mt-4 hover:bg-sky-700"
              >
                Login
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
}
