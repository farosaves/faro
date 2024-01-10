/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./**/*.{html,js,svelte,ts}',
		'./*.{html,js,svelte,ts}',
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}'
	],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['light', 'dark', 'cupcake', 'synthwave', 'forest', 'retro', 'cyberpunk']
		// false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
	}
};
