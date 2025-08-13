// configuration options for Master bingo
import logo from "/master-logo.jpg";
const API_URL = import.meta.env.VITE_APP_API_URL;
const BINGO_NAME = "ማስተር ቢንጎ";
const PHONE_NUMBER1 = "+251 932 487 282 | ማስተር ቢንጎ ድጋፍ";
const BINGO_CALLER_NAME = "ማስተር";
const config = {
  apiUrl: API_URL,
  bingoName: BINGO_NAME,
  phoneNumber: PHONE_NUMBER1,
  bingoCallerName: BINGO_CALLER_NAME,
  logo: logo,
};

export default config;
