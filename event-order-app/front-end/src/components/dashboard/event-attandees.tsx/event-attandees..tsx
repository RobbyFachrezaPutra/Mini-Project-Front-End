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
}

interface EventData {
  name: string;
  attendees: Attendee[];
}

const AttendeesPage = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [eventName, setEventName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendees = async () => {
      if (!eventId) return;
      try {
        const res = await axios.get<{
          data: {
            name: string;
            attendees: Attendee[];
          };
        }>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/${eventId}/attendees`,
          {
            withCredentials: true,
          }
        );
        setAttendees(res.data.data.attendees);
        setEventName(res.data.data.name);
      } catch (err) {
        console.error("Failed to fetch attendees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId]);

  return (
    <div className="p-6 bg-sky-100 min-h-screen">
      <h1 className="text-3xl font-bold text-sky-800">
        Attendees for {eventName}
      </h1>
      <button
        onClick={() => router.push("/pages/dashboard")}
        className="mb-4 pt-4 text-sky-600 hover:underline"
      >
        ← Back to Dashboard
      </button>

      {loading ? (
        <p>Loading attendees...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-600">
                  No.
                </th>
                <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-600">
                  Full Name
                </th>
                <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-600">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {attendees.length > 0 ? (
                attendees.map((attendee, index) => (
                  <tr
                    key={attendee.id}
                    className={
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                  >
                    <td className="px-4 py-2 border-b text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border-b text-sm text-gray-700">
                      {attendee.first_name} {attendee.last_name}
                    </td>
                    <td className="px-4 py-2 border-b text-sm text-gray-700">
                      {attendee.email}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-4 border-b text-center text-sm text-gray-500"
                  >
                    No attendees found for this event.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendeesPage;
