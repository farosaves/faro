- [x] identify which columns I want to have encrypted: tags, highlights, user_note, snippet_uuid, serialised_highlight, prioritised, url, source_id
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
## enc1
- [x] Make a table where I will store the keys.
- [x] generate some random encryption key with the proper format
- [x] insert that key into the table for my account
- [x] write a function that retrieves the key for the currently logged in user

## login page
- [x] Create two routes.
- [x] For now duplicate the code into both.
- [x] Remove the magic link option.
- [ ] Look at the set password page

## debug
Performance in the built-in dashboard to win the extension is much better.An example of that is starring a save. 
One possible cause for that could be the layout within which the web app dashboard is presented.
### support
- [ ] support prompt if anything not working???
- [ ] debug turn-on-able?

- [x] Improve dictation for writing my notes.
- [x] Learn to break up tasks better.


