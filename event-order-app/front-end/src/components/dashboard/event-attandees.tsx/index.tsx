"use client";

import { useRouter } from "next/navigation";

function AttendeesPage() {
  const router = useRouter();

  // Data dummy dengan kategori tiket
  const attendees = [
    {
      name: "John Doe",
      tickets: [
        { type: "VIP", qty: 1, price: 500000 },
        { type: "Reguler", qty: 2, price: 200000 },
      ],
    },
    {
      name: "Jane Smith",
      tickets: [{ type: "VIP", qty: 3, price: 500000 }],
    },
  ];

  // Hitung total per attendee
  const attendeesWithTotal = attendees.map((attendee) => {
    const total = attendee.tickets.reduce(
      (sum, ticket) => sum + ticket.qty * ticket.price,
      0
    );
    return {
      ...attendee,
      total: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(total),
    };
  });

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="px-14 py-10">
        {" "}
        {/* Consistent with dashboard layout */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-sky-800">Attendees</h1>
          <button
            onClick={() => router.push("/pages/dashboard")}
            className="text-sky-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
        {/* Tabel Attendees */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {" "}
          {/* Matching card style */}
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Nama
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Detail Tiket
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendeesWithTotal.map((attendee, index) => (
                <tr key={index}>
                  <td className="p-4 text-sm text-gray-900">{attendee.name}</td>
                  <td className="p-4 text-sm text-gray-500">
                    <ul className="list-disc pl-5">
                      {attendee.tickets.map((ticket, i) => (
                        <li key={i} className="py-1">
                          <span className="font-medium">{ticket.type}</span> (
                          {ticket.qty}x):{" "}
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(ticket.price)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {attendee.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AttendeesPage;
