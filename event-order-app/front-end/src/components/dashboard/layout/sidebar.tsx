import { useRouter } from "next/navigation";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingTransactions: number;
}

const Sidebar = ({
  activeTab,
  setActiveTab,
  pendingTransactions,
}: SidebarProps) => {
  const router = useRouter();

  return (
    <div className="w-64 bg-slate-700 border-r border-slate-800 h-full pt-6 p-4 shadow-xl flex flex-col">
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push("/")}
          className="mb-6 pt-2 text-sky-200 hover:underline hover:text-sky-400 transition mt-8 md:mt-0"
        >
          ← Back to Home
        </button>
      </div>

      <h3 className="font-bold text-lg mb-6 text-sky-100 tracking-wide">
        Menu
      </h3>

      {/* My Events */}
      <button
        onClick={() => setActiveTab("events")}
        className={`w-full text-left p-3 rounded-lg font-medium mb-2 transition ${
          activeTab === "events"
            ? "bg-sky-600 text-white shadow"
            : "text-sky-100 hover:bg-sky-800 hover:text-white"
        }`}
      >
        My Events
      </button>

      {/* Transactions */}
      <button
        onClick={() => setActiveTab("transactions")}
        className={`w-full text-left p-3 rounded-lg font-medium mb-2 transition ${
          activeTab === "transactions"
            ? "bg-sky-600 text-white shadow"
            : "text-sky-100 hover:bg-sky-800 hover:text-white"
        }`}
      >
        Transactions
      </button>

      {/* Statistics */}
      <button
        onClick={() => setActiveTab("statistics")}
        className={`w-full text-left p-3 rounded-lg font-medium mb-2 transition ${
          activeTab === "statistics"
            ? "bg-sky-600 text-white shadow"
            : "text-sky-100 hover:bg-sky-800 hover:text-white"
        }`}
      >
        Statistics
      </button>

      {/* Overview */}
      <button
        onClick={() => setActiveTab("overview")}
        className={`w-full text-left p-3 rounded-lg font-medium mb-2 transition ${
          activeTab === "overview"
            ? "bg-sky-600 text-white shadow"
            : "text-sky-100 hover:bg-sky-800 hover:text-white"
        }`}
      >
        Overview
      </button>
    </div>
  );
};

export default Sidebar;
