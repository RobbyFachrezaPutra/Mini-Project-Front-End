'use client'

import React, { useState } from "react";
import { Formik, Field, Form, FieldArray } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Jangan lupa untuk mengimport styling
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import MenuBar from "@/components/event/detail/menu-bar";
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

export default function EventForm() {
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<"free" | "paid" | null>(null);
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
      Highlight
    ],
    content: '', // Starting content for the editor
    editorProps:{
      attributes:{
        class: "min-h-[156px] border rounded-md bg-slate-50 py-2 px-3"
      }
    }
  });

  return (<>
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
      <Formik
        initialValues={{
          name: "",
          banner: "",
          description: "",
          startDate: new Date(),
          endDate: new Date(),
          startTime: "",
          endTime: "",
          location: "",
          tickets: []
        }}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
        {({ values, setFieldValue }) => (
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
            </div>
            <div className="mb-4">
              <Field name="banner">
                {({ field }: any) => (
                  <input
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Banner URL"
                  />
                )}
              </Field>
            </div>
            <div className="mb-4">
            <div className="space-y-4">
              <label className="block text-sm font-medium">Description</label>
              <div className="border p-4 rounded-md">
              <MenuBar editor={editor}/>
                <EditorContent editor={editor} />
              </div>
            </div>            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <DatePicker
                  selected={values.startDate}
                  onChange={(date: Date | null) => setFieldValue("startDate", date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Date</label>
                <DatePicker
                  selected={values.endDate}
                  onChange={(date: Date | null) => setFieldValue("endDate", date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Field name="startTime">
                  {({ field }: any) => (
                    <input
                      type="time"
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Start Time (HH:MM)"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field name="endTime">
                  {({ field }: any) => (
                    <input
                    type="time"
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="End Time (HH:MM)"
                    />
                  )}
                </Field>
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
            </div>

            <div className="flex gap-4 mb-4">
              <button
                type="button"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                onClick={() => {
                  setTicketCategory("free");
                  setTicketDialogOpen(true);
                }}
              >
                ➕ Free Ticket
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                onClick={() => {
                  setTicketCategory("paid");
                  setTicketDialogOpen(true);
                }}
              >
                💰 Paid Ticket
              </button>
            </div>

            <FieldArray name="tickets">
              {({ remove }) => (
                <div className="mt-4">
                  {values.tickets.map((ticket: any, index: number) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      <p className="font-semibold">🎟 {ticket.name} ({ticket.category})</p>
                      <p>{ticket.description}</p>
                      <p>Qty: {ticket.quantity} | Price: {ticket.price}</p>
                      <p>Sell: {ticket.startSell} - {ticket.endSell}</p>
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

            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
            >
              Submit Event
            </button>
          </Form>
        )}
      </Formik>
    </div>
  </>
  );
}
