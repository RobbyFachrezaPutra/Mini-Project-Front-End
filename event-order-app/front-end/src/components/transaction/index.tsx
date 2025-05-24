"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axiosInstance";
import { IEvent } from "@/interface/event.interface";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import BuyTicketDialog from "./dialog";
import Link from "next/link";

export default function EventTransaction() {
  const params = useParams();
  const id = params?.id?.toString();
  const [event, setEvent] = useState<IEvent | null>(null);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: "",
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!id) return;
    api
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        const eventData = res.data.data;
        setEvent(eventData);
        if (editor) {
          editor.commands.setContent(eventData.description);
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          router.push("/login");
        }
      });
  }, [id, editor]);

  if (!event)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
        <span className="ml-4 text-slate-600 text-lg font-medium">
          Loading...
        </span>
      </div>
    );

  return (
    <>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-stone-100">
        {/* Tombol Kembali */}
        <div className="fixed top-0 left-0 w-full z-50 bg-slate-700 border-b border-sky-400/40 shadow-lg backdrop-blur-lg h-16 flex items-center px-6">
          <button
            onClick={() => router.push("/")}
            className="text-white hover:text-sky-400 flex items-center gap-2 font-semibold"
          >
            <span className="text-xl">←</span> <span>Back to Home</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 max-w-7xl mx-auto px-4 py-20">
          {/* Bagian Gambar & Label */}
          <div className="lg:w-2/3 relative">
            <img
              src={event.banner_url}
              alt={event.name}
              className="w-full h-64 lg:h-96  rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
            />
            <span className="absolute top-4 left-4 bg-sky-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow uppercase tracking-wide">
              {event.category?.name || "Umum"}
            </span>
            {event.available_seats === 0 && (
              <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow uppercase tracking-wide">
                Sold Out
              </span>
            )}
          </div>

          {/* Bagian Detail Event */}
          <div className="lg:w-1/3 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 lg:p-8 flex flex-col justify-between">
            <div className="space-y-5">
              <h1 className="text-3xl font-extrabold text-sky-700">
                {event.name}
              </h1>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                <span role="img" aria-label="location" className="text-lg">
                  📍
                </span>
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                <span role="img" aria-label="calendar" className="text-lg">
                  📅
                </span>
                <span>
                  {event.start_date
                    ? new Date(event.start_date).toLocaleString("id-ID", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : null}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                <span role="img" aria-label="clock" className="text-lg">
                  🕒
                </span>
                <span>
                  Sampai:{" "}
                  {event.end_date
                    ? new Date(event.end_date).toLocaleString("id-ID", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : null}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sky-700 dark:text-sky-400 font-semibold text-lg">
                <span role="img" aria-label="ticket" className="text-xl">
                  🎟️
                </span>
                <span>
                  Harga Mulai: Rp{" "}
                  {Math.min(
                    ...event.tickets.map((t) => t.price)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-emerald-600 font-semibold text-base">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-600"></span>
                Sisa Kursi: {event.available_seats}
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                <span role="img" aria-label="user" className="text-lg">
                  👤
                </span>
                <span>
                  Diselenggarakan oleh:{" "}
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    {event.organizer?.first_name || event.organizer_id}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <button
                type="button"
                className={`w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 transition-shadow shadow-md disabled:opacity-50 flex items-center justify-center gap-2`}
                onClick={handleOpenDialog}
                disabled={event.available_seats === 0}
              >
                <span role="img" aria-label="ticket" className="text-xl">
                  🎟️
                </span>
                Beli Tiket
              </button>
              <button
                type="button"
                className="w-full py-3 rounded-lg border-2 border-sky-600 text-sky-600 font-semibold hover:bg-sky-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span role="img" aria-label="share" className="text-lg">
                  🔗
                </span>
                Bagikan Event
              </button>
            </div>
          </div>
        </div>

        <BuyTicketDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          eventId={event.id}
        />
      </div>
    </>
  );
}
