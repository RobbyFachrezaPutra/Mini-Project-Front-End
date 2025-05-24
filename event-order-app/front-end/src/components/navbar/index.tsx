"use client";

import Link from "next/link";
import { deleteCookie } from "cookies-next";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { IUserParam } from "@/interface/user.interface";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { Menu, X, Search, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState<IUserParam | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    deleteCookie("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    if (typeof window !== "undefined") {
      // Pastikan kode ini hanya dijalankan di browser
      const api = require("@/lib/axiosInstance").default;
      delete api.defaults.headers.common["Authorization"];
    }

    toast.success("Log out successfully");
    refreshUser();
    router.refresh();
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    setSearch(keywordFromUrl);
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
      if (query) router.push(`/homepage?keyword=${encodeURIComponent(query)}`);
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

    router.push(`/homepage?keyword=${encodeURIComponent(search)}`);
    setMobileMenuOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("navbar-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-0 py-0 shadow-lg backdrop-blur-lg border-b border-sky-400/40 bg-slate-700">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-stone-100 text-2xl md:text-3xl font-extrabold tracking-tight flex items-center"
          >
            <span className="bg-stone-100 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-sky-500 font-black text-xl md:text-2xl shadow mr-2">
              T
            </span>
            <span className="text-sky-400 font-bold">Tiketin</span>
            <span className="font-light text-stone-100">.com</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari event seru..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-4 pr-10 py-2 rounded-xl text-gray-900 border border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 w-full bg-stone-100 shadow-sm transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sky-500 hover:text-sky-700 transition"
                  aria-label="Cari"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 text-white">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="border-2 border-sky-400 px-4 py-2 rounded-xl text-center hover:bg-sky-400 hover:text-white transition font-semibold"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-sky-400 px-4 py-2 rounded-xl text-center bg-sky-400 text-white hover:bg-sky-500 transition font-semibold"
                >
                  Login
                </Link>
              </div>
            ) : (
              <div className="relative" id="navbar-dropdown">
                <button
                  className="flex items-center gap-2 cursor-pointer focus:outline-none"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-label="User menu"
                >
                  <span className="font-bold text-lg">{user.first_name}</span>
                  <img
                    src={
                      user.profile_picture?.startsWith("http")
                        ? user.profile_picture
                        : `${process.env.NEXT_PUBLIC_API_URL}/${
                            user.profile_picture ||
                            "Profile_avatar_placeholder_large.png"
                          }`
                    }
                    alt="profile"
                    className="w-10 h-10 rounded-full border-2 border-sky-400 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/Profile_avatar_placeholder_large.png";
                    }}
                  />
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 min-w-[200px] bg-white rounded-xl shadow-2xl z-50 text-slate-700 border border-sky-100 animate-fade-in">
                    {user.role === "event_organizer" ? (
                      <>
                        <Link
                          href="/dashboard"
                          className="block w-full text-left px-4 py-2 hover:bg-sky-50 rounded-t-xl transition"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="block w-full text-left px-4 py-2 hover:bg-sky-50 transition"
                        >
                          Profile
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/transaction/detail"
                          className="block w-full text-left px-4 py-2 hover:bg-sky-50 rounded-t-xl transition"
                        >
                          Transactions
                        </Link>
                        <Link
                          href="/profile"
                          className="block w-full text-left px-4 py-2 hover:bg-sky-50 transition"
                        >
                          Profile
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-sky-50 rounded-b-xl transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 shadow-lg animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari event seru..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-4 pr-10 py-2 rounded-xl text-gray-900 border border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 w-full bg-stone-100 shadow-sm transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sky-500 hover:text-sky-700 transition"
                  aria-label="Cari"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/register"
                  className="border-2 border-sky-400 px-4 py-2 rounded-xl text-center hover:bg-sky-400 hover:text-white transition font-semibold text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-sky-400 px-4 py-2 rounded-xl text-center bg-sky-400 text-white hover:bg-sky-500 transition font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 py-2">
                  <img
                    src={
                      user.profile_picture?.startsWith("http")
                        ? user.profile_picture
                        : `${process.env.NEXT_PUBLIC_API_URL}/${
                            user.profile_picture ||
                            "Profile_avatar_placeholder_large.png"
                          }`
                    }
                    alt="profile"
                    className="w-10 h-10 rounded-full border-2 border-sky-400 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/Profile_avatar_placeholder_large.png";
                    }}
                  />
                  <span className="font-bold text-lg text-white">
                    {user.first_name} {user.last_name}
                  </span>
                </div>

                {user.role === "event_organizer" ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block w-full text-left px-4 py-2 hover:bg-slate-700 rounded-lg transition text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block w-full text-left px-4 py-2 hover:bg-slate-700 rounded-lg transition text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/transaction/detail"
                      className="block w-full text-left px-4 py-2 hover:bg-slate-700 rounded-lg transition text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Transactions
                    </Link>
                    <Link
                      href="/profile"
                      className="block w-full text-left px-4 py-2 hover:bg-slate-700 rounded-lg transition text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-slate-700 rounded-lg transition text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
