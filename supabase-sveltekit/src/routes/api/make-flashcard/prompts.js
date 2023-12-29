export function make_prompt1(website_title, text) { 
	return `I will give you a piece of text which is taken from the website titled "${website_title}".
	The text is as follows: "${text}"
	Here the text ends.
	First identify the broad topic that the reader is interested in.
	Then for each sentence we want to have a deletion cloze flashcard where the piece of information is  like this:
	"The World War Two began in the year {{1939}}."
	"The 16th president of the United States was {{Abraham Lincoln}}"
	Only return sentences following the specified format.`
}

export function make_prompt1_1(website_title, text) { 
	return `I will give you a piece of text which is taken from the website titled "${website_title}".
	The text is as follows: "${text}"
	Here the text ends.
	First identify the broad topic that the reader is interested in.
	Then for each sentence we want to have a deletion cloze flashcard like this:
	"The World War Two began in the year ???. - 1939"
	"The 16th president of the United States was ???. - Abraham Lincoln"
	Only return sentences following the specified format.`
}


export function make_prompt2(website_title, text) { 
	return `I will give you a piece of text which is taken from the website titled "${website_title}".
	The text is as follows: "${text}"
	Here the text ends.
	For each sentence we want to have a deletion cloze flashcard where the piece of information is  like this:
	"The World War Two began in the year {{1939}}."
	"The 16th president of the United States was {{Abraham Lincoln}}"
	Only return sentences like this and they need to follow the specified format.`
}

export function make_prompt3(website_title, text) { 
	return `I will give you a piece of text which is taken from the website titled "${website_title}".
	The text is as follows: "${text}"
	Here the text ends.
	We want to have a deletion cloze flashcards where the piece of information is  like this:
	"The World War Two began in the year {{1939}}."
	"The 16th president of the United States was {{Abraham Lincoln}}"
	Only return sentences like this and they need to follow the specified format.`
}

export function QA_prompt1(n_cards, website_title, text) {return `I will give you a piece of text which is taken from the website titled "${website_title}".
The text is as follows: "${text}"
Here the text ends.
Give me the broad topic in which the reader is interested, that it is about.
Then based on that text, give me exactly ${n_cards} questions and answers to them separated by a dash, preferably one sentence each, and most importantly following the following format:
1. Why did George Washington want to be called Mr. President? - To emphasize the difference between the democratic government, and the European monarchies.
2. Why is Pluto no longer considered a planet? - Because it has not cleared its neighboring region of other objects.`
}


export function QA_prompt_response1() {
	return `Here is the topic and the question answer pairs separated by a dash like you specified.\nTopic:`
}


export function prompt_response0() {
	return ""
}

export function prompt_response1() {
	return `Here is the topic and the sentences where the information is surrounded by double braces like you specified.\nTopic:`
}
