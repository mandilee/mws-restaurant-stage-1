let restaurant,
    map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        callback('No restaurant id in URL', null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.className = 'restaurant-name';
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.className = 'restaurant-address';
    address.setAttribute('aria-label', 'Address for ' + restaurant.name);
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.alt = `${restaurant.name} - ${restaurant.neighborhood}`;
    image.className = 'restaurant-img'
    image.src = DBHelper.imageUrlForRestaurant(restaurant, '-md');
    image.setAttribute('srcset', `${DBHelper.imageUrlForRestaurant(restaurant)} 800w, ${DBHelper.imageUrlForRestaurant(restaurant, '-md')} 600w, ${DBHelper.imageUrlForRestaurant(restaurant, '-sm')} 300w`);
    image.setAttribute('sizes', '(min-width: 1510px), (max-width: 15100px), (max-width: 840px)');

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.className = 'restaurant-cuisine';
    address.setAttribute('aria-label', 'Cuisine Type');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    hours.className = 'restaurant-hours';
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    li.className = "review-container";

    const head = document.createElement('div');
    head.className = "review-header";
    li.appendChild(head);

    const name = document.createElement('div');
    name.setAttribute('aria-label', 'Reviewer name');
    name.className = "review-name";
    name.innerHTML = review.name;
    head.appendChild(name);

    const date = document.createElement('div');
    date.setAttribute('aria-label', 'Review date');
    date.className = "review-date";
    date.innerHTML = review.date;
    head.appendChild(date);

    const rating = document.createElement('p');
    rating.setAttribute('aria-label', 'Review rating');
    rating.className = "review-rating";
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.setAttribute('aria-label', 'Review comments');
    comments.className = "review-comments";
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
