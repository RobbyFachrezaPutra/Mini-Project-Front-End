"use client";

import React, { useState, useEffect } from "react";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import MenuBar from "@/components/event/menu-bar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TicketDialog from "@/components/ticket";
import VoucherDialog from "@/components/voucher";
import api from "@/lib/axiosInstance";
import { IEvent } from "@/interface/event.interface";
import { IEventCategoryParam } from "@/interface/event-category.interface";
import { id } from "date-fns/locale";
import { IUserParam } from "@/interface/user.interface";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

registerLocale("id", id);

const EventSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  category_id: Yup.number()
    .required("Category is required")
    .min(1, "Category must be selected"), // Harus dipilih
  start_date: Yup.date()
    .required("Start date is required")
    .test(
      "is-before-end",
      "Start date must be before end date",
      function (value) {
        return !this.parent.end_date || value <= this.parent.end_date;
      }
    ),
  end_date: Yup.date()
    .required("End date is required")
    .test(
      "is-after-start",
      "End date must be after start date",
      function (value) {
        return !this.parent.start_date || value >= this.parent.start_date;
      }
    ),
  location: Yup.string().required("Location is required"),
  available_seats: Yup.number()
    .required("Available seats is required")
    .min(1, "Available seats must be more than 0"), // Harus diisi dan lebih dari 0
  status: Yup.string()
    .required("Status is required")
    .test(
      "is-valid-status",
      "Status must be selected from combobox",
      function (value) {
        return value !== ""; // Validasi dasar status dari combobox
      }
    ),
  tickets: Yup.array()
    .min(1, "At least one ticket is required") // Harus ada minimal satu tiket
    .required("Tickets are required"),
});

