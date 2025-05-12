"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axiosInstance";
import { IEvent } from "@/interface/event.interface";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import BuyTicketDialog from "../dialog";

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
    content: "", // Set konten kosong untuk sementara
    editable: false, // Mengatur editor menjadi hanya bisa dilihat (read-only)
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
          router.push("/pages/login");
        }
      });
  }, [id, editor]); // Pastikan editor berada di dependencies list

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

        {/* Merender konten Tiptap */}
        <div className="mt-4 text-gray-700 leading-relaxed">
          <EditorContent editor={editor} /> {/* Render konten Tiptap */}
        </div>
      </div>
      {/* Kolom kanan: detail */}
      <div className="lg:w-1/3 w-full flex flex-col justify-between p-6 shadow-lg rounded-xl h-fit bg-white">
        {/* Konten atas */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-sky-700">{event.name}</h1>
          <p className="text-sm text-gray-600">📍 {event.location}</p>
          <p className="text-sm text-gray-600">
            📅{" "}
            {event.start_date
              ? new Date(event.start_date).toLocaleString("id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                })
              : null}
          </p>
          <p className="text-sm text-gray-600">
            🕒 Sampai:{" "}
            {event.end_date
              ? new Date(event.end_date).toLocaleString("id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                })
              : null}
          </p>
          <p className="text-sm text-gray-500">
            Kategori: 🎭 {event.category?.name || "Umum"}
          </p>
          <p className="text-sm text-gray-800 font-semibold">
            Harga Mulai: Rp
            {Math.min(...event.tickets.map((t) => t.price)).toLocaleString()}
          </p>
          <p className="text-sm text-emerald-600 font-medium">
            Sisa Kursi: {event.available_seats}
          </p>
          <p className="text-sm text-gray-500">
            Diselenggarakan oleh:{" "}
            <span className="font-medium">
              {event.organizer?.first_name || event.organizer_id}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            type="button"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
            onClick={handleOpenDialog}
          >
            🎟️ Beli Tiket
          </button>
          <button
            type="button"
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 w-full"
          >
            🔗 Bagikan Event
          </button>
        </div>
      </div>
      <BuyTicketDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        eventId={event.id}
      />
    </div>
  );
}
