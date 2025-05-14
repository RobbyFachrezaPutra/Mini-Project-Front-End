"use client";

import Link from "next/link";
import { deleteCookie } from "cookies-next";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { IUserParam } from "@/interface/user.interface";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

const Navbar = () => {
  const [user, setUser] = useState<IUserParam | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [reload, setReload] = useState(false);
  const categories = useAppSelector((state) => state.event.categories);
  const locations = useAppSelector((state) => state.event.locations);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword") || "";
  const [search, setSearch] = useState(keywordFromUrl);
  const refreshUser = () => setReload((prev) => !prev);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, [reload]);

  const handleLogout = () => {
    deleteCookie("access_token");
    localStorage.removeItem("user");
    toast.success("Log out successfully");
    refreshUser();
    router.refresh();
  };

  useEffect(() => {
    setSearch(keywordFromUrl); // sync ulang ketika URL berubah
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [keywordFromUrl]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchAuto(search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSearchAuto = async (query: string) => {
    try {
      if (query)
        router.push(`/pages/homepage?keyword=${encodeURIComponent(query)}`);
      else {
        router.push("/");
      }
    } catch (err) {
      toast.error("Gagal mencari data");
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    router.push(`/pages/homepage?keyword=${encodeURIComponent(search)}`);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-2 shadow-lg backdrop-blur-lg border-b-2 border-[#fffdf6] bg-sky-600">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Link href="/" className="text-stone-50 text-4xl">
          Tiketin.com
        </Link>

        <form
          onSubmit={handleSearchSubmit}
          className="w-full flex justify-center items-center py-4"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-4 pr-4 py-2 rounded-xl text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-[500px]"
          />
        </form>

        <div className="flex items-center gap-4 text-stone-50 relative self-end md:self-auto">
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/pages/register"
                className="border-2 px-3 py-2 rounded-2xl w-[100px] text-center hover:bg-sky-800"
              >
                Register
              </Link>
              <Link
                href="/pages/login"
                className="border-2 px-3 py-2 rounded-2xl w-[100px] text-center bg-stone-50 text-cyan-600"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <img
                  src={user.profile_picture || "/default.jpg"}
                  alt="profile"
                  className="w-15 h-15 rounded-full border-2 border-white"
                />
                <span className="font-medium hidden sm:inline text-3xl">
                  {user.first_name}
                </span>
              </div>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md z-50 text-black">
                  {user.role === "event_organizer" ? (
                    <>
                      <Link
                        href="/pages/dashboard"
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/pages/profile"
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/pages/transaction/detail"
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Transactions
                      </Link>
                      <Link
                        href="/pages/profile"
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                    </>
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
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
