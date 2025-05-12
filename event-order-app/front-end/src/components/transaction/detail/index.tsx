"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IEvent } from "@/interface/event.interface";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { useSearchParams } from 'next/navigation';
import { setCategories, setLocations } from "@/lib/redux/slices/eventSlice";
import api from "@/lib/axiosInstance";
import { IEventCategoryParam } from "@/interface/event-category.interface";
import ITransactionParam from "@/interface/transaction.interface";
import { IUserParam } from "@/interface/user.interface";
import PaymentInfoModal from "../info";

export default function DetailTransaction() {
  const [transactions, setTransactions] = useState<ITransactionParam[]>([]);
  const [eventsSearch, setEventsSearch] = useState<IEvent[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword');
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<IUserParam|null>(null); // misalnya dari API
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
    setShowModal(false);
    api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/transactions/by-user/${storedUser.id}`)
      .then((res) => {
        const transactionList = res.data.data as ITransactionParam[];
        setTransactions(transactionList);
      })
      .catch((err) => console.error("Error fetching transactions:", err));
  }, []);

  return (
    <>
    <div className="pt-[80px] px-4 sm:pt-[96px]">
      <div className="flex flex-col space-y-6">
        {/* Transaction Cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {transactions.map((transaction) => (
              <div
              key={transaction.id}
                className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow w-[190px] h-[310px] flex flex-col"
              >
                <img src={transaction.event.banner_url} alt={transaction.event.name} className="w-full h-40 object-cover" />
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <h2 className="text-lg font-semibold mb-1 line-clamp-2">{transaction.code}</h2>
                  <div>
                    <p className="text-sm text-gray-500 truncate">📍 {transaction.status}</p>
                    <p className="text-sm text-gray-500">💵 Rp {transaction.final_price}</p>
                  </div>
                </div>
                {transaction.status == "pending" ? (
                  <div> 
                    <button
                      type="button"
                      className="w-[100px] px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                      onClick={() => {
                        localStorage.setItem('latest_transaction', JSON.stringify(transaction));
                        setShowModal(true);
                      }}
                    >
                      upload payment proof
                    </button>
                  </div>
                  
                ) : null }
              </div>
            ))}
          </div>
        </div>
      </div>
      <PaymentInfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}/>
    </div>
  </>
  );
}
