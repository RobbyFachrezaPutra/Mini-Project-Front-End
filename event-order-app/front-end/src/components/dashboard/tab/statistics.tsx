"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "@/utils/chart";

const StatisticTab = () => {
  const [ticketData, setTicketData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setError("User not found. Please login again.");
      setLoading(false);
      return;
    }
    const user = JSON.parse(userStr);
    if (!user?.id) {
      setError("User ID not found. Please login again.");
      setLoading(false);
      return;
    }
    const organizerId = user.id;

    const fetchData = async () => {
      try {
        const [ticketRes, revenueRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/statistic/ticket-by-category/${organizerId}`
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/statistic/monthly-revenue/${organizerId}`
          ),
        ]);

        const ticketByCategory = ticketRes.data.data;
        const monthlyRevenue = revenueRes.data.data;

        setTicketData({
          labels: ticketByCategory.map((item: any) => item.category_name),
          datasets: [
            {
              label: "Tickets Sold",
              data: ticketByCategory.map((item: any) => item.tickets_sold),
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
              ),
              backgroundColor: "rgba(16, 185, 129, 0.6)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (error: any) {
        setError(error?.message || "Error fetching statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-stone-100 px-2 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-6 ">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 text-center sm:text-left w-full sm:w-auto">
        Statistics
      </h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300 transition"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 mt-6">
          {/* Tickets by Category */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-700 mb-3 sm:mb-4">
              Tickets by Category
            </h2>
            <div className="h-60 sm:h-80">
              {ticketData ? (
                <Bar
                  data={ticketData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12,
                          },
                        },
                      },
                      tooltip: {
                        bodyFont: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                        titleFont: {
                          size: window.innerWidth < 640 ? 12 : 14,
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 8 : 10,
                          },
                        },
                      },
                      y: {
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 8 : 10,
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-700 mb-3 sm:mb-4">
              Monthly Revenue
            </h2>
            <div className="h-60 sm:h-80">
              {revenueData ? (
                <Bar
                  data={revenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12,
                          },
                        },
                      },
                      tooltip: {
                        bodyFont: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                        titleFont: {
                          size: window.innerWidth < 640 ? 12 : 14,
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 8 : 10,
                          },
                        },
                      },
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value: number | string) => `Rp${value}M`,
                          font: {
                            size: window.innerWidth < 640 ? 8 : 10,
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (!ticketData || !revenueData) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No statistics data available. This could be because you haven't
                had any sales yet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticTab;
