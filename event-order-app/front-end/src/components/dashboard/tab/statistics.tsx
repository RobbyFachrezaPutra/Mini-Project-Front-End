import { useRouter } from "next/navigation";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import "@/utils/chart";

const StatisticTab = () => {
  const eventData = {
    labels: ["Music", "Sports", "Art", "Food", "Tech"],
    datasets: [
      {
        label: "Tickets Sold",
        data: [120, 90, 60, 50, 40],
        backgroundColor: "rgba(56, 182, 255, 0.6)",
        borderColor: "rgba(56, 182, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Revenue (in millions)",
        data: [3.2, 2.8, 4, 5.1, 3.9],
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  const ticketDistribution = {
    labels: ["VIP", "Regular", "Early Bird"],
    datasets: [
      {
        data: [35, 50, 15],
        backgroundColor: [
          "rgba(245, 158, 11, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-sky-800 mb-6">Statistic</h1>
      {/* Daftar event */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tickets by Category */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Tickets by Category
          </h2>
          <div className="h-80">
            <Bar
              data={eventData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Revenue
          </h2>
          <div className="h-80">
            <Bar
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value: number | string) => `Rp${value}M`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Ticket Distribution */}
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Ticket Type Distribution
        </h2>
        <div className="h-96">
          <Pie
            data={ticketDistribution}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "right",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatisticTab;
