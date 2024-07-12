document.addEventListener("DOMContentLoaded", function () {
  const movieId = new URLSearchParams(window.location.search).get('id');
  fetchMovieDetails(movieId);
  insertKinoboxPlayer(movieId);
  fetchMovieStaff(movieId);

  checkAndDisplayRating();

  const crewList = document.getElementById('movieCrew');
  const leftScrollButton = document.querySelector('.left-scroll');
  const rightScrollButton = document.querySelector('.right-scroll');

  leftScrollButton.addEventListener('click', () => {
    crewList.scrollLeft -= 100;
  });

  rightScrollButton.addEventListener('click', () => {
    crewList.scrollLeft += 100;
  });
});

function fetchMovieDetails(movieId) {
  fetch(`http://localhost:8080/api/v1/movies/${movieId}`)
    .then(response => response.json())
    .then(movie => {
      displayMovieDetails(movie);
      document.title = movie.title;
      document.getElementById('ratingValue').textContent = movie.userRating.toFixed(1);
    })
    .catch(error => console.error('Ошибка:', error));
}

function displayMovieDetails(movie) {
  document.getElementById('posterImage').src = movie.posterUrl;
  document.getElementById('movieTitle').textContent = movie.title;


  const detailsList = document.getElementById('movieDetails');
  detailsList.innerHTML = '';

  const outlineItem = document.createElement('li');
  outlineItem.textContent = `Описание: ${movie.outline}`;
  detailsList.appendChild(outlineItem);

  const yearItem = document.createElement('li');
  yearItem.textContent = `Год: ${movie.yearOfRelease}`;
  detailsList.appendChild(yearItem);

  const countriesItem = document.createElement('li');
  countriesItem.textContent = `Страны: ${movie.countries.map(country => country.name).join(', ')}`;
  detailsList.appendChild(countriesItem);

  const genresItem = document.createElement('li');
  genresItem.textContent = `Жанры: ${movie.genres.map(genre => genre.name).join(', ')}`;
  detailsList.appendChild(genresItem);
}

function insertKinoboxPlayer(movieId) {
  const kinoboxContainer = document.getElementById('kinobox-container');

  const kinoboxPlayer = document.createElement('div');
  kinoboxPlayer.className = 'kinobox_player';
  kinoboxPlayer.style.width = '1000px';
  kinoboxPlayer.style.zIndex = '0'
  kinoboxContainer.appendChild(kinoboxPlayer);

  const kinoboxScript = document.createElement('script');
  kinoboxScript.src = 'https://kinobox.tv/kinobox.min.js';
  document.body.appendChild(kinoboxScript);

  kinoboxScript.onload = () => {
    new Kinobox('.kinobox_player', {
      search: {
        kinopoisk: movieId
      },
      hide: ['alloha', 'cdnmovies'],
    }).init();
  };
}

document.getElementById('submitComment').addEventListener('click', () => {
  const token = getCookie('token');
  if (!token) {

    authModal.style.display = 'block';
    modalBackground.style.display = 'block';
    document.body.classList.add('modal-open');
    return;
  }

  const commentText = document.getElementById('commentText').value;
  const movieId = new URLSearchParams(window.location.search).get('id');


  const requestBody = {
    text: commentText,
    movieId: movieId
  };

  fetch('http://localhost:8080/api/v2/reviews/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка при отправке отзыва');
      }
      return response.json();
    })
    .then(() => {

      currentPage = 0;
      isLastPage = false;
      fetchReviews(movieId, currentPage);
      document.getElementById('commentText').value = '';
    })
    .catch(error => console.error('Ошибка:', error));
});

function fetchMovieStaff(movieId) {
  fetch(`http://localhost:8080/api/v1/movies/${movieId}/staff`)
    .then(response => response.json())
    .then(staff => {
      displayMovieStaff(staff);
    })
    .catch(error => console.error('Ошибка при получении данных о съемочной группе:', error));
}

