document.addEventListener("DOMContentLoaded", function() {
   const movieId = new URLSearchParams(window.location.search).get('id');
   fetchMovieDetails(movieId);
   insertKinoboxPlayer(movieId);
   fetchMovieStaff(movieId);

   const crewList = document.getElementById('movieCrew');
    const leftScrollButton = document.querySelector('.left-scroll');
    const rightScrollButton = document.querySelector('.right-scroll');

    leftScrollButton.addEventListener('click', () => {
        crewList.scrollLeft -= 100; // Можно настроить значение
    });

    rightScrollButton.addEventListener('click', () => {
        crewList.scrollLeft += 100; // Можно настроить значение
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
 
   // Заполнение деталей фильма
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
   kinoboxContainer.appendChild(kinoboxPlayer);
 
   const kinoboxScript = document.createElement('script');
   kinoboxScript.src = 'https://kinobox.tv/kinobox.min.js';
   document.body.appendChild(kinoboxScript);
 
   kinoboxScript.onload = () => {
     new Kinobox('.kinobox_player', { 
      search: { 
         kinopoisk: movieId 
      },
      hide: ['alloha'],
   }).init();
   };
 }

 document.getElementById('submitComment').addEventListener('click', () => {
  const commentText = document.getElementById('commentText').value;
  if (commentText) {
    const comment = document.createElement('div');
    comment.className = 'comment';
    comment.textContent = commentText;
    document.querySelector('.comments-list').appendChild(comment);

    // Очистить текстовое поле
    document.getElementById('commentText').value = '';

    // Здесь можно добавить отправку комментария на сервер
  }
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
        const directorItem = createCrewMemberListItem(director.fullName, null, "Режиссёр");
        crewContainer.appendChild(directorItem);
    });

    staff.actors.forEach(actor => {
        const actorItem = createCrewMemberListItem(actor.fullName, actor.photoUrl, "Актёр");
        crewContainer.appendChild(actorItem);
    });
}

function createCrewMemberListItem(name, photoUrl, role) {
  const listItem = document.createElement('li');
  listItem.classList.add('crew-member');

  const img = document.createElement('img');
  img.src = photoUrl ? photoUrl : '../images/no-poster.gif'; // Замените на путь к вашему дефолтному изображению
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

  return listItem;
}






 