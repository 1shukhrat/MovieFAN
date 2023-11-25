document.addEventListener("DOMContentLoaded", function() {
   fetchMovies();
 });
 
 let currentPage = 0;
 let isLastPage = false;
 let selectedGenre = '';
 let selectedCountry = '';
 
 function fetchMovies() {
  let url = `http://localhost:8080/api/v1/movies?page=${currentPage}`;
  if (selectedGenre) {
    url += `&genre=${selectedGenre}`;
  }
  if (selectedCountry) {
    url += `&country=${selectedCountry}`;
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
  currentPage = 0;
  isLastPage = false;
  fetchMovies();
  document.getElementById('resetFiltersButton').style.display = 'block'
});

document.getElementById('countrySelect').addEventListener('change', function() {
  selectedCountry = this.value;
  currentPage = 0;
  isLastPage = false;
  fetchMovies();
  document.getElementById('resetFiltersButton').style.display = 'block'
});

document.getElementById('resetFiltersButton').addEventListener('click', function() {
  document.getElementById('genreSelect').value = '';
  document.getElementById('countrySelect').value = '';
  selectedGenre = '';
  selectedCountry = '';
  this.style.display = 'none';
  currentPage = 0;
  isLastPage = false;
  fetchMovies();
});
 
 let timeout;
 window.addEventListener('scroll', () => {
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
 });

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
 
