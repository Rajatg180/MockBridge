import { apiClient, publicClient } from './client';

export const authApi = {
  register(payload) {
    return publicClient
      .post('/auth/register', payload, { skipAuth: true })
      .then((response) => response.data);
  },

  login(payload) {
    return publicClient
      .post('/auth/login', payload, { skipAuth: true })
      .then((response) => response.data);
  },

  refresh(payload) {
    return publicClient
      .post('/auth/refresh', payload, { skipAuth: true })
      .then((response) => response.data);
  },

  logout(refreshToken) {
    return publicClient
      .post('/auth/logout', { refreshToken }, { skipAuth: true })
      .then((response) => response.data);
  },

  getMe() {
    return apiClient.get('/me').then((response) => response.data);
  },
};

export const userApi = {
  getMyProfile() {
    return apiClient.get('/users/me').then((response) => response.data);
  },

  createMyProfile(payload) {
    return apiClient.post('/users/me', payload).then((response) => response.data);
  },

  updateMyProfile(payload) {
    return apiClient.put('/users/me', payload).then((response) => response.data);
  },

  addMySkill(payload) {
    return apiClient
      .post('/users/me/skills', payload)
      .then((response) => response.data);
  },

  deleteMySkill(skillId) {
    return apiClient.delete(`/users/me/skills/${skillId}`);
  },

  getPublicProfile(userId) {
    return apiClient.get(`/users/${userId}`).then((response) => response.data);
  },

  searchInterviewers(skill) {
    return apiClient
      .get('/users/search/interviewers', {
        params: { skill },
      })
      .then((response) => response.data);
  },
};

export const interviewApi = {
  getOpenSlots() {
    return apiClient
      .get('/interviews/slots/open')
      .then((response) => response.data);
  },

  createSlot(payload) {
    return apiClient
      .post('/interviews/slots', payload)
      .then((response) => response.data);
  },

  getMySlots() {
    return apiClient.get('/interviews/me/slots').then((response) => response.data);
  },

  cancelSlot(slotId) {
    return apiClient.delete(`/interviews/slots/${slotId}`);
  },

  hardDeleteSlot(slotId) {
    return apiClient.delete(`/interviews/slots/${slotId}/hard-delete`);
  },

  bookSlot(slotId) {
    return apiClient
      .post(`/interviews/slots/${slotId}/book`)
      .then((response) => response.data);
  },

  cancelMyBooking(bookingId) {
    return apiClient.delete(`/interviews/bookings/${bookingId}/cancel`);
  },

  getIncomingBookingRequests(status = 'PENDING') {
    return apiClient
      .get('/interviews/me/booking-requests', {
        params: { status },
      })
      .then((response) => response.data);
  },

  confirmBooking(bookingId) {
    return apiClient
      .post(`/interviews/bookings/${bookingId}/confirm`)
      .then((response) => response.data);
  },

  getMyBookings() {
    return apiClient
      .get('/interviews/me/bookings')
      .then((response) => response.data);
  },

  getSession(bookingId) {
    return apiClient
      .get(`/interviews/bookings/${bookingId}/session`)
      .then((response) => response.data);
  },
};