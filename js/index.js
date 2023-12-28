document.addEventListener("DOMContentLoaded", function() {
   fetchMovies();
 });
var defaultStartYear = 1939;
var defaultEndYear = 2023;
 let currentPage = 0;
 let isLastPage = false;
 let selectedGenre = '';
 let selectedCountry = '';
 let startYear = defaultStartYear;
 let endYear = defaultEndYear;
 let isSearch = false;
 let search = document.getElementById("search-text");
 
 
 function fetchMovies() {
  let url = "";
  if (!isSearch) {
      url = `http://localhost:8080/api/v1/movies?page=${currentPage}&startYear=${startYear}&endYear=${endYear}`;
    if (selectedGenre) {
      url += `&genre=${selectedGenre}`;
    }
    if (selectedCountry) {
      url += `&country=${selectedCountry}`;
    }
  }
  else {
     
    url = `http://localhost:8080/api/v1/movies/search?title=${searchText}&page=${currentPage}`
  }
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0 ) {
        isLastPage = true;
      }
      displayMovies(data);
    })
    .catch(error => console.error('Ошибка:', error));
 }
 
 function displayMovies(movies) {
   const container = document.getElementById('moviesContainer');
   if (currentPage == 0) {
    container.innerHTML = ' ';
   }
   
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

     card.addEventListener('click', function()  {
      window.location.href = `movie.html?id=${this.getAttribute('data-movie-id')}`;
     })
     container.appendChild(card);
   });
 }

 document.getElementById('genreSelect').addEventListener('change', function() {
  selectedGenre = this.value;
  document.getElementById('resetFiltersButton').style.display = 'block'
  document.getElementById('applyFiltersButton').style.display = 'block'
});

document.getElementById('countrySelect').addEventListener('change', function() {
  selectedCountry = this.value;
  document.getElementById('resetFiltersButton').style.display = 'block'
  document.getElementById('applyFiltersButton').style.display = 'block'
});


document.getElementById('applyFiltersButton').addEventListener('click', function() {
  document.getElementById('yearRangeSlider').style.display = 'none'
  this.style.display = 'none';
  currentPage = 0;
  isLastPage = false;
  fetchMovies();
});

document.getElementById('resetFiltersButton').addEventListener('click', function() {
  document.getElementById('genreSelect').value = 'Жанр';
  document.getElementById('countrySelect').value = 'Страна';
  document.getElementById('applyFiltersButton').style.display = 'none'
  document.getElementById('yearRangeSlider').style.display = 'none'
  startYear = defaultStartYear;
  endYear = defaultEndYear;
  $("#yearRangeInput").val(startYear + " - " + endYear);
  $("#yearRangeSlider").slider("values", [defaultStartYear, defaultEndYear]);
  selectedGenre = '';
  selectedCountry = '';
  this.style.display = 'none';
  currentPage = 0;
  isLastPage = false;
  fetchMovies();
});
 
 let timeout;
 window.addEventListener('scroll', scrollEventHandler);


 function scrollEventHandler() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLastPage) {
      document.getElementById('loadingIndicator').style.display = 'block';
      currentPage++;
      fetchMovies();
    }
    else {
     document.getElementById('loadingIndicator').style.display = 'none';
    }
  }, 100);
 }

 let genresLoaded = false;
 let countriesLoaded = false;
 
 document.getElementById('genreSelect').addEventListener('focus', function() {
   if (!genresLoaded) {
     fetchGenres();
   }
 });
 
 document.getElementById('countrySelect').addEventListener('focus', function() {
   if (!countriesLoaded) {
     fetchCountries();
   }
 });



 
 function fetchGenres() {
   fetch('http://localhost:8080/api/v1/genres') // Замените URL_API_ЖАНРОВ на ваш URL
     .then(response => response.json())
     .then(genres => {
       populateDropdown(document.getElementById('genreSelect'), genres);
       genresLoaded = true;
     })
     .catch(error => console.error('Ошибка при получении жанров:', error));
 }
 
 function fetchCountries() {
   fetch('http://localhost:8080/api/v1/countries') // Замените URL_API_СТРАН на ваш URL
     .then(response => response.json())
     .then(countries => {
       populateDropdown(document.getElementById('countrySelect'), countries);
       countriesLoaded = true;
     })
     .catch(error => console.error('Ошибка при получении стран:', error));
 }
 
 function populateDropdown(selectElement, items) {
   items.forEach(item => {
     const option = document.createElement('option');
     option.value = item.name;
     option.textContent = item.name;
     selectElement.appendChild(option);
   });
 }

 let searchText = "";

 search.addEventListener("keydown", function(event) {
  if (event.key === 'Enter') { 
     event.preventDefault(); // Предотвращаем стандартное действие (отправку формы)
     searchText = search.value.trim();
     if (searchText.length > 0) {
        isSearch = true;
        currentPage = 0;
        isLastPage = false;
        fetchMovies();
        document.getElementById('genreSelect').style.display = 'none';
        document.getElementById('countrySelect').style.display = 'none';
        document.getElementById('yearRangeInput').style.display = 'none';
        document.getElementById('search-result').style.display = 'block';
     } 
  }
});



