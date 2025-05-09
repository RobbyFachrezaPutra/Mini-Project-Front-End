'use client'

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IEvent } from "@/interface/event.interface";
import Link from "next/link";

export default function HomePage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const router = useRouter();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events`) // Ganti dengan URL API asli
    .then((res) => setEvents(res.data.data))
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  return (
    <div className="mt-[200px]">
      <div className="flex flex-col space-y-6">
        {/* Banner */}
        <div className="w-full max-w-6xl mx-auto h-60 bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold">Selamat Datang di EventSphere!</h1>
        </div>

        {/* Event Cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/pages/event/${event.id}`}
                target="_blank"
                rel="noopener noreferrer">
                <div
                  className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow w-[190px]"
                >
                  <img src={event.banner_url} alt={event.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-1">{event.name}</h2>
                    <p className="text-sm text-gray-500">📍 {event.location}</p>
                    <p className="text-sm text-gray-500">📅 {new Date(event.start_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-700 font-medium mt-2">🎟️ {event.available_seats}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
