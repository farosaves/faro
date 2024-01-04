* The replicate call / flashcard creation could be done on the frontend 
  * in which case could replicate.stream and create flashcards as its writing
  * would effectively decrease latency 2-3x - because the user will read the first asap

* Make svelte chrome extension
  * Has to be separate repo I assume?
  * When Mehul does supabase/ssr I can look / ask how to add it to extensiuon
  * Follow the bookmarked guide
  * Make that extension implement the same functionality that the fcextension does:
  ```  
  "background": {
    "service_worker": "background.js"
  }
  ```
  * If that works, see how the service worker could pass to svelte...
  * Or see how to use supabase in chrome extension