import axios from "axios";

export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/register`, data);
    return res;
  } catch (error) {
    return error;
  }
};

export const loginUser = async (data) => {
  try {
    const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/login`, data);
    return res;
  } catch (error) {
    return error;
  }
};
