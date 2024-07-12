let staffId = null;
let staffRole = null;
let currentPage = 0;
let isLastPage = false;
let url = "http://localhost:8080/api/v1/staff";
let urlRole = null;


document.addEventListener("DOMContentLoaded", function () {
  staffId = new URLSearchParams(window.location.search).get('id');
  staffRole = new URLSearchParams(window.location.search).get('role');
  fetchStaffDetails();
  fetchMovies();
})

function fetchStaffDetails() {
  if (staffRole === "Режиссёр") {
    urlRole = "/directors";
  }
  else {
    urlRole = "/actors";
  }
  url += urlRole;
  url += `/${staffId}`;
  fetch(url).
    then(response => response.json()).
    then(staff => {
      document.title = staff.fullName;
      document.querySelector(".photo").src = staff.photoUrl ? staff.photoUrl : '../images/no-poster.gif';
      document.querySelector(".photo").alt = staff.fullName;
      document.querySelector(".name").textContent = staff.fullName;
      document.querySelector(".role").textContent = staffRole;
    }).catch(error => console.error('Ошибка:', error));
}

function fetchMovies() {
  url += `/movies?page=${currentPage}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        isLastPage = true;
      }
      displayMovies(data);
    })
    .catch(error => console.error('Ошибка:', error));
}

function displayMovies(movies) {
  const container = document.getElementById('moviesContainer');
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    card.setAttribute('data-movie-id', movie.id);

    const image = document.createElement('img');
    image.src = movie.posterUrl;
    image.className = 'movie-image';

    const title = document.createElement('h2');
    title.className = 'movie-title';
    title.textContent = movie.title;

    card.appendChild(image);
    card.appendChild(title);

    card.addEventListener('click', function () {
      window.location.href = `movie.html?id=${this.getAttribute('data-movie-id')}`;
    })
    container.appendChild(card);
  });
}

let timeout;
window.addEventListener('scroll', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLastPage) {
      document.getElementById('loadingIndicator').style.display = 'block';
      currentPage++;
      url = "http://localhost:8080/api/v1/staff" + urlRole + `/${staffId}`;
      fetchMovies();
    }
    else {
      document.getElementById('loadingIndicator').style.display = 'none';
    }
  }, 100);
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
  authModal.style.display = 'block';
  modalBackground.style.display = 'block';
  document.body.classList.add('modal-open');
  window.location.reload();

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