$(function() {
  $("#yearRangeSlider").hide(); // Скрыть ползунок при загрузке страницы

  $("#yearRangeInput").on('click', function() {
      $("#yearRangeSlider").toggle(); // Показать или скрыть ползунок при клике на поле выбора года
      document.getElementById('resetFiltersButton').style.display = 'block'
      document.getElementById('applyFiltersButton').style.display = 'block'
      
  });

  

  $("#yearRangeInput").val(startYear + " - " + endYear);

  $("#yearRangeSlider").slider({
      range: true,
      min: defaultStartYear,
      max: defaultEndYear,
      values: [defaultStartYear, defaultEndYear],
      slide: function(event, ui) {
          $("#yearRangeInput").val(ui.values[0] + " - " + ui.values[1]);
          startYear = ui.values[0];
          endYear =  ui.values[1];
      }
  });
});

// Открытие модального окна авторизации при нажатии на кнопку
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

// Закрытие модального окна при нажатии на крестик
const closeModalButton = document.getElementById('closeModalButton');

closeModalButton.addEventListener('click', () => {
  authModal.style.display = 'none';
  modalBackground.style.display = 'none';
  document.body.classList.remove('modal-open');
});

// Открытие модального окна регистрации при нажатии на ссылку "Зарегистрироваться"
const showRegistrationLink = document.getElementById('showRegistration');
const registrationModal = document.getElementById('registrationModal');

showRegistrationLink.addEventListener('click', () => {
  authModal.style.display = 'none';
  registrationModal.style.display = 'block';
  modalBackground.style.display = 'block';
  document.body.classList.add('modal-open');
});

// Закрытие модального окна регистрации при нажатии на крестик
const closeRegistrationModalButton = document.getElementById('closeRegistrationModal');

closeRegistrationModalButton.addEventListener('click', () => {
  registrationModal.style.display = 'none';
  modalBackground.style.display = 'none';
  document.body.classList.remove('modal-open');
});

// Обработка отправки формы авторизации
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Предотвращаем стандартное действие формы (перезагрузку страницы)
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
  .then(function(response) {
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
  })
  .catch(function(error) {
     console.error("Ошибка:", error);
  });
});

// Обработка отправки формы регистрации (по аналогии с формой авторизации)
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
  .then(function(response) {
     if (response.ok) {
      registrationModal.style.display = 'none';
      modalBackground.style.display = 'none';
      document.body.classList.remove('modal-open');
     } else  {
        alert("Неверный формат данных");
     }
  })
  .catch(function(error) {
     console.error("Ошибка:", error);
  });
  // Добавьте код для отправки данных на сервер и обработки регистрации
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

});

