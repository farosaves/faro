## I didn't have a complete refresh.
So when I had locally a source not in the db - it failed
	All I need for full refresh is delete all local data 
- [ ] Do a button for a complete refresh.
- [ ] investigate why on a failed push it still appeared locally
	Well, it should. The question is why was it removed from the queue?

- [ ] virtual list
	- [x] first test
	- [ ] check if performance is due to this - i.e on a loaded vs emptyish account
	- [ ] if yes - consider going month by month 
	- [ ] if not - still, just not that urgent
	- [ ] 
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
## enc1
- [x] Make a table where I will store the keys.
- [x] generate some random encryption key with the proper format
- [x] insert that key into the table for my account
- [x] write a function that retrieves the key for the currently logged in user
- [x] add a flag in keys I guess, to mark if user agreed to password recovery
- [x] add a flag to mark that the key is derived from the password
- [ ] modify the sync go online function to require this flag
- [ ] Modify sync go online to accept the password derived key

## interlude
- [x] Add a field for the referer.
- [x] Add to enc
- [x] see if hash links work on PubMed.
- [ ] If bookmarks are synced, then replace the previous button with latest new bookmarks.
	a [push](https://dev.farosapp.com/notes/6b92d44f-cfa6-4257-a97a-34b58c2d65b6) notification when someone made new bookmarks elsewhere?

## bookmark sync
- [ ] Change the current URL query param with the "**fragment identifier** or **anchor link**."

## enc2
- [ ] Decide what to do with the IV.
- [ ] write an encrypting function that takes a key and converts a note row to a save row.
- [ ] Write an inverse function that also takes a key.
- [ ] Remember the next deployment should be like 0.2 and wait for approval so I deploy simultaneously.

## login page
- [x] Create two routes.
- [x] For now duplicate the code into both.
- [x] Remove the magic link option.
- [ ] Look at the set password page

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

- [x] Improve dictation for writing my notes.
- [x] Learn to break up tasks better.


## special cases
- [ ] YouTube comments should save URL of the comment.
- [ ] Quora should save the shareable link in the bottom right corner.
- [ ] Reddit probably also just the comment url