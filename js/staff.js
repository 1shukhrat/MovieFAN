let staffId = null;
let staffRole = null;
let currentPage = 0;
let isLastPage = false;
let  url = "http://localhost:8080/api/v1/staff";
let urlRole = null;


document.addEventListener("DOMContentLoaded", function () {
   staffId  = new URLSearchParams(window.location.search).get('id');
   staffRole = new URLSearchParams(window.location.search).get('role');
   fetchStaffDetails();
   fetchMovies();
})

function fetchStaffDetails() {
   if (staffRole === "Директор") {
      urlRole = "/directors";
   }
   else {
      urlRole = "/actors";
   }
   url += urlRole;
   url += `/${staffId}`;
   fetch(url).
   then(respone => respone.json()).
   then(staff => {
      document.title=staff.fullName;
      document.querySelector(".photo").src = staff.photoUrl;
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
       if (data.length === 0 ) {
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
 
      card.addEventListener('click', function()  {
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
        url = "http://localhost:8080/api/v1/staff" + urlRole +  `/${staffId}`;
        fetchMovies();
      }
      else {
       document.getElementById('loadingIndicator').style.display = 'none';
      }
    }, 100);
  });
