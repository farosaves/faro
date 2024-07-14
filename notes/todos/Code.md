what the heck is overview component?
- [ ] Javascript for the dashboard layout - omg
- [ ] I suspect the refresh problem is because the source ID is somehow disappearing?
- [ ] No - because the flash appears to happen on refresh regardless - why?
	or should I just adjust it to wait for the mock?... like send it after 200ms?
	no because 😊 it Presently refreshes all of them.

- [ ] Double clicking the tag shouldn't edit with tagify but using my `rename this tag` modal
- [ ] I'm not cleaning up the hash when making the link - There was faros parameters cleanup, but it only handled query parameters and not the hash.
- [ ] Logging out, I did not get the prompt on the dashboard page without refreshing.
- [ ] rename this tag group when right click on the tag group - currently only updates the tag so only the strict matches and not the startsWiths
- [x]  text overflow so that it does 3 or 4 lines - https://web.dev/learn/css/overflow#single_line_overflow_with_text-overflow
- [ ] If I change the active tab while it's going to the snippet, so before it goes to the snippet, then it doesn't do it.
	- [x] Check if the underlining is still happening or no I think not. NO
	- [x] So have a variable for whether it has run or I think there is one already.
	- [x] and try running it when the window is focused DOESNT WORK
- [ ] Potentially I can listen to DOM updates and deserialize whenever one happens and the snippet appears


### Book mark sync 2
- [x] Create a store in shared for tracking if user requests thinking bookmarks
	- [x] should be false by default
	- [x] should be changed in the side panel cog button
	- [x] The button should display syncing or not syncing depending on what's set.
	If it is syncing, I should...
	- [x] sync on refresh
	- [x] and on a pulse every minute
	- [x] by checking the hash
- [x] Check existing bookmarks
- [x] See if any bookmark since last update
- [x] Walk existing bookmarks
- [x] Filter out the faro one
- [ ] yo

### flashing new note
* check `funLog("localSrc_id")` doesn't log `None`  would mean sth's wrong