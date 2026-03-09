import { api } from "./apiClient";

export async function createSlot(payload) {
  const res = await api.post("/interviews/slots", payload);
  return res.data;
}

export async function getOpenSlots() {
  const res = await api.get("/interviews/slots/open");
  return res.data;
}

export async function bookSlot(slotId) {
  const res = await api.post(`/interviews/slots/${slotId}/book`);
  return res.data;
}

export async function confirmBooking(bookingId) {
  const res = await api.post(`/interviews/bookings/${bookingId}/confirm`);
  return res.data;
}

export async function getSessionByBookingId(bookingId) {
  const res = await api.get(`/interviews/bookings/${bookingId}/session`);
  return res.data;
}