function setCookie(name, value) {
  var expires = "";
  var date = new Date();
  date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
  expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Strict";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
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


var passwordInput = document.getElementById('newPassword');
var passwordTooltip = document.getElementById('passwordTooltip');

  passwordInput.addEventListener('mouseover', function() {
    passwordTooltip.classList.add('show-tooltip');
  });

  passwordInput.addEventListener('mouseout', function() {
    passwordTooltip.classList.remove('show-tooltip');
  });

document.querySelector('#collection').addEventListener('click', function() {
    var token = getCookie('token');
    if (!token) {
      authModal.style.display = 'block';
      modalBackground.style.display = 'block';
      document.body.classList.add('modal-open');
      return;
    }
    window.removeEventListener("scroll", scrollEventHandler);
        fetch(`http://localhost:8080/api/v2/collections`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(collections => {
          document.getElementById('addCollectionButton').style.display = 'block';
          document.querySelector(".user-nav").querySelector(".search").querySelector("form").style.display = 'none';
          displayCollections(collections);
        })
        .catch(error => console.error('Ошибка:', error));
});

function displayCollections(collections) {
  const collectionsContainer = document.getElementById('collectionContainer');
  const moviesContainer = document.getElementById('moviesContainer');
  moviesContainer.innerHTML = ''; // Очищаем основной контейнер
  collectionsContainer.innerHTML = '';
  let count = 1;
  collections.forEach(collection => {
      const collectionContainer = document.createElement('div');
      collectionContainer.className = 'collection';

      const collectionTitle = document.createElement('h2');
      collectionTitle.textContent = `${count}. ${collection.name}`;

      

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Удалить';
      deleteButton.className = 'delete-collection-btn';
      deleteButton.onclick = function() { deleteCollection(collection.id); };
      collectionTitle.appendChild(deleteButton);

      const editButton = document.createElement('button');
      editButton.textContent = 'Изменить';
      editButton.className = 'edit-collection-btn'
      editButton.onclick = function() { editCollection(collection); };
      collectionTitle.appendChild(editButton);

      collectionContainer.appendChild(collectionTitle);

      const collectionOutline = document.createElement('p');
      collectionOutline.textContent = collection.outline;
      collectionContainer.appendChild(collectionOutline);
      collection.moviesCollection.forEach(movie => {
        const movieCard = createMovieCard(movie, collection.id);
        collectionContainer.appendChild(movieCard);
    });
    count++
    collectionsContainer.appendChild(collectionContainer);
});

// Скрываем селекторы жанров, годов и стран
document.querySelector('.filter-container').style.display = 'none';
}

function createMovieCard(movie, collectionId) {
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

image.addEventListener('click', function()  {
  window.location.href = `movie.html?id=${movie.id}`;
 })

const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Удалить из коллекции';
  deleteButton.className = 'delete-movie-btn';
  deleteButton.onclick = function() { removeMovieFromCollection(collectionId, movie.id); };
  card.appendChild(deleteButton);

return card;
}

document.getElementById('addCollectionButton').addEventListener('click', function() {
  document.getElementById('addCollectionModal').style.display = 'block';
  document.getElementById('modalBackground').style.display = 'block';
  document.body.classList.add('modal-open');
});


function editCollection(collection) {
  document.getElementById('editCollectionModal').style.display = 'block';
  document.getElementById('modalBackground').style.display = 'block';
  document.body.classList.add('modal-open');
  const modal =  document.getElementById('editCollectionModal');
  modal.querySelector('#collectionEditName').value = collection.name;
  modal.querySelector('#collectionEditOutline').textContent = collection.outline;

  document.getElementById('editCollectionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById("collectionEditName").value;
    var outline = document.getElementById("collectionEditOutline").value;
  
    var data = {
      name: name,
      outline: outline
    };
  
    fetch(`http://localhost:8080/api/v2/collections/${collection.id}/edit`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getCookie('token')}`
      },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      if (response.ok) {
        document.querySelector('#collection').click();
        document.getElementById('editCollectionModal').style.display = 'none';
        document.getElementById('modalBackground').style.display = 'none';
        document.body.classList.remove('modal-open');
  
      } else  {
        alert("Ошибка при изменении коллекции");
      }
    })
    .catch(function(error) {
      console.error("Ошибка:", error);
    });
  });
  
}



document.getElementById('closeAddCollectionModal').addEventListener('click', function() {
  document.getElementById('addCollectionModal').style.display = 'none';
  document.getElementById('modalBackground').style.display = 'none';
  document.body.classList.remove('modal-open');
});

document.getElementById('closeEditCollectionModal').addEventListener('click', function() {
  document.getElementById('editCollectionModal').style.display = 'none';
  document.getElementById('modalBackground').style.display = 'none';
  document.body.classList.remove('modal-open');
});

document.getElementById('addCollectionForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var name = document.getElementById("collectionName").value;
  var outline = document.getElementById("collectionOutline").value;

  var data = {
    name: name,
    outline: outline
  };

  fetch("http://localhost:8080/api/v2/collections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getCookie('token')}`
    },
    body: JSON.stringify(data)
  })
  .then(function(response) {
    if (response.ok) {
      document.querySelector('#collection').click();
      document.getElementById('addCollectionModal').style.display = 'none';
      document.getElementById('modalBackground').style.display = 'none';
      document.body.classList.remove('modal-open');

    } else  {
      alert("Ошибка при добавлении коллекции");
    }
  })
  .catch(function(error) {
    console.error("Ошибка:", error);
  });
});





function deleteCollection(id) {
  fetch(`http://localhost:8080/api/v2/collections/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getCookie('token')}` // Убедитесь, что передаёте токен авторизации, если это необходимо
    }
  })
  .then(response => {
    if(response.ok) {
      document.querySelector("#collection").click();// Обновите список коллекций на странице или покажите сообщение об успехе
      console.log('Коллекция удалена');
      // Вызовите функцию, которая обновляет отображение коллекций
    } else {
      console.error('Ошибка при удалении коллекции');
    }
  })
  .catch(error => console.error('Ошибка:', error));
}


function removeMovieFromCollection(collectionId, movieId) {
  fetch(`http://localhost:8080/api/v2/collections/${collectionId}/removeMovie?movieId=${movieId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${getCookie('token')}`, // Если необходимо, добавьте токен авторизации
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if(response.ok) {
      console.log('Фильм удален из коллекции');
      document.querySelector("#collection").click();
    } else {
      console.error('Ошибка при удалении фильма из коллекции');
    }
  })
  .catch(error => console.error('Ошибка:', error));
}

document.getElementById('deleteAccountButton').addEventListener('click', () => {
  fetch(`http://localhost:8080/api/v2/users/remove`, {
    method : "DELETE",
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






 
