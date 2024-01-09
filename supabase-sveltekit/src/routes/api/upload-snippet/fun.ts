export let is4Cloze = (selectedText: string) => selectedText.split(' ').length < 6;

export function makeCloze(selectedText: string, contextText: string) {
	return {
		front: contextText.replace(selectedText, '{{c1:' + selectedText + '}}'),
		back: null
	};
}

export function makeSnippet(selectedText: string, contextText: string) {
	if (!is4Cloze(selectedText)) {
		return selectedText;
	}
    const regex = /([^\.]|\.\d|\d\.)+/  // anything but dots unless the dot is adj to a digit
	// now close case
	let [pre, post] = contextText.split(selectedText)
	return (pre.split("").reverse().join("").match(regex)![0].split("").reverse().join("") + selectedText + post.match(regex)![0]).trim() + "."
	// return contextText.slice(pre, contextText.length-post)
}
