module Prompts
v1 = "Give me the broad topic in which the listeners are interested, that it is about.
Then based on that text, give me exactly 5 questions and answers to them separated by a dash, keeping the answers short, and most importantly following the following format:
1. Why did George Washington want to be called Mr. President? - To emphasize the difference between the democratic government, and the European monarchies.
2. Why is Pluto no longer considered a planet? - Because it has not cleared its neighboring region of other objects."

v2 = "Give me the broad topic in which the listeners are interested, that it is about.
Then based on that text, give me exactly 5 questions and answers to them separated by a dash, preferably one sentence each, and most importantly following the following format:
1. Why did George Washington want to be called Mr. President? - To emphasize the difference between the democratic government, and the European monarchies.
2. Why is Pluto no longer considered a planet? - Because it has not cleared its neighboring region of other objects."

forcedstart_v1 = "Here is the topic and the question answer pairs separated by a dash like you specified.\nTopic:"

brevify_v1 = "Give me the broad topic in which the listeners are interested, that it is about.
Then, do you know what pareto 80/20 rule is? I would like you to redact the text to be 20% as long but containing 80% of information (relevant to the topic), it should look more like an article."

forcedstart_brevify = "I understand, I will redact the text accordingly.\nTopic:"


end