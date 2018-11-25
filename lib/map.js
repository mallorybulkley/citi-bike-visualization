let map;

function initMap () {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 40.745, lng: -73.975 },
    zoom: 12,
    styles: mapStyles,
    streetViewControl: false,
    mapTypeControl: false
  });

  map.data.setStyle({
    fillColor: 'green',
    strokeWeight: 1
  });

  window.map = map;
  document.getElementById('map').style.height = window.innerHeight + "px";
}

document.addEventListener('DOMContentLoaded', initMap);