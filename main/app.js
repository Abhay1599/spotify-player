// app.js
document.addEventListener("DOMContentLoaded", function () {
  const clientId = "f0998fe1471147f6ae0db6efadbaa1c3"; // Replace with your Spotify client ID
  const redirectUri = "http://127.0.0.1:5500/main/callback.html"; // Replace with your redirect URI
  const scopes = ["user-library-read", "user-read-playback-state", "user-modify-playback-state", "streaming",];


  const loginButton = document.getElementById("loginButton");

  // Log in button click event
  loginButton.addEventListener("click", () => {
    // Redirect user to Spotify authorization page
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join('%20')}&response_type=token`;
  });
});
