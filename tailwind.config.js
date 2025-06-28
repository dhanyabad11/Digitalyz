/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#e8f0fe",
                    100: "#c6dafc",
                    200: "#a5c7ff",
                    300: "#7facff",
                    400: "#5991ff",
                    500: "#4285f4", // Google blue
                    600: "#3367d6",
                    700: "#2a56c6",
                    800: "#1c3aa9",
                    900: "#0d2570",
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
