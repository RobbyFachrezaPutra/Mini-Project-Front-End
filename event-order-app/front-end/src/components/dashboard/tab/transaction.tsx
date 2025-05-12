import { useState, useEffect } from "react";
import TransactionDetailModal from "../transactionModal.tsx";
import { Transaction, TransactionStatus } from "@/type/type";

const TransactionTab = () => {
  // Transaction data
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      event: "DEWA Concert",
      ticketType: "VIP",
      quantity: 2,
      quota: 10,
      status: "pending",
      user: {
        name: "John Doe",
        email: "john@example.com",
        phone: "08123456789",
      },
      paymentProof: "/payment-proof.jpg",
      date: "25 Dec 2023",
      paymentDue: new Date(Date.now() + 60000),
    },
    {
      id: "2",
      event: "Coldplay Tour",
      ticketType: "Regular",
      quantity: 4,
      quota: 100,
      status: "pending",
      user: {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "08234567890",
      },
      paymentProof: "/payment-proof.jpg",
      date: "15 Jan 2024",
      paymentDue: new Date(Date.now() - 1000), // Already expired (1 second ago)
    },
    {
      id: "3",
      event: "Coldplay Tour",
      ticketType: "Regular",
      quantity: 4,
      quota: 100,
      status: "pending",
      user: {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "08234567890",
      },
      paymentProof: "/payment-proof.jpg",
      date: "15 Jan 2024",
      paymentDue: new Date(Date.now() + 10000),
    },
  ]);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Handle approval with quota management
  const handleApprove = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          return {
            ...tx,
            status: "approved",
            quota: tx.quota - tx.quantity, // Reduce quota
          };
        }
        return tx;
      })
    );
    setSelectedTx(null);
  };

  // Handle rejection with quota restoration
  const handleReject = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          return {
            ...tx,
            status: "rejected",
            quota: tx.quota + tx.quantity, // Restore quota
          };
        }
        return tx;
      })
    );
    setSelectedTx(null);
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
      console.log("Checking for expired transactions...");

      setTransactions((prev) =>
        prev.map((tx) => {
          if (
            tx.status === "pending" &&
            tx.paymentDue &&
            new Date() > tx.paymentDue
          ) {
            console.log(
              `Canceling transaction ${tx.id} due to payment timeout`
            );
            return {
              ...tx,
              status: "canceled",
              canceledReason: "Payment timeout",
              quota: tx.quota + tx.quantity,
            };
          }
          return tx;
        })
      );
    };

    // Run immediately on component mount
    checkExpiredPayments();

    // Check every minute (60000ms)
    const interval = setInterval(checkExpiredPayments, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-sky-800 mb-6">Transactions</h1>

      <div className="border rounded-lg shadow-xl overflow-hidden bg-stone-50">
        <table className="w-full">
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
                    {tx.status === "pending" && "Pending"}
                    {tx.status === "approved" && "Approved"}
                    {tx.status === "rejected" && "Rejected"}
                    {tx.status === "canceled" && "Canceled"}
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
