firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var storage = firebase.storage();

let tracks = [];
let currentTrackIndex = 0;
let isPlaying = false;

const trackImg = document.getElementById('track-img');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentTimeElem = document.getElementById('current-time');
const durationElem = document.getElementById('duration');
const progressBar = document.getElementById('progress-bar');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const like = document.getElementById('like');

const audio = new Audio();

function loadTrack(index) {
  audio.src = tracks[index].src;
  trackImg.src = tracks[index].img;
  trackTitle.textContent = tracks[index].title;
  trackArtist.textContent = 'by ' + tracks[index].artist;
  progressBar.value = 0;
  currentTimeElem.textContent = '0:00'
  durationElem.textContent = formatTime(tracks[index].duration);
  muteBtn.innerHTML = `<i class="bi bi-volume-up-fill"></i>`;
}

function playPauseTrack() {
  if (isPlaying) {
    audio.pause();
    playPauseBtn.innerHTML = `<i class="bi bi-play-circle-fill"></i>`;
  } else {
    audio.play();
    playPauseBtn.innerHTML = `<i class="bi bi-pause-circle-fill"></i>`;
  }
  isPlaying = !isPlaying;
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrackIndex);
  audio.play();
}

function nextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  loadTrack(currentTrackIndex);
  audio.play();
}

function updateProgress() {
  const { duration, currentTime } = audio;
  const progressPercent = (currentTime / duration) * 100;
  progressBar.value = progressPercent;
  currentTimeElem.textContent = formatTime(currentTime);
}

function setProgress() {
  const width = this.max;
  const clickX = this.value;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function setVolume() {
  audio.volume = volumeSlider.value;
}

function muteUnmute() {
  audio.muted = !audio.muted;
  muteBtn.innerHTML = audio.muted ? `<i class="bi bi-volume-mute-fill"></i>` : `<i class="bi bi-volume-up-fill"></i>`;
}

function handleTrackEnd() {
  nextTrack();
}

// Função para dar ou remover like em um beat
function likeBeat(beatId) {
  var user = firebase.auth().currentUser;
  if (!user) {
    showNotification('error', 'Você precisa estar logado para dar like');
    return;
  }

  var beatRef = db.collection('beats').doc(beatId);

  // Verifica se o usuário já deu like no beat
  var userLikesRef = db.collection('userLikes').doc(user.uid).collection('likes').doc(beatId);
  userLikesRef.get().then((doc) => {
    const likeIcon = document.querySelector(`.beat-card[data-id="${beatId}"] .bi-heart`);

    if (doc.exists) {
      // Se o like já existe, remove o like
      beatRef.update({
        likes: firebase.firestore.FieldValue.increment(-1)
      }).then(() => {
        userLikesRef.delete();
        likeIcon.classList.remove('text-danger');
        showNotification('warning', 'Você removeu o like do beat.');
      }).catch((error) => {
        console.error("Erro ao remover like: ", error);
      });
    } else {
      // Se o like não existe, adiciona o like
      beatRef.update({
        likes: firebase.firestore.FieldValue.increment(1)
      }).then(() => {
        userLikesRef.set({
          likedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        likeIcon.classList.add('text-danger');
        showNotification('success', 'Você deu like no beat.');
      }).catch((error) => {
        console.error("Erro ao dar like: ", error);
      });
    }
  }).catch((error) => {
    console.error("Erro ao verificar like: ", error);
  });
}

function createBeatCards() {
  const container = document.getElementById('containerCard');
  container.innerHTML = '';

  tracks.forEach((track, index) => {
    const card = document.createElement('div');
    card.classList.add('beat-card');
    card.dataset.id = track.id; // Adiciona um atributo data-id para identificar o beat

    card.innerHTML = `        
        <div class="cardHeader">
        <img src="https://github.com/raeldosbeats.png" alt="">
        by <small><strong>${track.artist}</strong></small>
        </div>
        <div class="cardImg">
          <img id="imgBeatCurrent" src="${track.img}" alt="">
        </div>
        <div class="cardInfoBeatBpmKey">
          <ul>
            <li>Trending</li>
            <li>140bpm</li>
            <li>Fm</li>
          </ul>
        </div>
        <div class="infoBeatTitleGenrePrice">
          <div class="cardTitleBeat">
            <strong><a href="">${track.title}</a></strong>
            <i id="buy" class="bi bi-bag-plus"></i>
          </div>
          <div class="cardGenreBeat">
            <small>${track.genre}</small>
          </div>
          <div class="footerPriceAndLike">
            <div class="prices">
              <strong>R$ ${track.price}</strong>
              <small class="priceRiscado">R$ ${track.priceNoPromo}</small>
            </div>
            <div id="favorite" class="favorite">
              <small class="likes-count">${track.likes}</small>
              <i id="like" class="bi bi-heart" onclick="likeBeat('${track.id}')"></i>
            </div>
          </div>
        </div>
      `;

    const cardImage = card.querySelector('#imgBeatCurrent');
    cardImage.addEventListener('click', () => {
      currentTrackIndex = index;
      loadTrack(currentTrackIndex);
      if (!isPlaying) {
        playPauseTrack();
      } else {
        audio.play();
      }
    });

    container.appendChild(card);
  });

  // Verifica o estado do like de cada beat para o usuário atual
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      tracks.forEach(track => {
        const userLikesRef = db.collection('userLikes').doc(user.uid).collection('likes').doc(track.id);
        userLikesRef.get().then(doc => {
          if (doc.exists) {
            const likeIcon = document.querySelector(`.beat-card[data-id="${track.id}"] .bi-heart`);
            likeIcon.classList.add('text-danger');
          }
        }).catch(error => {
          console.error("Erro ao verificar like: ", error);
        });
      });
    } else {
      // Remove a classe text-danger de todos os ícones de like
      const likeIcons = document.querySelectorAll('.bi-heart');
      likeIcons.forEach(icon => {
        icon.classList.remove('text-danger');
      });
    }
  });
}