function displayMovieStaff(staff) {
  const crewContainer = document.getElementById('movieCrew');
  crewContainer.innerHTML = '';

  staff.directors.forEach(director => {
    const directorItem = createCrewMemberListItem(director.id, director.fullName, director.photoUrl, "Режиссёр");
    crewContainer.appendChild(directorItem);
  });

  staff.actors.forEach(actor => {
    const actorItem = createCrewMemberListItem(actor.id, actor.fullName, actor.photoUrl, "Актёр");
    crewContainer.appendChild(actorItem);

  });
}

function createCrewMemberListItem(id, name, photoUrl, role) {
  const listItem = document.createElement('li');
  listItem.classList.add('crew-member');

  const img = document.createElement('img');
  img.src = photoUrl ? photoUrl : '../images/no-poster.gif';
  img.alt = name;
  img.classList.add('crew-photo');
  listItem.appendChild(img);

  const nameElement = document.createElement('div');
  nameElement.textContent = name;
  nameElement.classList.add('crew-name');
  listItem.appendChild(nameElement);

  const roleElement = document.createElement('div');
  roleElement.textContent = role;
  roleElement.classList.add('crew-role');
  listItem.appendChild(roleElement);

  listItem.addEventListener('click', function () {
    window.location.href = `staff.html?id=${id}&role=${role}`;
  })
  return listItem;
}



let currentPage = 0;
let isLastPage = false;

function fetchReviews(movieId, page) {
  if (isLastPage) return;

  fetch(`http://localhost:8080/api/v2/reviews?movieId=${movieId}&page=${page}`)
    .then(response => response.json())
    .then(reviews => {
      if (reviews.length === 0) {
        isLastPage = true;
        return;
      }
      displayReviews(reviews);
      currentPage++;
    })
    .catch(error => console.error('Ошибка при загрузке отзывов:', error));
}

function displayReviews(reviews) {
  const reviewsContainer = document.querySelector('.comments-list');
  const currentUserId = getCookie('userId');

  reviewsContainer.innerHTML = '';

  reviews.forEach(review => {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review';

    const reviewAuthor = document.createElement('div');
    reviewAuthor.className = 'review-author';
    reviewAuthor.textContent = `${review.user.login}`;

    const reviewText = document.createElement('div');
    reviewText.className = 'review-text';
    reviewText.textContent = review.text;

    reviewElement.appendChild(reviewAuthor);
    reviewElement.appendChild(reviewText);

    if (review.user.id.toString() === currentUserId) {
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Удалить';
      deleteButton.onclick = () => deleteReview(review.id, reviewElement);
      reviewElement.appendChild(deleteButton);
    }

    reviewsContainer.appendChild(reviewElement);
  });
}


function deleteReview(reviewId, reviewElement) {
  const token = getCookie('token');

  if (!token) {
    console.error('Токен не найден');
    return;
  }

  reviewElement.style.display = 'none';

  fetch(`http://localhost:8080/api/v2/reviews/${reviewId}/delete`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => {
      if (response.ok) {
        currentPage = 0;
        isLastPage = false;
        const movieId = new URLSearchParams(window.location.search).get('id');
        fetchReviews(movieId, currentPage);


      } else {
        console.error('Ошибка при удалении отзыва');
        reviewElement.style.display = ' ';
      }
    })
    .catch(error => console.error('Ошибка:', error));
  reviewElement.style.display = ' ';
}


function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

let reviewsLoaded = false;

window.addEventListener('scroll', () => {
  const commentsList = document.querySelector('.comments-list');
  if (isInViewport(commentsList) && !isLastPage) {
    const movieId = new URLSearchParams(window.location.search).get('id');
    fetchReviews(movieId, currentPage);
  }
});

const openModalButton = document.getElementById('openModalButton');
const authModal = document.getElementById('authModal');
const modalBackground = document.getElementById('modalBackground');

openModalButton.addEventListener('click', () => {
  if (getCookie('token')) {
    showUserModal();
  }
  else {
    authModal.style.display = 'block';
    modalBackground.style.display = 'block';
    document.body.classList.add('modal-open');
  }
});


const closeModalButton = document.getElementById('closeModalButton');

closeModalButton.addEventListener('click', () => {
  authModal.style.display = 'none';
  modalBackground.style.display = 'none';
  document.body.classList.remove('modal-open');
});


const showRegistrationLink = document.getElementById('showRegistration');
const registrationModal = document.getElementById('registrationModal');

