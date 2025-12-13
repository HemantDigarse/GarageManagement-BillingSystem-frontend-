import axios from "axios";

const API_URL = "http://localhost:8080/api/vehicles";

export const listVehicles = async () => {
  const res = await axios.get(API_URL, { withCredentials: true });
  return res.data;
};

export const createVehicle = async (data) => {
  const res = await axios.post(API_URL, data, { withCredentials: true });
  return res.data;
};

export const updateVehicle = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, { withCredentials: true });
  return res.data;
};

export const deleteVehicle = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
  return res.data;
};