function updateBeatCardLikes(beatId, likes) {
  const likeElement = document.querySelector(`.beat-card[data-id="${beatId}"] .likes-count`);
  if (likeElement) {
    likeElement.textContent = likes;
  }
}

// Função para carregar os beats do Firestore
function loadBeatsFromFirestore() {
  db.collection('beats').orderBy('createdAt', 'desc').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const beat = doc.data();
      tracks.push({
        id: doc.id,
        title: beat.title,
        artist: beat.beatmaker,
        src: beat.fileUrl,
        img: beat.imageUrl,
        genre: beat.genre,
        price: beat.price,
        priceNoPromo: beat.priceNoProme,
        duration: 0, // Placeholder para a duração
        likes: beat.likes
      });

      // Adiciona um ouvinte de tempo real para cada beat
      db.collection('beats').doc(doc.id).onSnapshot((docSnapshot) => {
        if (docSnapshot.exists) {
          const updatedBeat = docSnapshot.data();
          const beatIndex = tracks.findIndex(track => track.id === doc.id);
          if (beatIndex !== -1) {
            tracks[beatIndex].likes = updatedBeat.likes;
            // Atualiza a UI com o novo número de likes
            updateBeatCardLikes(doc.id, updatedBeat.likes);
          }
        }
      });
    });

    // Após carregar os beats, criar os cartões e carregar a primeira faixa
    createBeatCards();
    loadTrack(currentTrackIndex);

    audio.addEventListener('loadedmetadata', () => {
      progressBar.value = 0;
      durationElem.textContent = formatTime(audio.duration);
    });

    playPauseBtn.addEventListener('click', playPauseTrack);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnd);
    progressBar.addEventListener('input', setProgress);
    volumeSlider.addEventListener('input', setVolume);
    muteBtn.addEventListener('click', muteUnmute);
  }).catch((error) => {
    console.log("Erro ao carregar beats: ", error);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadBeatsFromFirestore();
});
