export let is2short = (selectedText: string) => selectedText.split(' ').length < 6;

export function makeQuote(selectedText: string, contextText: string) {
	if (!is2short(selectedText)) {
		return selectedText;
	}
    const regex_post = /^([^\.!\?]|\.\d|\d\.|\.[^\.]\.|\w\.\w)+/u // from the start 
    const regex_pre = /([^\.\?]|\.\d|\d\.|\.[^\.]\.|\w\.\w)+$/u  // from the end
	let [pre, post] = contextText.split(selectedText)
	return (pre.match(regex_pre)![0] + selectedText + post.match(regex_post)![0]).trim() + "."
	// return contextText.slice(pre, contextText.length-post)
}