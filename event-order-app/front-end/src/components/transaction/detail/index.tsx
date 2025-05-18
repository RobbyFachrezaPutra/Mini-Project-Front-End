"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IEvent } from "@/interface/event.interface";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { useSearchParams } from "next/navigation";
import { setCategories, setLocations } from "@/lib/redux/slices/eventSlice";
import api from "@/lib/axiosInstance";
import { IEventCategoryParam } from "@/interface/event-category.interface";
import { ITransactionParam } from "@/interface/transaction.interface";
import { IUserParam } from "@/interface/user.interface";
import PaymentInfoModal from "../info";

export default function DetailTransaction() {
  const [transactions, setTransactions] = useState<ITransactionParam[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<IUserParam | null>(null); // misalnya dari API
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // --- New state untuk review modal dan form ---
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTransactionForReview, setSelectedTransactionForReview] =
    useState<ITransactionParam | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  // -------------------------------------------

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
    setShowPaymentModal(false);
    api
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/transactions/by-user/${storedUser.id}`
      )
      .then((res) => {
        const transactionList = res.data.data as ITransactionParam[];
        console.log(transactionList);
        setTransactions(transactionList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching transactions:", err);
        setLoading(false);
      });
  }, []);

  // Fungsi untuk buka modal review dengan transaksi yang dipilih
  function openReviewModal(transaction: ITransactionParam) {
    setSelectedTransactionForReview(transaction);
    setRating(0);
    setComment("");
    setReviewError(null);
    setReviewSuccess(null);
    setShowReviewModal(true);
  }

  // Fungsi submit review ke API
  async function submitReview() {
    if (!selectedTransactionForReview) return;

    if (rating <= 0) {
      setReviewError("Rating harus lebih dari 0");
      return;
    }

    try {
      setReviewError(null);
      const body = {
        transaction_id: selectedTransactionForReview.id,
        rating,
        comment,
      };
      await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/review`,
        body
      );
      setReviewSuccess("Review berhasil dikirim");
      // Close modal setelah delay singkat
      setTimeout(() => {
        setShowReviewModal(false);
        // Reload transaksi agar data terbaru termuat (kalau perlu)
        // Bisa kamu tambahkan di sini
      }, 1500);
    } catch (err: any) {
      setReviewError(err.response?.data?.message || "Gagal mengirim review");
    }
  }

  return (
    <>
      <div className="pt-[80px] px-6 sm:pt-[96px] bg-stone-100 min-h-screen">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-sky-400 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="flex flex-col space-y-8 max-w-[1200px] mx-auto">
          {/* Transaction Cards */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {loading ? (
                <div className="text-slate-600 font-semibold text-center col-span-full py-12">
                  Loading...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center text-slate-500 font-medium col-span-full py-12">
                  No transactions found.
                </div>
              ) : (
                transactions.map((transaction) => {
                  const endDateString = transaction.event.end_date;
                  const endDate = endDateString
                    ? new Date(endDateString)
                    : null;
                  const now = new Date();
                  const canReview = endDate
                    ? transaction.status === "approve" && now > endDate
                    : false;

                  return (
                    <div
                      key={transaction.id}
                      className="flex flex-col justify-between bg-white rounded-3xl shadow-md hover:shadow-lg transition-shadow cursor-pointer w-[190px] overflow-hidden"
                    >
                      {/* Banner Image */}
                      <img
                        src={transaction.event.banner_url}
                        alt={transaction.event.name}
                        className="w-full aspect-[3/2] object-cover rounded-t-3xl"
                      />

                      {/* Transaction Info */}
                      <div className="p-5 flex-grow flex flex-col justify-between min-h-[140px]">
                        <div className="text-xs font-semibold text-slate-700 mb-1 line-clamp-2">
                          {transaction.code}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          Status:{" "}
                          <span
                            className={`font-semibold ${
                              transaction.status === "approve"
                                ? "text-green-600"
                                : transaction.status === "Waiting for payment"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                        <div className="mt-3 text-slate-800 font-semibold text-lg">
                          💵{" "}
                          {Number(transaction.final_price).toLocaleString(
                            "id-ID",
                            {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }
                          )}
                        </div>
                      </div>

                      {/* Upload Payment Proof Button */}
                      {transaction.status === "Waiting for payment" && (
                        <div className="p-4 pt-0">
                          <button
                            type="button"
                            className="w-full h-[48px] bg-slate-700 hover:bg-slate-800 text-white rounded-b-3xl font-semibold transition-colors"
                            onClick={() => {
                              localStorage.setItem(
                                "latest_transaction",
                                JSON.stringify(transaction)
                              );
                              setShowPaymentModal(true);
                            }}
                          >
                            Upload Payment Proof
                          </button>
                        </div>
                      )}

                      {/* Review Button */}
                      {canReview && (
                        <div className="p-4 pt-0">
                          <button
                            type="button"
                            className="w-full h-[48px] bg-sky-400 hover:bg-sky-500 text-white rounded-b-3xl font-semibold transition-colors"
                            onClick={() => openReviewModal(transaction)}
                          >
                            Give Review
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentInfoModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />

        {/* Review Modal */}
        {showReviewModal && selectedTransactionForReview && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
            onClick={() => setShowReviewModal(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4 text-slate-700">
                Submit Review
              </h2>

              <div className="mb-4">
                <label className="block mb-1 font-medium text-slate-700">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium text-slate-700">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              {reviewError && (
                <p className="text-red-600 mb-2">{reviewError}</p>
              )}
              {reviewSuccess && (
                <p className="text-green-600 mb-2">{reviewSuccess}</p>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className="px-5 py-2 rounded bg-slate-700 text-white hover:bg-slate-800 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
