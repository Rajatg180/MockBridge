import { api } from "./apiClient";

export async function createProfile(payload) {
  const res = await api.post("/users/me", payload);
  return res.data;
}

export async function getMyProfile() {
  const res = await api.get("/users/me");
  return res.data;
}

export async function updateProfile(payload) {
  const res = await api.put("/users/me", payload);
  return res.data;
}

export async function addSkill(payload) {
  const res = await api.post("/users/me/skills", payload);
  return res.data;
}

export async function deleteSkill(skillId) {
  await api.delete(`/users/me/skills/${skillId}`);
}

export async function searchInterviewers(skill) {
  const res = await api.get(`/users/search/interviewers?skill=${encodeURIComponent(skill)}`);
  return res.data;
}