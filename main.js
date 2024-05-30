var currentPlaybackSpeed = 1;
var activeVideo = null;
var isRecording = false;

function record() {
    var recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';

    var videoPlayer = document.getElementById('videoPlayer');
    var logoAvatarImage = document.getElementById('logoAvatarImage');

    if (!isRecording) {
        // Start recording
        isRecording = true;

        // Change the left panel image to hear.jpeg
        logoAvatarImage.setAttribute('src', 'Asset/hear.jpeg');
    } else {
        // End recording
        isRecording = false;
    }

    recognition.onresult = function (event) {
        console.log(event);
        var recognizedText = event.results[0][0].transcript;
        // Pass recognized text directly to playVideos function
        playVideos(recognizedText);
    };

    recognition.onend = function () {
        // If recording ended, show still image
        displayPicture();
    };

    recognition.start();
}


function displayPicture() {
    var logoAvatarImage = document.getElementById('logoAvatarImage');
    var picturePath = 'Asset/still.jpeg';

    var img = document.createElement('img');
    img.setAttribute('src', picturePath);
    img.setAttribute('width', '640');
    img.setAttribute('height', '360');


    // Change the left panel image back to still.jpeg
    logoAvatarImage.setAttribute('src', picturePath);
}

function playVideos(recognizedText) {
    // Use recognized text if provided, otherwise get text from the textbox
    var videoNames = recognizedText ? recognizedText.replace(/\s+/g, ' ').trim().split(' ') : document.getElementById('videoNames').value.replace(/\s+/g, ' ').trim().split(' ');
    var videoPlayer = document.getElementById('videoPlayer');
    var videoTitle = document.getElementById('videoTitle');

    // Display the words with symbols in the videoTitle
    videoTitle.innerHTML = videoNames.map(name => `<span>${name}</span>`).join(' ');

    // Display the playback speed buttons
    var playbackButtons = document.getElementById('playbackButtons');
    playbackButtons.style.display = 'block';
    highlightButton('btnNormal');

    // Start playing the videos
    playNextVideo(videoNames, 0, videoPlayer, function () {
        // Once all videos are played, display the still image and clear the videoTitle
        displayPicture();
        videoTitle.textContent = '';
        // Hide the playback speed buttons
        playbackButtons.style.display = 'none';
        // Reset the playback speed to default
        resetPlaybackSpeed();

        // Hide the video player
        videoPlayer.innerHTML = '';
    });
}

function playNextVideo(videoNames, index, videoPlayer, callback) {
    if (index >= videoNames.length) {
        // If all videos are played, execute the callback function
        if (callback && typeof (callback) === "function") {
            callback();
        }
        return;
    }

    var originalVideoName = videoNames[index];
    var hasQuestionMark = originalVideoName.includes('?');
    // Process the video name to remove symbols and convert to lowercase
    var processedVideoName = originalVideoName.replace(/[^\w\s]/g, '').toLowerCase();

    var videoPath = 'SignAsset/' + processedVideoName + '.mp4';

    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', videoPath, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            // If the video exists, play it
            var video = document.createElement('video');
            video.setAttribute('width', '640');
            video.setAttribute('height', '360');
            video.playbackRate = currentPlaybackSpeed;

            var source = document.createElement('source');
            source.setAttribute('src', videoPath);
            source.setAttribute('type', 'video/mp4');

            video.appendChild(source);

            videoPlayer.innerHTML = '';
            videoPlayer.appendChild(video);

            activeVideo = video; // Store the currently playing video

            var videoTitle = document.getElementById('videoTitle');
            var currentWord = videoTitle.children[index];

            // Highlight the entire word in red
            currentWord.style.color = 'red';

            video.onended = function () {
                activeVideo = null; // Reset the active video

                if (hasQuestionMark) {
                    playQuestionMark(videoPlayer, function () {
                        // Change the color of the whole word to white
                        currentWord.style.color = 'white';
                        // Move to the next word
                        playNextVideo(videoNames, index + 1, videoPlayer, callback);
                    });
                } else {
                    // Change the color of the whole word to white
                    currentWord.style.color = 'white';
                    // Move to the next word
                    playNextVideo(videoNames, index + 1, videoPlayer, callback);
                }
            };

            video.play().catch(function (error) {
                console.error('Error playing video:', error);
                playNextVideo(videoNames, index + 1, videoPlayer, callback);
            });
        } else {
            // If the video does not exist, handle the word letter by letter
            var letters = processedVideoName.split('');
            playNextLetter(letters, 0, videoPlayer, videoNames, index, hasQuestionMark, callback);
        }
    };
    xhr.send();
}

