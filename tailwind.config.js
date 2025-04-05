/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        //mau sang
        lightBgLogin:"#e8f3ff",

        // mau toi
        darkBgLogin:"#1e293b"
      }
    },
  },
  plugins: [],
};
