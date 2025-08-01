document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const placesList = document.getElementById('places-list');
    const placeDetails = document.getElementById('place-details');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:5000/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    document.cookie = `token=${data.access_token}; path=/`;
                    window.location.href = 'index.html';
                } else {
                    const errorData = await response.json();
                    alert('Login failed: ' + (errorData.error || response.statusText));
                }

            } catch (error) {
                alert('Network error: ' + error.message);
            }
        });
    } else if (placesList) {
        // === INDEX PAGE ===
        checkAuthentication(); // vérifie si utilisateur connecté
        setupPriceFilter();    // initialise le filtre
    }
    else if (placeDetails) {
        // === PAGE PLACE ===
        const placeId = getPlaceIdFromURL();
        const token = getCookie('token');

        if (!placeId) {
            alert("Aucun ID de lieu dans l’URL.");
            return;
        }

        if (!token) {
            const reviewForm = document.getElementById('add-review');
            if (reviewForm) reviewForm.style.display = 'none';
        }

        fetchPlaceDetails(token, placeId);
    }
});
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return value;
    }
    return null;
}
function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (!token) {
        if (loginLink) loginLink.style.display = 'block'; // Montre le lien
    } else {
        if (loginLink) loginLink.style.display = 'none'; // Cache le lien
        fetchPlaces(token); // Charge les places
    }
}
async function fetchPlaces(token) {
    try {
        const response = await fetch('http://localhost:5000/api/v1/places', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Erreur API");

        const places = await response.json();
        displayPlaces(places);
    } catch (err) {
        console.error('Erreur de récupération des places :', err);
    }
}
function displayPlaces(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = ''; // vide l'existant

    places.forEach(place => {
        const div = document.createElement('div');
        div.classList.add('place');
        div.setAttribute('data-price', place.price);

        div.innerHTML = `
            <h3>${place.title}</h3>
            <p>${place.description}</p>
            <p>📍 ${place.latitude}, ${place.longitude}</p>
            <p><strong>${place.price} €</strong></p>
        `;

        container.appendChild(div);
    });
}
function setupPriceFilter() {
    const filter = document.getElementById('price-filter');
    if (!filter) return;

    filter.addEventListener('change', (event) => {
        const selected = event.target.value;
        const places = document.querySelectorAll('#places-list .place');

        places.forEach(place => {
            const price = parseFloat(place.getAttribute('data-price'));
            if (selected === 'all' || price <= parseFloat(selected)) {
                place.style.display = 'block';
            } else {
                place.style.display = 'none';
            }
        });
    });
}
function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); // exemple : place.html?id=3
}
async function fetchPlaceDetails(token, placeId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Erreur API");

        const place = await response.json();
        displayPlaceDetails(place);
    } catch (err) {
        console.error('Erreur de récupération du lieu :', err);
    }
}
function displayPlaceDetails(place) {
    const section = document.getElementById('place-details');
    if (!section) return;

    section.innerHTML += `
        <h3>${place.title}</h3>
        <p><strong>Prix :</strong> ${place.price} €</p>
        <p>${place.description}</p>
        <p><strong>📍 Localisation :</strong> ${place.latitude}, ${place.longitude}</p>
    `;

    // Reviews
    const reviewsSection = document.getElementById('reviews');
    if (place.reviews && place.reviews.length > 0) {
        place.reviews.forEach(review => {
            const div = document.createElement('div');
            div.classList.add('review-card');
            div.innerHTML = `
                <p><strong>${review.author}</strong></p>
                <p>${review.text}</p>
                <p>${'★'.repeat(review.rating)}</p>
            `;
            reviewsSection.appendChild(div);
        });
    } else {
        reviewsSection.innerHTML += `<p>Aucun avis pour l’instant.</p>`;
    }
}