function playNextLetter(letters, index, videoPlayer, videoNames, wordIndex, hasQuestionMark, callback) {
    // Get the current word element
    var videoTitle = document.getElementById('videoTitle');
    var currentWord = videoTitle.children[wordIndex];

    // If the word hasn't been highlighted yet, do it now
    if (!currentWord.classList.contains('highlighted')) {
        // Add a class to mark the word as highlighted
        currentWord.classList.add('highlighted');
        // Clear the contents of the word to avoid duplication
        currentWord.innerHTML = '';
        // Create spans for each character of the word
        videoNames[wordIndex].split('').forEach(function (char, i) {
            var span = document.createElement('span');
            span.textContent = char;
            currentWord.appendChild(span);
        });
    }

    if (index >= letters.length) {
        // If all letters in the word have been processed, move to the next word
        // Change the color of the last letter of the word to white
        var lastLetterIndex = letters.length - 1;
        currentWord.children[lastLetterIndex].style.color = 'white';
        if (hasQuestionMark) {
            playQuestionMark(videoPlayer, function () {
                playNextVideo(videoNames, wordIndex + 1, videoPlayer, callback);
            });
        } else {
            playNextVideo(videoNames, wordIndex + 1, videoPlayer, callback);
        }
        return;
    }

    var letter = letters[index].toLowerCase();

    if (isSymbol(letter)) {
        // If the letter is a symbol, add it to the videoTitle and move to the next letter
        var span = document.createElement('span');
        span.textContent = letter;
        currentWord.appendChild(span);
        playNextLetter(letters, index + 1, videoPlayer, videoNames, wordIndex, hasQuestionMark, callback);
    } else {
        var videoPath = 'SignAsset/' + letter + '.mp4';

        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', videoPath, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                // If video exists for the current letter, play it
                var video = document.createElement('video');
                video.setAttribute('width', '640');
                video.setAttribute('height', '360');
                video.playbackRate = currentPlaybackSpeed;

                var source = document.createElement('source');
                source.setAttribute('src', videoPath);
                source.setAttribute('type', 'video/mp4');

                video.appendChild(source);

                videoPlayer.innerHTML = '';
                videoPlayer.appendChild(video);

                activeVideo = video; // Store the currently playing video

                // Reset the color of previous letters to white
                var previousLetters = currentWord.querySelectorAll('span');
                previousLetters.forEach(function (span) {
                    span.style.color = 'white';
                });

                // Highlight the current letter
                var currentLetter = currentWord.children[index];
                currentLetter.style.color = 'red';

                video.onended = function () {
                    activeVideo = null; // Reset the active video

                    // Move to the next letter in the word
                    playNextLetter(letters, index + 1, videoPlayer, videoNames, wordIndex, hasQuestionMark, callback);
                };

                video.play().catch(function (error) {
                    console.error('Error playing video:', error);
                    playNextLetter(letters, index + 1, videoPlayer, videoNames, wordIndex, hasQuestionMark, callback);
                });
            } else {
                // If video doesn't exist, move to the next letter in the word
                playNextLetter(letters, index + 1, videoPlayer, videoNames, wordIndex, hasQuestionMark, callback);
            }
        };
        xhr.send();
    }
}

function isSymbol(char) {
    return /[^\w\s]/.test(char);
}

function playQuestionMark(videoPlayer, callback) {
    var videoPath = 'SignAsset/qmark.mp4';

    var video = document.createElement('video');
    video.setAttribute('width', '640');
    video.setAttribute('height', '360');
    video.playbackRate = currentPlaybackSpeed;

    var source = document.createElement('source');
    source.setAttribute('src', videoPath);
    source.setAttribute('type', 'video/mp4');

    video.appendChild(source);

    videoPlayer.innerHTML = '';
    videoPlayer.appendChild(video);

    activeVideo = video; // Store the currently playing video

    video.onended = function () {
        activeVideo = null; // Reset the active video

        if (callback && typeof (callback) === "function") {
            callback();
        }
    };

    video.play().catch(function (error) {
        console.error('Error playing question mark video:', error);
        if (callback && typeof (callback) === "function") {
            callback();
        }
    });
}

function setPlaybackSpeed(speed) {
    currentPlaybackSpeed = speed;
    if (activeVideo) {
        activeVideo.playbackRate = speed;
    }
    highlightButton(speed === 0.5 ? 'btnSlow' : speed === 1 ? 'btnNormal' : 'btnFast');
}

function highlightButton(buttonId) {
    var buttons = document.querySelectorAll('#playbackButtons button');
    buttons.forEach(button => {
        button.classList.remove('highlighted');
    });

    document.getElementById(buttonId).classList.add('highlighted');
}

function resetPlaybackSpeed() {
    currentPlaybackSpeed = 1;
    if (activeVideo) {
        activeVideo.playbackRate = currentPlaybackSpeed;
    }
}