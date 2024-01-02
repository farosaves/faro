<script>
  import { onMount } from 'svelte';

  let isLoggedIn = false;
  let loginStatusMessage = 'Please click login below to continue.';
  const DOMAIN = "http://localhost:5174";

  onMount(async () => {
    if (typeof window === 'undefined') return;

    try {
      const response = await fetch(`${DOMAIN}/api/check-login`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        isLoggedIn = data.isLoggedIn;
        loginStatusMessage = isLoggedIn ? "Logged in successfully." : loginStatusMessage;
      } else {
        loginStatusMessage = "Error checking login status.";
      }
    } catch (error) {
      console.error("Error:", error);
      loginStatusMessage = "Failed to check login status.";
    }

    // Handle other logic like chrome.storage.local.get
  });

  async function handleLogin() {
    // Logic for login
  }

  async function createFlashcard() {
    // Logic for creating a flashcard
  }
</script>

<style>
  :global(body) {
    min-width: 480px;
  }
</style>


{#if !isLoggedIn}
<div
      id="loginStatus"
      class="hidden mx-4 my-4 shadow-lg alert alert-warning"
    >
      <div>
        <span id="loginStatusLabel">Please click login below to continue.</span>
      </div>
    </div>

    <!-- Login Button -->
    <div id="loginButtonContainer" class="hidden max-w-sm p-4 mx-auto">
      <button id="loginButton" class="w-full btn btn-primary">Log in</button>
    </div>
{/if}
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

          <div class="justify-end card-actions">
            <button class="btn btn-primary">Create</button>
            <button class="btn btn-ghost">Cancel</button>
            <button class="btn btn-error">Delete</button>
          </div>
          <!-- Error message container -->
        </div>
      </div>
    </div>