export default function EventDetail() {
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [categories, setcategories] = useState<IEventCategoryParam[]>([]);
  const [storedUser, setStoredUser] = useState<IUserParam | null>(null);
  const router = useRouter();
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
    content: "", // Starting content for the editor
    editorProps: {
      attributes: {
        class: "min-h-[200px] border rounded-md bg-slate-50 py-2 px-3",
      },
    },
  });

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    ) as IUserParam;
    setStoredUser(user);
    api
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/event-categories`,
        {
          withCredentials: true,
        }
      )
      .then((res) => setcategories(res.data.data))
      .catch((err) => {});
  }, []);

  return (
    <>
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
        <Formik<IEvent>
          initialValues={{
            id: 0,
            organizer_id: 0,
            name: "",
            banner_url: "",
            description: "",
            category_id: 0,
            start_date: null,
            end_date: null,
            location: "",
            available_seats: 0,
            status: "",
            created_at: new Date(),
            updated_at: new Date(),
            tickets: [],
            vouchers: [],
            category: null,
            organizer: null,
          }}
          validationSchema={EventSchema}
          onSubmit={async (values) => {
            try {
              const formData = new FormData();

              formData.append("organizer_id", storedUser!.id.toString());
              formData.append("name", values.name);
              formData.append(
                "description",
                JSON.stringify(editor?.getJSON() || {})
              );
              formData.append("category_id", values.category_id.toString());
              formData.append(
                "start_date",
                values.start_date?.toISOString() || ""
              );
              formData.append("end_date", values.end_date?.toISOString() || "");
              formData.append("location", values.location);
              formData.append(
                "available_seats",
                values.available_seats.toString()
              );
              formData.append("status", values.status);

              if (values.banner_url) {
                formData.append("banner_url", values.banner_url);
              }

              const tickets = values.tickets.map((ticket) => ({
                ...ticket,
                type: ticket.price > 0 ? "Paid" : "Free",
                created_by_id: storedUser!.id,
                remaining: ticket.quota,
              }));

              formData.append("tickets", JSON.stringify(tickets));

              const vouchers = values.vouchers.map((voucher) => ({
                ...voucher,
                created_by_id: storedUser!.id,
              }));
              // Serialize tickets and vouchers to JSON string
              formData.append("vouchers", JSON.stringify(vouchers));

              await api.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events`,
                formData,
                {
                  withCredentials: true,
                }
              );

              toast.success("Event saved successfully!");
              router.push("/pages/dashboard"); // saya benerin ini kang
            } catch (error) {
              toast.error("Failed to save event");
            }
          }}
        >
          {({ values, setFieldValue, setFieldTouched }) => (
            <Form className="space-y-4">
              <div className="mb-4">
                <Field name="name">
                  {({ field }: any) => (
                    <input
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Event Name"
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="mb-4">
                <Field
                  as="select"
                  name="category_id"
                  className="py-2 px-3 rounded-xl text-black border-2 border-stone-50 bg-white w-full sm:w-auto"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="category_id"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Banner</label>
                <input
                  name="banner_url"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setFieldValue("banner_url", file);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <ErrorMessage
                  name="banner_url"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="mb-4">
                <div className="space-y-4">
                  <label className="block text-sm font-medium">
                    Description
                  </label>
                  <div className="border p-4 rounded-md">
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <DatePicker
                    selected={values.start_date}
                    onChange={(date: Date | null) => {
                      setFieldValue("start_date", date);
                      setFieldTouched("start_date", true); // Tambahkan ini!
                    }}
                    placeholderText="sell start date"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="Pp" // Pp = locale-aware date + time
                    locale="id" // <- ini penting
                    className="w-[200px] p-2 border border-gray-300 rounded-md mr-0.5"
                  />
                  <ErrorMessage
                    name="start_date"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div>
                  <DatePicker
                    selected={values.end_date}
                    onChange={(date: Date | null) => {
                      setFieldValue("end_date", date);
                      setFieldTouched("end_date", true); // Tambahkan ini!
                    }}
                    placeholderText="sell end date"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="Pp" // Pp = locale-aware date + time
                    locale="id" // <- ini penting
                    className="w-[200px] p-2 border border-gray-300 rounded-md mr-0.5"
                  />
                </div>
              </div>
              <div className="mb-4">
                <Field name="location">
                  {({ field }: any) => (
                    <input
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Location"
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="location"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <Field name="available_seats">
                  {({ field, form }: any) => {
                    const handleChange = (
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => {
                      const value = e.target.value.replace(/\D/g, ""); // hanya angka
                      form.setFieldValue("available_seats", value);
                    };

                    return (
                      <input
                        {...field}
                        type="text" // tetap text biar bisa kontrol isi-nya
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={handleChange}
                        value={field.value}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Number of seats"
                      />
                    );
                  }}
                </Field>
                <ErrorMessage
                  name="available_seats"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <Field name="status">
                  {({ field }: any) => (
                    <select
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Pilih status</option>
                      <option value="Draft">Draft</option>
                      <option value="Publish">Publish</option>
                    </select>
                  )}
                </Field>
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  className="w-[100px] px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                  onClick={() => {
                    setTicketDialogOpen(true);
                  }}
                >
                  Ticket
                </button>
                <button
                  type="button"
                  className="w-[100px] px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  onClick={() => {
                    setVoucherDialogOpen(true);
                  }}
                >
                  Voucher
                </button>
              </div>
              <div className="flex flex-cols-2 gap-4 mb-4">
                <div>
                  <FieldArray name="tickets">
                    {({ remove }) => (
                      <div className="mt-4">
                        {values.tickets.map((ticket: any, index: number) => (
                          <div key={index} className="p-2 border rounded mb-2">
                            <p className="font-bold">Ticket</p>
                            <p className="font-semibold">
                              🎟 {ticket.name} ({ticket.type})
                            </p>
                            <p>{ticket.description}</p>
                            <p>
                              Qty: {ticket.quota} | Price: {ticket.price}
                            </p>
                            <p>
                              Sell: {ticket.sales_start.toLocaleDateString()} -{" "}
                              {ticket.sales_end.toLocaleDateString()}
                            </p>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="mt-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                            >
                              🗑 Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                </div>
                <div className="ml-auto">
                  <FieldArray name="vouchers">
                    {({ remove }) => (
                      <div className="mt-4">
                        {values.vouchers.map((voucher: any, index: number) => (
                          <div key={index} className="p-2 border rounded mb-2">
                            <p className="font-bold">Voucher</p>
                            <p className="font-semibold">🎟 {voucher.code}</p>
                            <p>{voucher.description}</p>
                            <p>{voucher.discount_amount}</p>
                            <p>
                              Sell: {voucher.sales_start.toLocaleDateString()} -{" "}
                              {voucher.sales_end.toLocaleDateString()}
                            </p>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="mt-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                            >
                              🗑 Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>
              <div className="flex gap-4 mb-4 ml-auto">
                <div className="ml-auto">
                  <button
                    type="submit"
                    className="w-[100px] mr-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                  >
                    Submit
                  </button>
                  <button
                    type="reset"
                    className="w-[100px] px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                    onClick={() => router.push("/dashboard")} // Navigasi ke halaman dashboard
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <TicketDialog
                open={ticketDialogOpen}
                onClose={() => setTicketDialogOpen(false)}
                onAddTicket={(ticket) =>
                  setFieldValue("tickets", [...values.tickets, ticket])
                }
              />
              <VoucherDialog
                open={voucherDialogOpen}
                onClose={() => setVoucherDialogOpen(false)}
                onAddVoucher={(voucher) =>
                  setFieldValue("vouchers", [...values.vouchers, voucher])
                }
              />
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}
