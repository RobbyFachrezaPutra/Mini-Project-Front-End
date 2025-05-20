"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type TransactionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "waiting_for_payment";

interface Transaction {
  id: string;
  event: string;
  ticketType: string;
  quantity: number;
  status: TransactionStatus;
  paymentProof: string;
  date: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

interface IUserParam {
  id: string;
  name: string;
  email: string;
  role: string;
}

const TransactionTab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const fetchTransactions = async () => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    ) as IUserParam;
    if (!user?.id) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/transactions/by-organizer/${user.id}`,
        { withCredentials: true }
      );

      const mapped = response.data.data.map(
        (tx: any): Transaction => ({
          id: tx.id.toString(),
          event: tx.event || "Unknown Event",
          ticketType: tx.ticketType || "Unknown",
          quantity: tx.quantity || 0,
          status: tx.status
            .toLowerCase()
            .replace(/\s+/g, "_") as TransactionStatus,
          paymentProof: tx.paymentProof || "",
          date: new Date(tx.createdAt).toISOString().slice(0, 10),
          user: {
            name: tx.name || "Unknown User",
            email: tx.email || "",
            phone: tx.phone || "",
          },
        })
      );

      setTransactions(mapped);
    } catch (err: any) {
      console.error("Failed to fetch transactions:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Local state update only - no API call
  const handleApprove = async (txId: string) => {
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/transactions/approve/${txId}`
    );

    setTransactions((prevTransactions) =>
      prevTransactions.map((tx) =>
        tx.id === txId ? { ...tx, status: "approved" } : tx
      )
    );
  };

  // Local state update only - no API call
  const handleReject = async (txId: string) => {
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/transactions/reject/${txId}`
    );

    setTransactions((prevTransactions) =>
      prevTransactions.map((tx) =>
        tx.id === txId ? { ...tx, status: "rejected" } : tx
      )
    );
  };

  const openImageModal = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setShowModal(true);
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "waiting_for_payment":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-stone-100 px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 text-center sm:text-left w-full sm:w-auto">
        Transaction Management
      </h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-slate-200 mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Ticket Type
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Qty
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Date
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-900">
                        <div className="truncate max-w-[100px] sm:max-w-[200px]">
                          {tx.event}
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600">
                        <div>
                          <p className="font-medium truncate max-w-[100px] sm:max-w-[150px]">
                            {tx.user.name}
                          </p>
                          <p className="text-slate-500 hidden sm:block truncate max-w-[100px] sm:max-w-[150px]">
                            {tx.user.email}
                          </p>
                          <p className="text-slate-400 hidden md:block truncate max-w-[100px] sm:max-w-[150px]">
                            {tx.user.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                        <div className="truncate max-w-[100px] sm:max-w-[150px]">
                          {tx.ticketType}
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                        {tx.quantity}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            tx.status
                          )}`}
                        >
                          {tx.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-500 hidden md:table-cell">
                        {tx.date}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-500">
                        {tx.paymentProof ? (
                          <button
                            onClick={() => openImageModal(tx.paymentProof)}
                            className="text-sky-500 hover:text-sky-700 font-medium"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-slate-300">No proof</span>
                        )}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        {tx.status === "pending" && (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <button
                              onClick={() => {
                                handleApprove(tx.id);
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(tx.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-2 sm:px-6 sm:py-4 text-center text-sm text-slate-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg sm:max-w-2xl md:max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-700">
                Payment Proof
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-3 sm:p-4 flex justify-center">
              <img
                src={currentImage}
                alt="Payment Proof"
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain"
              />
            </div>
            <div className="border-t p-3 sm:p-4 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-sky-500 text-white rounded hover:bg-sky-600 text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTab;
