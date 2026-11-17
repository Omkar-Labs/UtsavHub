import api from "./axios";

export const eventsApi = {
  // Get all events with optional filters (?category=&eventType=&institute=)
  getAll: async (params = {}) => {
    const res = await api.get("/events", { params });
    return res.data;
  },

  // Get single event by id
  getById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  // Create event (Admin only)
  create: async (eventData) => {
    const res = await api.post("/events", eventData);
    return res.data;
  },

  // Register for event (Student only)
  register: async (eventId, registrationData) => {
    const res = await api.post(`/events/${eventId}/register`, registrationData);
    return res.data;
  },

  // Get active tickets for logged in student
  getMyTickets: async () => {
    const res = await api.get("/events/user/my-tickets");
    return res.data;
  },

  // Verify ticket QR / ID code (Admin Gate Check-in)
  verifyTicketQr: async ({ token, eventId }) => {
    const res = await api.post("/events/gate/verify-ticket", { token, eventId });
    return res.data;
  },

  // Get attendees and analytics for an event (Admin only)
  getAttendees: async (eventId) => {
    const res = await api.get(`/events/${eventId}/attendees`);
    return res.data;
  },
};
