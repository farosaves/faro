export let is4Cloze = (selectedText: string) => selectedText.split(' ').length < 6;

export function makeCloze(selectedText: string, contextText: string) {
	return {
		front: contextText.replace(selectedText, '{{c1:' + selectedText + '}}'),
		back: null
	};
}

export function makeQuote(selectedText: string, contextText: string) {
	if (!is4Cloze(selectedText)) {
		return selectedText;
	}

    const regex_post = /^([^\.!\?]|\.\d|\d\.|\.[^\.]\.)+/u // from the start 
    const regex_pre = /([^\.\?]|\.\d|\d\.|\.[^\.]\.)+$/u  // from the end
	let [pre, post] = contextText.split(selectedText)
	return (pre.match(regex_pre)![0] + selectedText + post.match(regex_post)![0]).trim() + "."
	// return contextText.slice(pre, contextText.length-post)
}
