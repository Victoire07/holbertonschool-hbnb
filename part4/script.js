document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

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
    } else {
        // === INDEX PAGE ===
        checkAuthentication(); // vérifie si utilisateur connecté
        setupPriceFilter();    // initialise le filtre
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

