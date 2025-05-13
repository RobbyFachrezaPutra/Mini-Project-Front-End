import { useState, useEffect } from "react";
import TransactionDetailModal from "../transactionModal.tsx";
import { Transaction, TransactionStatus } from "@/type/type";
import axios from "axios";

const TransactionTab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("/api/transactions");
        // Map backend data to frontend format
        const mappedTransactions = response.data.data.map((tx: any) => ({
          id: tx.id.toString(),
          event: tx.event?.title || "Unknown Event", // Assuming event is included in the response
          ticketType: tx.details?.[0]?.ticket?.type || "Regular", // Assuming details include ticket info
          quantity:
            tx.details?.reduce(
              (sum: number, detail: any) => sum + detail.qty,
              0
            ) || 0,
          quota: tx.event?.available_seats || 0, // Assuming event includes available_seats
          status: tx.status.toLowerCase(), // Convert to match your frontend status
          user: {
            name: tx.user?.name || "Unknown User", // Assuming user info is included
            email: tx.user?.email || "",
            phone: tx.user?.phone || "",
          },
          paymentProof: tx.payment_proof || "",
          date: new Date(tx.created_at).toLocaleDateString(),
          paymentDue: new Date(
            new Date(tx.created_at).getTime() + 24 * 60 * 60 * 1000
          ), // 24 hours after creation
        }));
        setTransactions(mappedTransactions);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle approval
  const handleApprove = async (id: string) => {
    try {
      await axios.put(`/api/transactions/${id}`, {
        status: "approved",
      });

      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, status: "approved" } : tx))
      );
      setSelectedTx(null);
    } catch (err) {
      console.error("Failed to approve transaction:", err);
    }
  };

  // Handle rejection
  const handleReject = async (id: string) => {
    try {
      await axios.put(`/api/transactions/${id}`, {
        status: "rejected",
      });

      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, status: "rejected" } : tx))
      );
      setSelectedTx(null);
    } catch (err) {
      console.error("Failed to reject transaction:", err);
    }
  };

  // Status color styling
  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "canceled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Auto cancel for expired payments
  useEffect(() => {
    const checkExpiredPayments = () => {
      setTransactions((prev) =>
        prev.map((tx) => {
          if (
            tx.status === "pending" &&
            tx.paymentDue &&
            new Date() > tx.paymentDue
          ) {
            return {
              ...tx,
              status: "canceled",
              canceledReason: "Payment timeout",
            };
          }
          return tx;
        })
      );
    };

    checkExpiredPayments();
    const interval = setInterval(checkExpiredPayments, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-sky-800 mb-6">Transactions</h1>

      <div className="border rounded-lg shadow-xl overflow-hidden bg-stone-50">
        <table className="w-full">
          {/* Table headers remain the same */}
          <thead className="bg-sky-100">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-sky-800">
                Event
              </th>
              <th className="p-4 text-left text-sm font-semibold text-sky-800">
                Ticket
              </th>
              <th className="p-4 text-left text-sm font-semibold text-sky-800">
                Status
              </th>
              <th className="p-4 text-left text-sm font-semibold text-sky-800">
                Qty/Quota
              </th>
              <th className="p-4 text-left text-sm font-semibold text-sky-800">
                Date
              </th>
              <th className="p-4 text-left text-sm font-semibold text-sky-800">
                Action
              </th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-700">{tx.event}</td>
                <td className="p-4 text-sm text-gray-700">{tx.ticketType}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      tx.status
                    )}`}
                  >
                    {tx.status}
                  </span>
                  {tx.status === "canceled" && tx.canceledReason && (
                    <p className="text-xs text-gray-500 mt-1">
                      {tx.canceledReason}
                    </p>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  <span className="font-medium">{tx.quantity}</span>/{tx.quota}
                </td>
                <td className="p-4 text-sm text-gray-700">{tx.date}</td>
                <td className="p-4">
                  <button
                    onClick={() => setSelectedTx(tx)}
                    className="px-3 py-1 bg-sky-500 text-white rounded-md hover:bg-sky-600 text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onApprove={() => handleApprove(selectedTx.id)}
          onReject={() => handleReject(selectedTx.id)}
        />
      )}
    </div>
  );
};

export default TransactionTab;
