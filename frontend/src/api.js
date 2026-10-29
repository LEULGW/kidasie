import axios from 'axios';

// send the login cookie with every request
axios.defaults.withCredentials = true;

export const API_URL = (
  process.env.REACT_APP_API_URL || 'https://kidasie-backend.onrender.com'
).replace(/\/$/, '');

// full URL for a song/recording file stored on the backend
export const fileUrl = (path) =>
  encodeURI(`${API_URL}/${String(path).replace(/^\//, '')}`);

export default axios;