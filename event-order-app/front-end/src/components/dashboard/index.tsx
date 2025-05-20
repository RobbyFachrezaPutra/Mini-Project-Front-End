"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../navbar";
import Sidebar from "./layout/sidebar";
import MyEventsTab from "./tab/my-event";
import TransactionTab from "./tab/transaction";
import StatisticTab from "./tab/statistics";
import OverviewTab from "./tab/overview";
import { Menu, X } from "lucide-react"; // Import icon untuk toggle sidebar

// TypeScript: Definisikan tipe untuk activeTab (opsional)
type ActiveTabType = "events" | "transactions" | "statistics" | "overview";

const DashboardPage = () => {
  const router = useRouter();

  // 1. State untuk kontrol tab aktif
  const [activeTab, setActiveTab] = useState<ActiveTabType>("events");
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  // State untuk mengontrol sidebar pada tampilan mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 2. State data dashboard (contoh)
  const [dashboardData] = useState({
    pendingTransactions: 3, // Data dummy
    totalEvents: 5,
    // ...data lainnya
  });

  // Toggle sidebar untuk tampilan mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-slate-700 text-white rounded-lg shadow-lg"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar - responsif dengan kelas kondisional */}
      <div
        className={`
        fixed inset-y-0 left-0 z-20 transition-transform duration-300 ease-in-out transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab as ActiveTabType);
            // Tutup sidebar setelah memilih tab pada mobile
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          pendingTransactions={dashboardData.pendingTransactions}
        />
      </div>

      {/* Overlay untuk menutup sidebar saat klik di luar pada mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-opacity-30 backdrop-blur-sm z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Konten Utama - responsif dengan margin yang berbeda */}
      <main className="pt-4 px-4 md:ml-64 transition-all duration-300">
        {/* Events Tab */}
        {activeTab === "events" && <MyEventsTab />}

        {/* Transactions Tab */}
        {activeTab === "transactions" && <TransactionTab />}

        {/* Statistics Tab */}
        {activeTab === "statistics" && <StatisticTab />}

        {/* Overview Tab */}
        {activeTab === "overview" && <OverviewTab />}
      </main>
    </div>
  );
};

export default DashboardPage;
