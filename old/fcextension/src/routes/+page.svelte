<script>
  import { onMount } from "svelte";

  let isLoggedIn = false;
  let loginStatusMessage = "Please click login below to continue.";
  let highlightedText = "";
  const DOMAIN = "http://localhost:5173";

  onMount(async () => {
    if (typeof window === "undefined") return;

    try {
      const response = await fetch(`${DOMAIN}/api/check-login`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        isLoggedIn = data.isLoggedIn;
        // If logged in, send highlighted text to backend
      }
    } catch (error) {
      console.error("Error:", error);
      loginStatusMessage = "Failed to check login status.";
    }

    try {
      const response = await fetch(`${DOMAIN}/api/check-login`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        isLoggedIn = data.isLoggedIn;
        loginStatusMessage = isLoggedIn
          ? "Logged in successfully."
          : loginStatusMessage;
      } else {
        loginStatusMessage = "Error checking login status.";
      }
    } catch (error) {
      console.error("Error:", error);
      loginStatusMessage = "Failed to check login status.";
    }

    // Add logic to listen for messages from the content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "highlightedText") {
        console.log(request.text);
        highlightedText = request.text;
      }
    });
  });

  async function handleLogin() {
    // Logic for login
  }

  async function createFlashcard() {
    // Logic for creating a flashcard
  }
</script>

{#if !isLoggedIn}
  <div id="loginStatus" class="mx-4 my-4">
    <div class="shadow-xl card bg-base-100">
      <div class="card-body">
        <p id="loginStatusLabel" class="mx-auto text-base">
          {loginStatusMessage}
        </p>
      </div>
    </div>
  </div>

  <div id="loginButtonContainer" class="max-w-sm p-4 mx-auto">
    <a href={`${DOMAIN}`} target="_blank" class="w-full btn btn-primary"
      >Log in</a
    >
  </div>
{:else}
  <div id="flashcardContent" class="max-w-sm p-4 mx-auto">
    <div class="card bordered">
      <div class="card-body">
        <h2 class="card-title">Create Flashcard</h2>
        <div class="progress progress-primary" value="70"></div>
        <div class="mt-2 progress progress-secondary" value="100"></div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Add tags</span>
          </label>
          <input
            type="text"
            placeholder="Add tags"
            class="input input-bordered"
          />
        </div>

        <div class="mt-2 form-control">
          <label class="label">
            <span class="label-text">Input</span>
          </label>
          <input
            type="text"
            placeholder="Highlighted text will appear here"
            class="input input-bordered"
            bind:value={highlightedText}
          />
        </div>

        <div class="mt-2 form-control">
          <label class="label">
            <span class="label-text">Flashcard preview...</span>
          </label>
          <textarea
            class="textarea textarea-bordered"
            placeholder="Flashcard preview..."
          ></textarea>
        </div>

        <div class="mt-2 form-control">
          <label class="label">
            <span class="label-text">Select deck...</span>
          </label>
          <select class="select select-bordered">
            <option disabled selected>Select deck...</option>
            <!-- Options would be dynamically inserted here -->
          </select>
        </div>

        <div class="justify-between mt-5 card-actions">
          <button class="btn btn-primary">Create</button>
          <button class="btn btn-neutral">Cancel</button>
          <button class="btn btn-error">Delete</button>
        </div>
        <!-- Error message container -->
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    min-width: 480px;
  }
</style>
