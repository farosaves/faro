/** @type {import('tailwindcss').Config} */
export default {
	content: ['./**/*.{html,js,svelte,ts}', './*.{html,js,svelte,ts}', './index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')]
};
