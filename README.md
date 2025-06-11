This branch is a new extension built with the crxjs vite plugin.

The change in version 2.0 is that the online functionality is going to be discontinued.

Thus, in this branch, I will need to remove all the supabase, etc references.

Remove the structure which is currently the spelt kit web app, the shared folder and the extension folder. Instead it will be only one folder.

Instead of saving to Superbase, I will be saving to normal bookmarks.

### Step 1

Go into the functions that currently syncs notes to bookmarks - edit it so 