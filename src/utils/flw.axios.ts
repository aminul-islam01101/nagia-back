import axios from "axios";

const flwApi = axios.create({
  baseURL: "https://api.flutterwave.com/v3",
  timeout: 5000,
  headers: { Authorization: `Bearer ${String(process.env.FLUTTERWAVE_SECRET_KEY)}` },
});

export default flwApi;
