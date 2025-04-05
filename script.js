// Get elements from the HTML
const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const moodDisplay = document.getElementById('mood');
const playlistDisplay = document.getElementById('playlist');

// Playlist suggestions with Spotify links
const playlists = {
    happy: {
        name: "Happy Vibes",
        song: "Bollywood Happy Vibes",
        url: "https://open.spotify.com/playlist/37i9dQZF1DWTwbZHrJRIgD"
    },
    sad: {
        name: "Chill Acoustic Vibes",
        song: "Bollywood Sad Songs Playlist",
        url: "https://open.spotify.com/playlist/2sOMIgioNPngXojcOuR4tn"
    },
    angry: {
        name: "Angry? Why let's get motivated together",
        song: "Bollywood Motivation Songs",
        url: "https://open.spotify.com/playlist/7zNvXEjgmE1110slXAuZied"
    },
    neutral: {
        name: "Lofi Music Suits your mood now",
        song: "Bollywood Lofi Sukoon Songs",
        url: "https://open.spotify.com/playlist/5jYQ4O9Ii3tQcSbJMtVrk8"
    },
    surprised: {
        name: "Ready to dance let's have fun now",
        song: "Indian Dance Songs",
        url: "https://open.spotify.com/playlist/1rYXA7h01znrrO0Sa0cCui"
    }
};

// Track the last detected mood
let lastMood = "neutral"; // Default fallback

// Load face-api models and start webcam when button is clicked
startBtn.addEventListener('click', async () => {
    // Load the models (ssdMobilenetv1 for better accuracy and expression recognition)
    await faceapi.nets.ssdMobilenetv1.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
    await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');

    // Start the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            startBtn.style.display = 'none'; // Hide button after starting
            detectMood(); // Start detecting
        })
        .catch(err => {
            console.error("Error accessing webcam:", err);
            moodDisplay.textContent = "Webcam error!";
            playlistDisplay.textContent = "Please try again.";
        });
});

// Function to detect mood and suggest playlist
async function detectMood() {
    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceExpressions();

        if (detections && detections.expressions) {
            const expressions = detections.expressions;
            const dominantMood = Object.keys(expressions).reduce((a, b) => 
                expressions[a] > expressions[b] ? a : b
            );
            moodDisplay.textContent = dominantMood;
            const playlist = playlists[dominantMood];
            if (playlist) {
                playlistDisplay.innerHTML = `${playlist.name}<br><a href="${playlist.url}" target="_blank" class="spotify-link">${playlist.song}</a>`;
            } else {
                playlistDisplay.textContent = "No playlist match";
            }
            lastMood = dominantMood;
        } else {
            moodDisplay.textContent = `No face detected (using last mood: ${lastMood})`;
            const playlist = playlists[lastMood];
            if (playlist) {
                playlistDisplay.innerHTML = `${playlist.name}<br><a href="${playlist.url}" target="_blank" class="spotify-link">${playlist.song}</a>`;
            } else {
                playlistDisplay.textContent = "No playlist match";
            }
        }
    }, 500); // Check every 0.5 seconds
}