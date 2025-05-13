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

export default function HomePage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [eventsSearch, setEventsSearch] = useState<IEvent[]>([]);
  const router = useRouter();
  const searchResults = useAppSelector((state) => state.search.results);
  const searchKeyword = useAppSelector((state) => state.search.keyword);
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword');
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!keyword) return;

    const fetchEvents = async () => {
      try {
        const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/search?keyword=${encodeURIComponent(keyword)}`);
        setEventsSearch(res.data.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [keyword]);

  useEffect(() => {
    api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events`)
      .then((res) => {
        const eventList = res.data.data as IEvent[];
        setEvents(eventList);
  
        // Extract locations
        const uniqueLocations = Array.from(new Set(eventList.map((e: IEvent) => e.location))).filter(Boolean);
        dispatch(setLocations(uniqueLocations));
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  useEffect(() => {
    api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/event-categories`)
      .then((res) => {
        const categoryList = res.data.data as IEventCategoryParam[];
        dispatch(setCategories(categoryList))
      })
      .catch((err) => console.error("Error fetching categiry:", err));

  },[]);
  const eventsToShow = keyword ? eventsSearch : events;

  return (
    <div className="pt-[300px] px-4 md:pt-[200px] lg:pt-[200px] mb-[200px]">
      <div className="flex flex-col space-y-6">
        {/* Banner */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full h-40 sm:h-52 md:h-60 bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center rounded-2xl shadow-lg">
          <div className="text-center px-2">
            <h1 className="text-2xl md:text-4xl font-bold">Selamat Datang di Tiketin.com!</h1>
            <h1 className="text-2xl md:text-4xl font-bold mt-2">Bukan Sekadar Event. Ini Movement!</h1>
          </div>
          </div>
        </div>

        {/* Event Cards */}
        <div className="flex justify-center">
            {eventsToShow.length === 0 ? (
              <div className="text-center text-gray-500 py-10 text-lg font-medium">
                Tidak ada event ditemukan.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">            
                {eventsToShow.map((event) => (
                  <Link
                    key={event.id}
                    href={`/pages/transaction/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow w-[190px] h-[310px] flex flex-col">
                      <img src={event.banner_url} alt={event.name} className="w-full h-35 object-cover" />
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <h2 className="text-lg font-semibold mb-1 line-clamp-2">{event.name}</h2>
                        <div>
                          <p className="text-sm text-gray-500 truncate">📍 {event.location}</p>
                          <p className="text-sm text-gray-500">
                            From : 📅 {event.start_date ? new Date(event.start_date).toLocaleDateString() : null}
                          </p>
                          <p className="text-sm text-gray-500">
                            To   : 📅 {event.end_date ? new Date(event.end_date).toLocaleDateString() : null}
                          </p>
                          <p className="text-sm text-gray-700 font-medium mt-2">🎟️ {event.available_seats}</p>
                          <p className="text-sm text-gray-700 font-medium mt-2">
                            💵 Rp
                            {Math.min(...event.tickets.map((t) => t.price)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
