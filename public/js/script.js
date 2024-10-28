// Connect to the server
const socket = io();

// Object to store markers for each connected user
const markers = {};

// Initialize the map with Dhule's coordinates
const map = L.map("map").setView([0, 0], 10);

// Load and display the tile layer on the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Realtime Tracker",
}).addTo(map);

// Track whether the map has been centered on the user's location
let mapCentered = false;

// Check if geolocation is supported by the browser
if (navigator.geolocation) {
  // Track the position continuously
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Emit the current location to the server
      socket.emit("send-location", { latitude, longitude });

      // Log location for debugging
      console.log("Current position:", latitude, longitude);

      // Create or update marker for current user
      if (!markers[socket.id]) {
        // Create a new marker for the user
        markers[socket.id] = L.marker([latitude, longitude], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
          })
        }).addTo(map);
        markers[socket.id].bindPopup('Your Location').openPopup();
      } else {
        // Update the existing marker position
        markers[socket.id].setLatLng([latitude, longitude]);
      }

      // Center the map on the user's location only once
      if (!mapCentered) {
        map.setView([latitude, longitude], 13);
        mapCentered = true;
      }
    },
    (error) => {
      console.error("Geolocation error:", error);
      // Fallback to Dhule coordinates if geolocation fails
      map.setView([20.9042, 74.7749], 13);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000, // Reduced timeout for faster response
      maximumAge: 0,
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
  // Fallback to Dhule coordinates if geolocation is not supported
  map.setView([20.9042, 74.7749], 13);
}

// Update the map with new location data from other users
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  // Only handle markers for other users, not self
  if (id !== socket.id) {
    // Log the received location for debugging
    console.log(`Received location for ${id}:`, latitude, longitude);

    // Check if a marker already exists for this user
    if (markers[id]) {
      // Update existing marker position
      markers[id].setLatLng([latitude, longitude]);
    } else {
      // Create a new marker if one doesn't exist for this user
      markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
  }
});

// Optionally, handle user disconnection to remove their marker
socket.on("user-disconnected", (data) => {
  const { id } = data;
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});