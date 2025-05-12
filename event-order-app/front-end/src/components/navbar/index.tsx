"use client";

import Link from "next/link";
import { deleteCookie, getCookie } from "cookies-next";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/utils/api";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { string } from "yup";
import { login, logout } from "@/lib/redux/slices/authSlice";

interface User {
  role: string;
  image: string | null;
}

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const userAuth = useAppSelector((state) => state.auth);
  console.log(userAuth);
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   console.log("useEffect is running...");
  //   const token = getCookie("acces_token");
  //   console.log("Token:", token); // Ambil token dari cookie
  //   if (typeof token === "string" && token !== "") {
  //     getUserData(token)
  //       .then((data) => {
  //         console.log("User data received:", data);
  //         dispatch(
  //           login({
  //             email: data.email,
  //             name: `${data.first_name} ${data.last_name}`,
  //             image: data.profile_picture || "", // Ambil profile_picture dari backend
  //             role: data.role,
  //             isLogin: true,
  //           })
  //         ); // Update state dengan data pengguna
  //       })
  //       .catch((err) => {
  //         console.error("Failed to fetch user data:", err);
  //       });
  //   }
  // }, [dispatch]);

  const handleLogout = () => {
    deleteCookie("acces_token");
    dispatch(logout());
    router.refresh(); // Arahkan ke halaman login setelah logout
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-14 z-50 flex justify-between items-center px-12 md:px-20 py-8 shadow-lg backdrop-blur-lg border-b-2 border-[#fffdf6] bg-sky-600">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-stone-50 text-2xl">Tiketin.com</div>

        {/* nanti di lanjut lagi */}
        {/* <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-4 pr-4 py-2 rounded-xl w-64 text-black border-2 border-stone-50"
          />
        </div> */}

        <div className="flex items-center gap-4 text-stone-50 relative">
          {!userAuth.isLogin ? (
            <>
              <Link
                href="/pages/Register"
                className="border-2 px-3 py-2 rounded-2xl w-[100px] text-center hover:bg-sky-800"
              >
                Register
              </Link>
              <Link
                href="/pages/Login"
                className="border-2 px-3 py-2 rounded-2xl w-[100px] text-center bg-stone-50 text-cyan-600"
              >
                Login
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4 text-white">
              <span className="font-medium">{userAuth.first_name}</span>

              <div className="relative">
                <img
                  src={userAuth.profile_picture || "/default.jpg"}
                  alt="profile"
                  className="w-15 h-15 rounded-full cursor-pointer border-2 border-white"
                  onClick={() => setMenuOpen(!menuOpen)}
                />
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md z-50 text-black">
                    {userAuth.role === "event_organizer" ? (
                      <div>
                        <Link
                          href="/pages/dashboard"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/pages/Profile"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href="/pages/Profile"
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
