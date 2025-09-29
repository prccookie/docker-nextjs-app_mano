module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './app/**/*.{js,ts,jsx,tsx}',
        './app/globals.css', // ✅ globals.css を含める
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}