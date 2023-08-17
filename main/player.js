
// Define the onSpotifyWebPlaybackSDKReady callback
window.onSpotifyWebPlaybackSDKReady = () => {
  // Retrieve access token from localStorage
  const accessToken = localStorage.getItem("accessToken");

  // Initialize Spotify Player if access token is present
  if (accessToken) {
    initializeSpotifyPlayer(accessToken);
  }
  function initializeSpotifyPlayer(accessToken) {
    const player = new Spotify.Player({
      name: 'test101',
      getOAuthToken: cb => { cb(accessToken); },
      volume: 0.5
    });

    player.addListener('ready', ({ device_id }) => {
      console.log('Connected to Spotify player');
      console.log('Device ID:', device_id);
      // Connect to the player
      player.connect().then(success => {
        if (success) {
          console.log('Connected to Spotify player');
        }
      }).catch(error => {
        console.error('Error connecting to Spotify player:', error);
      });
    });

    player.connect();
  }

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const resultsDiv = document.getElementById("results");

  searchButton.addEventListener("click", () => {
    const keyword = searchInput.value;
    searchSpotify(keyword);
  });

  async function searchSpotify(keyword) {
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${keyword}&type=track`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      displayResults(data.tracks.items);
    } catch (error) {
      console.error("Error searching Spotify:", error);
    }
  }

  function displayResults(tracks) {
    resultsDiv.innerHTML = "";

    tracks.forEach(track => {
      const trackName = track.name;
      const artistName = track.artists[0].name;
      const albumName = track.album.name;
      const imageUrl = track.album.images[0].url;

      const trackCard = document.createElement("div");
      trackCard.classList.add("col-md-4", "mb-4");

      // Inside the displayResults function
      const cardContent = `
              <div class="card">
                <img src="${imageUrl}" class="card-img-top" alt="${trackName} Cover">
                <div class="card-body">
                  <h5 class="card-title">${trackName}</h5>
                  <p class="card-text">Artist: ${artistName}</p>
                  <p class="card-text">Track: ${albumName}</p>
                  <div>
                    <button class="btn btn-primary play-button" data-uri="${track.uri}"><i class="fas fa-play"></i></button>
                    <button class="btn btn-primary pause-button" data-uri="${track.uri}"><i class="fas fa-pause"></i></button>
                    <button class="btn btn-primary seek-button" data-uri="${track.uri}" data-position="30000"><i class="fas fa-forward"></i></button>
                    <button class="btn btn-primary queue-button" data-uri="${track.uri}"><i class="fas fa-list-ul"></i></button>
                  </div>
                  <div class="queue-results" data-uri="${track.uri}"></div>
                </div>
              </div>
            `;

      //   const cardContent = `
      // <div class="card">
      //   <img src="${imageUrl}" class="card-img-top" alt="${trackName} Cover">
      //   <div class="card-body">
      //     <h5 class="card-title">${trackName}</h5>
      //     <p class="card-text">Artist: ${artistName}</p>
      //     <p class="card-text">Track: ${albumName}</p>
      //     <button class="btn btn-primary play-button" data-uri="${track.uri}">Play</button>
      //     <button class="btn btn-primary pause-button" data-uri="${track.uri}">Pause</button>
      //     <button class="btn btn-primary seek-button" data-uri="${track.uri}" data-position="30000">Seek to 30s</button>
      //     <button class="btn btn-primary queue-button" data-uri="${track.uri}">Retrieve Queue</button>
      //     <div class="queue-results" data-uri="${track.uri}"></div>
      //   </div>
      // </div>`;
      // new
      trackCard.innerHTML = cardContent;
      resultsDiv.appendChild(trackCard);
      trackCard.querySelector(".play-button").addEventListener("click", () => {
        playTrack(track.uri);
      });

      trackCard.querySelector(".pause-button").addEventListener("click", () => {
        pauseTrack(track.uri);
      });

      trackCard.querySelector(".seek-button").addEventListener("click", () => {
        const seekPosition = 30000; // 30 seconds
        seekToPosition(track.uri, seekPosition);
      });

      trackCard.querySelector(".queue-button").addEventListener("click", () => {
        const queueResultsDiv = trackCard.querySelector(".queue-results");

        retrieveQueue(track.uri)
          .then(queueData => {
            if (queueData.queue.length > 0) {
              const queueList = document.createElement("ul");
              queueList.classList.add("queue-list");

              queueData.queue.forEach((queueItem, index) => {
                const listItem = document.createElement("li");
                listItem.textContent = `Track ${index + 1}: ${queueItem.name} by ${queueItem.artists[0].name}`;
                queueList.appendChild(listItem);
              });

              queueResultsDiv.innerHTML = "";
              queueResultsDiv.appendChild(queueList);
            } else {
              queueResultsDiv.innerHTML = "No queue data available.";
            }
          })
          .catch(error => {
            console.error("Error retrieving queue:", error);
          });
      });

    });
  }

  async function playTrack(trackUri) {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri], // Use 'uris' instead of 'context_uri'
        }),
      });
    } catch (error) {
      console.error("Error playing track:", error);
    }
  }

  async function pauseTrack(trackUri) {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`https://api.spotify.com/v1/me/player/pause`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error pausing track:", error);
    }
  }

  async function seekToPosition(trackUri, position) {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${position}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error seeking to position:", error);
    }
  }

  async function retrieveQueue(trackUri) {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const queueData = await response.json();
      console.log('Queue Data:', queueData);
      return queueData;
    } catch (error) {
      console.error("Error retrieving queue:", error);
    }
  }
}