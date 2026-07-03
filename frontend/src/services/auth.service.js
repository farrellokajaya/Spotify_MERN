import api from "./api";

const registerRequest = async (payload) => {
  const response = await api.post(
    "/auth/register",
    payload
  );

  return response.data;
};

const loginRequest = async (payload) => {
  const response = await api.post(
    "/auth/login",
    payload
  );

  return response.data;
};

const getCurrentUserRequest = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export {
  registerRequest,
  loginRequest,
  getCurrentUserRequest,
};