import Paystack from "paystack-api";
import Flutterwave from "flutterwave-node-v3";

const penv = process.env;
const PAYSTACK_API_KEY = penv.PAYSTACK_SECRET_KEY;
const FLUTTERWAVE_PUBLIC_KEY = penv.FLUTTERWAVE_PUBLIC_KEY;
const FLUTTERWAVE_SECRET_KEY = penv.FLUTTERWAVE_SECRET_KEY;

export const paystackInstance = Paystack(PAYSTACK_API_KEY);
export const flutterwaveInstance = new Flutterwave(FLUTTERWAVE_PUBLIC_KEY, FLUTTERWAVE_SECRET_KEY);
