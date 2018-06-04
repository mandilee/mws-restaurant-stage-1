/**
 * Common database helper functions.
 */
class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        const port = 1337 // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }

    /**
     * Function to set up and return the database!
     */
    static get dB() {
        // if it's already set, return it
        if (DBHelper._dB) {
            return Promise.resolve(DBHelper._dB);
        }

        // create and return the database!
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open('restaurant-reviews', 2);

            // send a rejection if there's an error
            openRequest.onerror = () => reject();

            // run the upgrade if needed
            openRequest.onupgradeneeded = () => {
                const db = openRequest.result,
                    store = db.createObjectStore('restaurants', {
                        keyPath: 'id'
                    });

                // set up some indexes - not sure if required
                // but my knowledge of mysql is telling me to!
                store.createIndex('id', 'id');
                store.createIndex('cuisine', 'cuisine_type');
                store.createIndex('neighborhood', 'neighborhood');
            };

            // open and resolve!
            openRequest.onsuccess = (event) => {
                DBHelper._dB = openRequest.result;
                resolve(DBHelper._dB);
            };
        });
    }

    /**
     * Function to set the data in the database
     */
    static putRestaurantsInDb(restaurants) {
        // get the db
        return DBHelper.dB
            .then((db) => {
                // set transaction and object store
                const transaction = db.transaction('restaurants', 'readwrite'),
                    objStore = transaction.objectStore('restaurants');
                // loop through restaurants
                restaurants.forEach((restaurant) => {
                    // and save them in teh database
                    objStore.put({
                        id: restaurant.id,
                        restaurant: restaurant
                    });
                });
            })
            // catch any errors and kick them to the console
            .catch(() => {
                console.log(`Whoops! Couldn't set data: ${restaurants}`);
            });
    }

    /**
     * Function to pull data from the database
     */
    static getRestaurantsFromDb(id) {
        // get the db
        return DBHelper.dB
            .then((db) => {
                // set transaction and object store
                const transaction = db.transaction('restaurants', 'readonly'),
                    objStore = transaction.objectStore('restaurants');
                // if there's an id
                if (id) {
                    // return the selected restaurant
                    return objStore.getAll(id);
                } else {
                    // otherwise return them all
                    return objStore.getAll();
                }
            })
            // if there's an error, kick it to the console!
            .catch(() => {
                console.log(`Whoops! Couldn't return data for restaurant ${id}`);
            });
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback, id = '') {
        // fetch all restaurants with proper error handling.
        let myCallback = callback;
        // grab the restaurant(s) from teh database
        DBHelper.getRestaurantsFromDb(id)
            // if there's any there, throw them to the screen
            .then((restaurants) => {
                // check restaurants exist 
                if (restaurants && restaurants.length > 0) {
                    // and throw them back
                    myCallback(null, restaurants);
                    myCallback = () => {};
                }
            })
            // then grab from the url
            .then(() => fetch(`${DBHelper.DATABASE_URL}/${id}`))
            // parse teh response
            .then((response) => response.json())
            // and insert/update the database
            .then((restaurants) => {
                if (!Array.isArray(restaurants)) {
                    restaurants = [restaurants];
                }
                DBHelper.putRestaurantsInDb(restaurants);
                myCallback(null, restaurants);
            })
            // catch any errors and you know the drill. Log it!
            .catch((error) => {
                myCallback(`Whoops! ${error.message}`, null);
            });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch one restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        }, id);
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        }, id);
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant, size = '') {
        //return (`/img/${restaurant.photograph}.jpg`);
        return (`/img/${restaurant.id}${size}.webp`); // changed to stop annoying 'File not found' error
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP
        });
        return marker;
    }

}
