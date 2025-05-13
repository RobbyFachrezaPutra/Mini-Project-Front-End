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
    <div className="w-64 bg-white border-r fixed h-full pt-6 p-4">
      <button
        onClick={() => router.push("/")}
        className="mb-4 pt-4 text-sky-600 hover:underline"
      >
        ← Back to Home
      </button>
      <h3 className="font-bold text-lg mb-6 text-sky-800">Menu</h3>

      {/* My Events */}
      <button
        onClick={() => setActiveTab("events")}
        className={`w-full text-left p-3 rounded-lg font-medium ${
          activeTab === "events"
            ? "bg-sky-100 text-sky-600"
            : "hover:bg-gray-100"
        }`}
      >
        My Events
      </button>

      {/* Transactions */}
      <button
        onClick={() => setActiveTab("transactions")}
        className={`w-full text-left p-3 rounded-lg font-medium my-2 ${
          activeTab === "transactions"
            ? "bg-sky-100 text-sky-600"
            : "hover:bg-gray-100"
        }`}
      >
        Transactions
      </button>

      {/* Statistics */}
      <button
        onClick={() => setActiveTab("statistics")}
        className={`w-full text-left p-3 rounded-lg font-medium ${
          activeTab === "statistics"
            ? "bg-sky-100 text-sky-600"
            : "hover:bg-gray-100"
        }`}
      >
        Statistics
      </button>

      {/* Overview */}
      <button
        onClick={() => setActiveTab("overview")}
        className={`w-full text-left p-3 rounded-lg font-medium ${
          activeTab === "overview"
            ? "bg-sky-100 text-sky-600"
            : "hover:bg-gray-100"
        }`}
      >
        Overview
      </button>
    </div>
  );
};

export default Sidebar;