showRegistrationLink.addEventListener('click', () => {
  authModal.style.display = 'none';
  registrationModal.style.display = 'block';
  modalBackground.style.display = 'block';
  document.body.classList.add('modal-open');

});


const closeRegistrationModalButton = document.getElementById('closeRegistrationModal');

closeRegistrationModalButton.addEventListener('click', () => {
  registrationModal.style.display = 'none';
  modalBackground.style.display = 'none';
  document.body.classList.remove('modal-open');
});

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  var login = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  var data = {
    login: login,
    password: password
  };

  fetch("http://localhost:8080/api/v2/auth/signIn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();

      } else {
        alert("Неправильный логин или пароль");
      }
    })
    .then(dataResponse => {
      setCookie('userId', dataResponse.id);
      setCookie('username', dataResponse.username);
      setCookie('token', dataResponse.token);
      authModal.style.display = 'none';
      modalBackground.style.display = 'none';
      document.body.classList.remove('modal-open');
      window.location.reload();
    })
    .catch(function (error) {
      console.error("Ошибка:", error);
    });
});


const registrationForm = document.getElementById('registrationForm');

registrationForm.addEventListener('submit', (e) => {
  e.preventDefault();

  var login = document.getElementById("newUsername").value;
  var password = document.getElementById("newPassword").value;

  var data = {
    login: login,
    password: password
  };

  fetch("http://localhost:8080/api/v2/auth/signUp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(function (response) {
      if (response.ok) {
        registrationModal.style.display = 'none';
        modalBackground.style.display = 'none';
        document.body.classList.remove('modal-open');
      } else {
        alert('Неверный формат данных');
      }
    })
    .catch(function (error) {
      console.error("Ошибка:", error);
    });

});

document.getElementById('logoutButton').addEventListener('click', () => {
  setCookie('userId', '', -1);
  setCookie('username', '', -1);
  setCookie('token', '', -1);
  userModal.style.display = 'none';
  modalBackground.style.display = 'none';
  document.body.classList.remove('modal-open');
  window.location.reload();
});

document.getElementById('deleteAccountButton').addEventListener('click', () => {
  fetch(`http://localhost:8080/api/v2/users/remove`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${getCookie("token")}`
    }
  })
    .then(response => {
      if (response.ok) {
        setCookie('userId', '', -1);
        setCookie('username', '', -1);
        setCookie('token', '', -1);
        userModal.style.display = 'none';
        modalBackground.style.display = 'none';
        document.body.classList.remove('modal-open');
        window.location.reload();
      }
    })
});

function setCookie(name, value) {
  var expires = "";
  var date = new Date();
  date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
  expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function showUserModal() {
  var modalContent = document.querySelector("#userModal").querySelector(".modal-content");
  var userInfo = modalContent.querySelector('#userInfo');
  modalContent.querySelector("h2").textContent = `Наслаждайтесь просмотром,  ${getCookie('username')}!`;
  userInfo.textContent = `Вы успешно авторизованы`;
  userModal.style.display = 'block';
  modalBackground.style.display = 'block';
  document.body.classList.add('modal-open');
}

const closeUserModalButton = document.getElementById('closeUserModalButton');

closeUserModalButton.addEventListener('click', () => {
  userModal.style.display = 'none';
  modalBackground.style.display = 'none';
  document.body.classList.remove('modal-open');
});

function checkAndDisplayRating() {
  const token = getCookie('token');
  if (!token) {
    displayRatingButton();
    return;
  }

  const movieId = new URLSearchParams(window.location.search).get('id');
  const userId = getCookie('userId');

  fetch(`http://localhost:8080/api/v2/ratings/get?movieId=${movieId}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  })
    .then(response => {
      if (!response.ok && response.status === 404) {
        displayRatingButton();
      } else {
        return response.json();
      }
    })
    .then(data => {
      if (data) {
        displayUserRating(data.value);
        displayDeleteRatingButton(data.id);

      }
    })
    .catch(error => console.error('Ошибка:', error));
}

function displayRatingButton() {
  const ratingContainer = document.getElementById('ratingContainer');
  const ratingButton = document.createElement('button');
  ratingButton.textContent = 'Оценить';
  ratingButton.onclick = () => {
    const token = getCookie('token');
    if (!token) {

      authModal.style.display = 'block';
      modalBackground.style.display = 'block';
      document.body.classList.add('modal-open');
    } else {

      displayRangeSelector();
    }
  }
  ratingContainer.appendChild(ratingButton);
}

function displayDeleteRatingButton(ratingId) {
  const ratingContainer = document.getElementById('ratingContainer');
  const ratingDeleteButton = document.createElement('button');
  ratingDeleteButton.style.backgroundColor = '#db1a1a';
  ratingDeleteButton.textContent = 'Удалить';
  ratingDeleteButton.onclick = () => {
    fetch(`http://localhost:8080/api/v2/ratings/${ratingId}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookie("token")}`
      },
    })
      .then(response => {
        if (response.ok) {
          window.location.reload();
        }
      })
      .catch(error => console.error('Ошибка:', error));
  }
  ratingContainer.appendChild(ratingDeleteButton);
}


