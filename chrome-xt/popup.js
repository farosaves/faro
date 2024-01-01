document.addEventListener("DOMContentLoaded", async () => {
  const loginStatusEl = document.getElementById("loginStatus");
  const loginStatusLabel = document.getElementById("loginStatusLabel");
  const flashcardContentEl = document.getElementById("flashcardContent");
  const loginButtonContainerEl = document.getElementById(
    "loginButtonContainer"
  );
  const DOMAIN = "http://localhost:5173"; // Replace with your domain

  // Event listener for the login button
  document.getElementById("loginButton").addEventListener("click", () => {
    chrome.tabs.create({ url: DOMAIN }); // Open the login page in a new tab
  });

  try {
    const response = await fetch(`${DOMAIN}/api/check-login`, {
      method: "GET",
      credentials: "include", // Important for cookies
    });

    if (response.ok) {
      const data = await response.json();
      if (data.isLoggedIn) {
        // User is logged in
        loginStatusEl.classList.add("alert-success", "hidden"); // Hide login status alert when logged in
        loginStatusLabel.textContent = "Logged in successfully.";
        flashcardContentEl.classList.remove("hidden"); // Show flashcard content
        loginButtonContainerEl.classList.add("hidden"); // Hide login button
      } else {
        // User is not logged in
        loginStatusEl.classList.remove("hidden");
        loginStatusEl.classList.remove("alert-success");
        loginStatusEl.classList.add("alert-warning");
        loginStatusLabel.textContent = "Please click login below to continue.";
        flashcardContentEl.classList.add("hidden"); // Hide flashcard content
        loginButtonContainerEl.classList.remove("hidden"); // Show login button
      }
    } else {
      // Error occurred while checking login status
      loginStatusEl.classList.remove("hidden");
      loginStatusEl.classList.remove("alert-success", "alert-warning");
      loginStatusEl.classList.add("alert-error");
      loginStatusLabel.textContent = "Error checking login status.";
      flashcardContentEl.classList.add("hidden"); // Hide flashcard content
      loginButtonContainerEl.classList.add("hidden"); // Hide login button
    }
  } catch (error) {
    // Exception occurred while checking login status
    console.error("Error:", error);
    loginStatusEl.classList.remove("hidden");
    loginStatusEl.classList.remove("alert-success", "alert-warning");
    loginStatusEl.classList.add("alert-error");
    loginStatusLabel.textContent = "Failed to check login status.";
    flashcardContentEl.classList.add("hidden"); // Hide flashcard content
    loginButtonContainerEl.classList.add("hidden"); // Hide login button
  }
});
