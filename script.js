let tasks = [];
let map, locationMap, mainMapCurrentLocationMarker;
let taskMarkers = [];
let selectedLocation = null;
let userCurrentLocation = null; // To store user's current location

// Initialize the main map for tasks
function initializeMainMap() {
    map = L.map('map').setView([51.505, -0.09], 13); // Default to London initially
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Check for user's current location to add a marker
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userCurrentLocation = { lat, lng };

            // Add marker for user's current location on the main map
            if (!mainMapCurrentLocationMarker) {
                mainMapCurrentLocationMarker = L.marker([lat, lng], {icon: L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })})
                .addTo(map)
                .bindPopup("You are here");
            }

            // Center map on current location
            map.setView([lat, lng], 13);
        }, function() {
            alert("Unable to retrieve your location.");
        });
    }
}

// Initialize the location selection map, and center on user's current location if available
function initializeLocationMap() {
    locationMap = L.map('locationMap').setView([51.505, -0.09], 13); // Default to London initially
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(locationMap);

    // Check if geolocation is available and center the map on user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userCurrentLocation = { lat, lng };

            // Set map view to the user's current location
            locationMap.setView([lat, lng], 13);

            // Add a marker for the user's current location
            L.marker([lat, lng]).addTo(locationMap)
                .bindPopup("Your current location")
                .openPopup();
        }, function() {
            alert("Unable to retrieve your location.");
        });
    }

    // Add click event to choose location
    locationMap.on('click', function(e) {
        selectedLocation = e.latlng;
        document.getElementById('chosenLocation').innerText = `Chosen Location: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`;
    });
}

// Show or hide the location selection map
document.getElementById('addLocationCheckbox').addEventListener('change', function() {
    const locationMapContainer = document.getElementById('locationMapContainer');
    if (this.checked) {
        locationMapContainer.style.display = 'block';
        if (!locationMap) {
            initializeLocationMap();
        } else if (userCurrentLocation) {
            // If map is already initialized and we have the user's current location, reset the view to it
            locationMap.setView([userCurrentLocation.lat, userCurrentLocation.lng], 13);
        }
    } else {
        locationMapContainer.style.display = 'none';
        selectedLocation = null;
        document.getElementById('chosenLocation').innerText = 'No location chosen';
    }
});

// Add a new task
document.getElementById('addTaskBtn').addEventListener('click', () => {
    const taskInput = document.getElementById('taskInput').value;
    const addLocation = document.getElementById('addLocationCheckbox').checked;

    if (!taskInput) {
        alert("Please enter a task.");
        return;
    }

    const newTask = { description: taskInput, location: null };

    if (addLocation && selectedLocation) {
        newTask.location = { lat: selectedLocation.lat, lng: selectedLocation.lng };
    }

    tasks.push(newTask);
    displayTasks();

    // Reset form
    document.getElementById('taskInput').value = ''; // Clear input
    document.getElementById('addLocationCheckbox').checked = false; // Reset checkbox
    selectedLocation = null;
    document.getElementById('locationMapContainer').style.display = 'none'; // Hide map
    document.getElementById('chosenLocation').innerText = 'No location chosen'; // Reset location text
});

// Display tasks in the task list
function displayTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear list

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${task.description}`;
        if (task.location) {
            li.innerHTML += ` <br/><em>(Location added: ${task.location.lat.toFixed(4)}, ${task.location.lng.toFixed(4)})</em>`;
        }
        taskList.appendChild(li);
    });

    updateMapMarkers();
}

// Update map markers for tasks with locations
function updateMapMarkers() {
    if (taskMarkers.length) {
        taskMarkers.forEach(marker => map.removeLayer(marker));
    }

    const tasksWithLocations = tasks.filter(task => task.location);
    if (tasksWithLocations.length) {
        document.getElementById('mapContainer').style.display = 'block';

        tasksWithLocations.forEach(task => {
            const marker = L.marker([task.location.lat, task.location.lng])
                .addTo(map)
                .bindPopup(task.description);
            taskMarkers.push(marker);
        });

        // Center map on first task location or user's current location
        if (userCurrentLocation) {
            map.setView([userCurrentLocation.lat, userCurrentLocation.lng], 13);
        } else {
            map.setView([tasksWithLocations[0].location.lat, tasksWithLocations[0].location.lng], 13);
        }
    } else {
        document.getElementById('mapContainer').style.display = 'none';
    }
}

// Initialize the main map on page load
initializeMainMap();
