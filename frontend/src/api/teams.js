import api from "./axios";

export const teamsApi = {
  // Get solo candidates available for an event
  getCandidates: async (eventId, { gender, branch } = {}) => {
    const params = {};
    if (gender && gender !== "All") params.gender = gender;
    if (branch && branch !== "All") params.branch = branch;
    const res = await api.get(`/teams/matchmaker/candidates/${eventId}`, { params });
    return res.data;
  },

  // Send team join request to a candidate
  sendRequest: async ({ eventId, receiverId, teamId, message }) => {
    const res = await api.post("/teams/request", { eventId, receiverId, teamId, message });
    return res.data;
  },

  // Respond to incoming team request (Accept / Decline)
  respondRequest: async (requestId, action) => {
    const res = await api.post(`/teams/request/${requestId}/respond`, { action });
    return res.data;
  },

  // Get user's incoming and outgoing team requests
  getRequests: async () => {
    const res = await api.get("/teams/requests");
    return res.data;
  },

  // Create team manually
  createTeam: async ({ eventId, teamName }) => {
    const res = await api.post("/teams/create", { eventId, teamName });
    return res.data;
  },

  // Join existing squad via team code
  joinByCode: async (teamCode) => {
    const res = await api.post("/teams/join-by-code", { teamCode });
    return res.data;
  },

  // Get all squads user is a member of
  getMyTeams: async () => {
    const res = await api.get("/teams/my-teams");
    return res.data;
  },
};
