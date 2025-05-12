import { useRouter } from "next/navigation";

const OverviewTab = () => {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-3xl font-bold text-sky-800 mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <h3 className="text-sm text-gray-500 mb-1 border-b-2">
            Total Events
          </h3>
          <p className="text-2xl font-bold text-blue-600">12</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <h3 className="text-sm text-gray-500 mb-1 border-b-2">
            Total Transactions
          </h3>
          <p className="text-2xl font-bold text-blue-600">134</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <h3 className="text-sm text-gray-500 mb-1 border-b-2">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-blue-600">Rp 12.300.000</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
