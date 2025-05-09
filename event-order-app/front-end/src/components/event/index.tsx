"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function EventDetail() {
  const params = useParams();
  const id = params?.id?.toString();
  const [event, setEvent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/${id}`, {
        withCredentials: true,
      })
      .then((res) => setEvent(res.data.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          router.push("/pages/Login");
        }
      });
  }, [id]);

  if (!event) return <div>Loading...</div>;

  return (
      <div className="flex flex-col lg:flex-row justify-center mx-auto mt-[200px] p-6 gap-6 max-w-6xl">
        {/* Kolom kiri: gambar */}
        <div className="lg:w-2/3 w-full">
          <img
            src={event.banner_url}
            alt={event.name}
            className="w-full h-96 object-cover rounded-md shadow"
          />
          <p className="mt-4 text-gray-700 leading-relaxed">
            {event.description}
          </p>
        </div>
        {/* Kolom kanan: detail */}
        <div className="lg:w-1/3 w-full flex flex-col justify-between p-6 shadow-lg rounded-xl h-96">
          {/* Konten atas */}
          <div>
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <p className="text-gray-600">📍 {event.location}</p>
            <p className="text-gray-600">
              📅 {new Date(event.start_date).toLocaleDateString()}
            </p>
            <p className="text-gray-800 font-semibold">🎟️ {event.price ?? "Free"}</p>
            <p>-----------------------------------------------------------</p>
            <p className="text-gray-500">Diselenggarakan oleh {event.organizer_id}</p>
          </div>

          {/* Tombol di bawah */}
          <div className="flex justify-center mt-6">
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full">
              Beli Tiket
            </button>
          </div>
        </div>
      </div>
  );
}
