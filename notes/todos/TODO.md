
- [ ] starred / -> unstarred
- [ ] I can put one tag in the fragment identifier\
	only undo it when clicked another, so adding new tag doesn't auto-activate it
	then i can do links to tags
- [ ] Capture line breaks inside quote?
- [ ] debug changing titles in sources - for the same url the title can have a typo fix
- [ ] github oauth fix - shouldnt be my account when someone else is signing up - create an org and put faros there
- [ ] currSrc (&currSrcs) potentially undefined - rn it persists from the last page you were at
- [x] The in app dashboard should always redirect to the URL and not the note.
- [ ] banner 4 webstore
- [ ] improve my [screenshots](https://farosapp.com/notes/ffce59d7-ce19-426d-8a4c-bcc069de99c9) 4 webstore
- [ ] consider [canva](https://farosapp.com/notes/20b65fbc-fdb4-48de-a725-a365000b8aa7) for *parts* of the video 
- [ ] option to close sidebar on any navigation
- [ ] ...and display # of saves for curr page in the icon
- [x] extra prompt to download on the dashboard
- [x] REMOVED don't copy with noteId, just the`#_uuid`
- [x] make note redirect fast ~~- content 2 bg?~~
	- [x] moved to server part
- [x] Think more about SEO if I can just write more stuff 
- [ ] Ctrl Z didnt work - seemingly deleted the note in the ext but appeared on website - what would a refresh do?

- [ ] virtual list
	- [x] first test
	- [x] check if performance is due to this - i.e on a loaded vs emptyish account
	- [x] if yes - consider going month by month
- [ ] encryption
	- [x] identify which columns I want to have encrypted
		tags, highlights, user_note, snippet_uuid, serialised_highlight, prioritised, quote, url, source_id
	- [x] create a new database table with part of the columns encrypted
	- [ ] write an  encrypting, and decrypting functions that convert between the two row types

- [x] write a function to insert into Supabase log table
- [x] convert probably all log if error invocations to warn if error
- [x] revise the fun log invocations
- [ ] 🔎logg - for all other cases
	- [ ] check if doing now what expecting
- [ ] also check one from warnLog etc
- [ ] Don't make all URLs externally connectable.
- [x] find out why the session option is being logged
- [ ] make signing up much easier
	So for example, I can ask for the email, then check if there's an account associated with it, and then show you the password prompt if there is.
	- [ ] Think more about what the flow should look like.
		1. submit your email 
		2. either give the password or click the sign up button.


## bookmark sync
- [ ] If bookmarks are synced, then replace the sync bookmarks with latest new bookmarks added from outside of Faros.
	a [push](https://dev.farosapp.com/notes/6b92d44f-cfa6-4257-a97a-34b58c2d65b6) notification when someone made new bookmarks elsewhere?
## enc2
- [ ] Decide what to do with the IV.
- [x] write an encrypting function that takes a key and converts a note row to a save row.
- [x] Write an inverse function that also takes a key.
- [ ] Remember the next deployment should be like 0.2 and wait for approval so I deploy simultaneously.

## login page
- [x] Create two routes.
- [x] For now duplicate the code into both.
- [x] Remove the magic link option.
- [x] Look at the set password page

## debug
Performance in the built-in dashboard within the extension is much better.
E.g. starring a save. 
Because of the layout within which the web app dashboard is presented?
Removed the flex - hasn't changed much.
I don't know if they can be batched in any better way.
## ideas
- [ ] Check out Mastodon, Blue Sky and so on for making accounts
- [ ] reach out to https://skyhook.be / https://west.io
- [ ] When I'm hovering over a section or title, perhaps I can bring all of starred, archived and neutral ones.
	It's because I can see one note and not remember that I may have more from the same website in the archive.
### support
- [ ] support prompt if anything not working???
- [ ] debug turn-on-able?
- [ ] Don't log access token except when debug is on

- [x] Improve dictation for writing my notes.
- [x] Learn to break up tasks better.


## special cases
- [ ] YouTube comments should save URL of the comment.
- [ ] Quora should save the shareable link in the bottom right corner.
- [ ] Reddit probably also just the comment url

### extras
- [ ] TF-IDF for keywords
	- which can then be used for autocomplete when searching
	- I can use sources other than just quotes, get like general frequencies of certain words in the language and then filter out the frequent ones from the keyword list