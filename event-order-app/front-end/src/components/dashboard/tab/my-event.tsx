"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IEvent } from "@/interface/event.interface";
import axios from "axios";
import { IUserParam } from "@/interface/user.interface";
import { toast } from "react-toastify";

const MyEventsTab = () => {
  const router = useRouter();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    ) as IUserParam;
    const fetchEvents = async () => {
      try {
        if (!user.id) {
          throw new Error("Authentication required");
        }

        const response = await axios
          .get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/organizer/${user.id}`,
            {
              withCredentials: true,
            }
          )
          .then((res) => {
            const eventList = res.data.data as IEvent[];
            setEvents(eventList);
          });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleViewAttendees = (eventId: number) => {
    router.push(`/attandees?eventId=${eventId}`);
  };

  const handleEditEvent = (eventId: number) => {
    const event = events.find((e) => e.id === eventId);
    if (event?.status === "Publish") {
      toast.warning("Event tidak bisa diedit karena sudah di Publish!");
      return;
    }
    router.push(`/event/${eventId}`);
    setSelectedEvent(event!);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/${selectedEvent.id}`,
        selectedEvent,
        { withCredentials: true }
      );

      const updatedEvents = events.map((event) =>
        event.id === selectedEvent.id ? response.data.data : event
      );
      setEvents(updatedEvents);

      toast.success("Event updated successfully!");
      closeEditModal();
    } catch (err) {
      console.error("Error updating event:", err);
      toast.error("Failed to update event");
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";

    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEventStatus = (
    startDate: Date | string | null,
    endDate: Date | string | null
  ) => {
    if (!startDate || !endDate) return "upcoming";

    const now = new Date();
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "ongoing";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-3 py-1 bg-stone-100 text-sky-800 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-stone-100 px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 text-center sm:text-left w-full sm:w-auto">
          My Events
        </h1>
        <button
          onClick={() => router.push("/event")}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-slate-700 text-white rounded-xl shadow hover:bg-slate-800 transition w-full sm:w-auto justify-center"
        >
          <span className="text-xl">+</span> Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4">
          <p className="text-slate-500 text-base sm:text-lg mb-4">
            You haven't created any events yet
          </p>
          <button
            onClick={() => router.push("/event")}
            className="px-5 py-2 bg-slate-700 text-white rounded-xl shadow hover:bg-slate-800 transition"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl hover:border-sky-700 transition-all overflow-hidden"
            >
              <div className="h-36 sm:h-48 overflow-hidden bg-slate-100">
                <img
                  src={event.banner_url || "/default-event-banner.jpg"}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/default-event-banner.jpg";
                  }}
                />
              </div>
              <div className="p-3 sm:p-4 md:p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-800 truncate pr-2">
                    {event.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-semibold whitespace-nowrap ${
                      getEventStatus(event.start_date, event.end_date) ===
                      "upcoming"
                        ? "bg-yellow-100 text-yellow-800"
                        : getEventStatus(event.start_date, event.end_date) ===
                          "ongoing"
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {getEventStatus(event.start_date, event.end_date)}
                  </span>
                </div>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    <span className="inline-block">
                      {formatDate(event.start_date)} -{" "}
                      {formatDate(event.end_date)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    <span className="truncate inline-block">
                      {event.location || "Online"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {event.category?.name || "General"}
                  </p>
                  <p>
                    <span className="font-medium">Seats:</span>{" "}
                    {event.available_seats} available
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleViewAttendees(event.id)}
                    className="text-sky-500 hover:text-sky-700 text-xs sm:text-sm font-medium"
                  >
                    View Attendees
                  </button>
                  <button
                    onClick={() => {
                      handleEditEvent(event.id);
                    }}
                    className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-700 rounded-md hover:bg-sky-50 hover:text-sky-700 border border-slate-200 transition text-xs sm:text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsTab;
