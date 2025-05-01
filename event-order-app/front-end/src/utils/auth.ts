import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Menggunakan URL dari .env

export const register = async (data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}) => {
  const response = await axios.post(
    `${API_URL}/api/eventorder/auth/register`,
    data
  );
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await axios.post(
    `${API_URL}/api/eventorder/auth/login`,
    data
  );
  return response.data;
};

export const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};
