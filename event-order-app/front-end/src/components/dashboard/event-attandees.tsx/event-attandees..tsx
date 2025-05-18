"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Attendee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  transaction_id: number;
  review?: {
    rating?: number;
    comment?: string;
  }; // REVIEW MODAL: ubah tipe review jadi object dengan rating & comment
  status?: string;
  ticket_type?: string;
  phone?: string; // Tambahan: ada di rendering, jadi harus diinterface juga
}

const AttendeesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [eventName, setEventName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // REVIEW MODAL: state untuk modal buka/tutup & review yang dipilih
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<{
    rating?: number;
    comment?: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) {
        setError("Event ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch event details and attendees in parallel
        const [eventRes, attendeesRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/${eventId}`,
            {
              withCredentials: true,
            }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/${eventId}/attendees`,
            {
              withCredentials: true,
            }
          ),
        ]);

        setEventName(eventRes.data.data?.name || "Unknown Event");

        // Handle different response structures
        const attendeesData =
          attendeesRes.data.data?.attendees || attendeesRes.data.data || [];
        setAttendees(Array.isArray(attendeesData) ? attendeesData : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger useEffect again
    window.location.reload();
  };

  // REVIEW MODAL: fungsi buka modal dengan data review yang dikirim
  const openReviewModal = (review?: { rating?: number; comment?: string }) => {
    setSelectedReview(review || null);
    setModalOpen(true);
  };

  // REVIEW MODAL: fungsi tutup modal
  const closeReviewModal = () => {
    setModalOpen(false);
    setSelectedReview(null);
  };

  if (loading) {
    return (
      <div className="p-6 bg-sky-100 min-h-screen flex flex-col">
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-800"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-sky-100 min-h-screen flex flex-col">
        <div className="max-w-4xl mx-auto flex-grow flex flex-col justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <h2 className="font-bold mb-2">Error loading attendees</h2>
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="mt-3 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-sky-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-sky-800">
            Attendees for {eventName}
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sky-600 hover:text-sky-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {attendees.length > 0 ? (
                  attendees.map((attendee, index) => (
                    <tr
                      key={`${attendee.id}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendee.first_name} {attendee.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendee.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendee.status || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openReviewModal(attendee.review)}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          View Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <p>No attendees found for this event.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REVIEW MODAL: modal popup untuk menampilkan review */}
        {modalOpen && (
          <div
            className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeReviewModal}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Review Details</h3>
              {selectedReview &&
              (selectedReview.rating || selectedReview.comment) ? (
                <>
                  <p>
                    <strong>Rating:</strong>{" "}
                    {selectedReview.rating ? (
                      <span>{selectedReview.rating} / 5</span>
                    ) : (
                      <span>No rating given</span>
                    )}
                  </p>
                  <p className="mt-2">
                    <strong>Comment:</strong>{" "}
                    {selectedReview.comment ? (
                      <span>{selectedReview.comment}</span>
                    ) : (
                      <span>No comment provided</span>
                    )}
                  </p>
                </>
              ) : (
                <p>No review available for this attendee.</p>
              )}

              <button
                onClick={closeReviewModal}
                className="mt-6 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeesPage;