function displayUserRating(value) {
  const userRating = document.querySelector('#userRating');
  userRating.textContent = `Ваша оценка: ${value}`;
}


function displayRangeSelector() {
  const ratingContainer = document.getElementById('ratingContainer');
  ratingContainer.innerHTML = '';

  const rangeInput = document.createElement('input');
  rangeInput.type = 'range';
  rangeInput.min = '0';
  rangeInput.max = '10';
  rangeInput.value = '5';

  const valueDisplay = document.createElement('span');
  valueDisplay.textContent = `${rangeInput.value}`;
  valueDisplay.id = 'rangeValueDisplay';


  rangeInput.addEventListener('input', function () {
    valueDisplay.textContent = `${this.value}`;
  });

  ratingContainer.appendChild(rangeInput);
  ratingContainer.appendChild(valueDisplay);

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Оценить';
  submitButton.onclick = () => submitRating(rangeInput.value);
  ratingContainer.appendChild(submitButton);
}

function submitRating(value) {
  const token = getCookie('token');
  const movieId = new URLSearchParams(window.location.search).get('id');
  const userId = getCookie('userId');

  fetch('http://localhost:8080/api/v2/ratings/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      value: value,
      movieId: movieId,
    })
  })
    .then(response => {
      if (response.ok) {
        console.log('Оценка добавлена');
        window.location.reload();

      } else {
        console.error('Ошибка при добавлении оценки');
      }
    })
    .catch(error => console.error('Ошибка:', error));
}


var passwordInput = document.getElementById('newPassword');
var passwordTooltip = document.getElementById('passwordTooltip');

passwordInput.addEventListener('mouseover', function () {
  passwordTooltip.classList.add('show-tooltip');
});

passwordInput.addEventListener('mouseout', function () {
  passwordTooltip.classList.remove('show-tooltip');
});

const collectionSelect = document.getElementById('collectionSelect');
if (!getCookie("token")) {
  collectionSelect.style.display = 'none';
}

collectionSelect.addEventListener('focus', function () {
  loadCollections();
});

function loadCollections() {
  const token = getCookie('token');
  if (!token) {
    document.getElementById('collectionContainer').style.display = 'none';
    return;
  }

  const movieId = new URLSearchParams(window.location.search).get('id');

  fetch(`http://localhost:8080/api/v2/collections/free?movieId=${movieId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      collectionSelect.innerHTML = '<option value="">Добавить в коллекцию</option>';
      data.forEach(collection => {
        const option = document.createElement('option');
        option.value = collection.id;
        option.textContent = collection.name;
        collectionSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Ошибка:', error));
}

document.getElementById('collectionSelect').addEventListener('change', function () {
  const collectionId = this.value;
  if (!collectionId) return;

  const movieId = new URLSearchParams(window.location.search).get('id');
  const token = getCookie('token');

  fetch(`http://localhost:8080/api/v2/collections/${collectionId}/addMovie?movieId=${movieId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => {
      if (response.ok) {
        loadCollections();
      } else {
        console.error('Ошибка при добавлении в коллекцию');
      }
    })
    .catch(error => console.error('Ошибка:', error));
});







