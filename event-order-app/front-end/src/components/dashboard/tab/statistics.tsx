"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "@/utils/chart";

const StatisticTab = () => {
  const [ticketData, setTicketData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, revenueRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/statistic/ticket-by-category`
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/statistic/monthly-revenue`
          ),
        ]);

        const ticketByCategory = ticketRes.data.data;
        const monthlyRevenue = revenueRes.data.data;

        setTicketData({
          labels: ticketByCategory.map((item: any) => item.category),
          datasets: [
            {
              label: "Tickets Sold",
              data: ticketByCategory.map((item: any) => item.count),
              backgroundColor: "rgba(56, 182, 255, 0.6)",
              borderColor: "rgba(56, 182, 255, 1)",
              borderWidth: 1,
            },
          ],
        });

        setRevenueData({
          labels: monthlyRevenue.labels,
          datasets: [
            {
              label: "Revenue (in IDR)",
              data: monthlyRevenue.data.map(
                (value: number) => value / 1_000_000
              ), // konversi ke juta
              backgroundColor: "rgba(16, 185, 129, 0.6)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-sky-800 mb-6">Statistic</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tickets by Category */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Tickets by Category
          </h2>
          <div className="h-80">
            {ticketData ? (
              <Bar
                data={ticketData}
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
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Revenue
          </h2>
          <div className="h-80">
            {revenueData ? (
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
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticTab;
