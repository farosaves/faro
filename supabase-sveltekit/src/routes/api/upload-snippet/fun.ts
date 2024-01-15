export let is2short = (selectedText: string) => selectedText.split(' ').length < 4;

export function makeQuote(selectedText: string, contextText: string) {
	if (!is2short(selectedText)) {
		return selectedText;
	}
	const regex_cit = /\[\d{1,2}\]/u;
	const regex_post = /^([^\.!\?]|\.\d|\d\.|\.[^\.]\.|\w\.\w)+/u; // from the start
	const regex_pre = /([^\.\?]|\.\d|\d\.|\.[^\.]\.|\w\.\w)+$/u; // from the end
	let [pre, ...posts] = contextText.replace(regex_cit, '').split(selectedText);
	let post = posts.join(selectedText);
	let f = (v: RegExpMatchArray | null) => (v && v[0]) || '';
	return (f(pre.match(regex_pre)) + selectedText + f(post.match(regex_post))).trim() + '.';
	// return contextText.slice(pre, contextText.length-post)
}
