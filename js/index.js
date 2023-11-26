document.addEventListener("DOMContentLoaded", function() {
   fetchMovies();
 });
 
 let currentPage = 0;
 let isLastPage = false;
 let selectedGenre = '';
 let selectedCountry = '';
 let selectedYear = [];
 
 function fetchMovies() {
  let url = `http://localhost:8080/api/v1/movies?page=${currentPage}`;
  if (selectedGenre) {
    url += `&genre=${selectedGenre}`;
  }
  if (selectedCountry) {
    url += `&country=${selectedCountry}`;
  }
  if (selectedYear) {
    for (i = 0; i < selectedYear.length; i++) {
      url += `&year=${selectedYear[i]}`;
    }
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

document.getElementById('yearSelect').addEventListener('change', function() {
  selectedYear = []
  const reg1 = /\d+-\d+/;
  if (reg1.test(this.value)) {
    years = this.value.split("-");
    for (i = years[0]; i <= years[1]; i++) {
      selectedYear.push(i);
    }
  }
  else if (this.value === "before-1985") {
    selectedYear.push(1984);
  }
  else {
    selectedYear.push(this.value);
  }
  currentPage = 0;
  isLastPage = false;
  fetchMovies();
  document.getElementById('resetFiltersButton').style.display = 'block'
});


document.getElementById('resetFiltersButton').addEventListener('click', function() {
  document.getElementById('genreSelect').value = 'Жанр';
  document.getElementById('countrySelect').value = 'Страна';
  document.getElementById('yearSelect').value = 'Год';
  selectedGenre = '';
  selectedCountry = '';
  selectedYear = [];
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
 let yearLoaded = false;
 
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

 document.getElementById('yearSelect').addEventListener('focus', function() {
  if (!yearLoaded) {
    populateYearSelect();
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

 function populateYearSelect() {
  const yearSelect = document.getElementById('yearSelect');
 // Очищаем существующие опции

  // Добавление годов с 2015 до 2023
  for (let year = 2023; year >= 2015; year--) {
    yearSelect.add(new Option(year, year));
  }

  // Добавление годов с шагом в 5 лет от 1990 до 2015
  for (let year = 2015 - 5; year >= 1990; year -= 5) {
    yearSelect.add(new Option(`${year-5}-${year}`, `${year-5}-${year}`));
  }

  // Добавление опции для годов до 1990
  yearSelect.add(new Option('до 1985', 'before-1985'));

  yearLoaded = true;
}

 
