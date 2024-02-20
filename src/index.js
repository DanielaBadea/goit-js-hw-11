import axios from "axios";
import notiflix, { Notify } from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '42359129-619b382e804cbed1a57717974';
const LIMIT = 40;
let page = 1;

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });

// Ascundem butonul "Load more" inițial
btnLoadMore.style.display = 'none';

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchQuery = form.searchQuery.value.toLowerCase().trim();
    console.log("Search query:", searchQuery); // Verificați dacă valoarea este preluată corect
    if (searchQuery === '') {
        console.log("Empty search query");
        notiflix.Notify.warning('Please, input a query...')
        btnLoadMore.style.display = 'none';
        return;
    };
    try {
        const params = new URLSearchParams({
            key: API_KEY,
            q: searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'true',
            page: page,
            per_page: LIMIT,
        });
        console.log("Params:", params.toString()); // Verificați dacă parametrii sunt corecți
        const response = await axios.get(`${BASE_URL}?${params}`);
        console.log("Response:", response.data); // Verificați răspunsul primit de la API
        if (response.data.hits.length === 0) {
            console.log("No images found");
            notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            btnLoadMore.style.display = 'none';
            return;
        }
        clearInput(); // Ștergem galeria existentă la fiecare căutare nouă
        response.data.hits.forEach((img) => {
            const cardHTML = markupImagesCard(img);
            return gallery.insertAdjacentHTML('beforeend', cardHTML);
        });
        scrollToGallery();
        lightbox.refresh();
        // Afișăm butonul "Load more" după prima cerere
        btnLoadMore.style.display = 'block';
        // Verificăm dacă utilizatorul a ajuns la sfârșitul colecției
        if (response.data.totalHits <= page * LIMIT) {
            btnLoadMore.style.display = 'none';
            notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
        return response.data;
    } catch(err) {
        console.error(err);
    };
});

btnLoadMore.addEventListener('click', async () => {
    page++;
    const searchQuery = form.searchQuery.value.toLowerCase().trim();
    try {
        const params = new URLSearchParams({
            key: API_KEY,
            q: searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'true',
            page: page,
            per_page: LIMIT,
        });
        const response = await axios.get(`${BASE_URL}?${params}`);
        console.log(response.data);
        if(response.data.hits.length === 0){
            notiflix.Notify.failure('Sorry, there are no more images to load.');
            return;
        }
        clearInput();
        response.data.hits.forEach((img) => {
            const cardHTML= markupImagesCard(img);
            return gallery.insertAdjacentHTML('beforeend', cardHTML);
        });
        scrollToGallery();
        lightbox.refresh();
        // Verificăm dacă utilizatorul a ajuns la sfârșitul colecției
        if (response.data.totalHits <= page * LIMIT) {
            btnLoadMore.style.display = 'none';
            notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
        return response.data;
    } catch (err) {
        console.error(err);
    }
});

    function markupImagesCard(image){
        const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = image;
    
        return `
            <div class="photo-card">
                <a class="img-link" href="${largeImageURL}">
                    <img class="gallery-image" src="${webformatURL}" data-source="${largeImageURL}" alt="${tags}" loading="lazy"/>
                </a>
                <div class="info">
                    <p class="info-item"><b>Likes</b> ${likes}</p>
                    <p class="info-item"><b>Views</b> ${views}</p>
                    <p class="info-item"><b>Comments</b> ${comments}</p>
                    <p class="info-item"><b>Downloads</b> ${downloads}</p>
                </div>
            </div>`;
};

function clearInput(){
    gallery.innerHTML ='';
};

function scrollToGallery() {
    const gallery = document.querySelector(".gallery");
    if (gallery) {
      const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
      });
    }
  };