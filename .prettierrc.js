module.exports = {
    printWidth: 110,
bracketSameLine: true,
semi: false,
singleQuote: false,
// svelteSortOrder: 'styles-scripts-markup',
svelteStrictMode: false,
plugins:['prettier-plugin-svelte'],
overrides: [{ files: "*.svelte", options: { parser: "svelte" } }]
}