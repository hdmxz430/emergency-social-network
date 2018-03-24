let latitude;
let longitude;

$(document).ready(function () {
    let socket = io();
    setAlertHandler(socket);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } 
    else {
      toastr('Geolocation is not supported by this browser.');
    }

});

function getAllDangerousZone(lat, lng){
    $.json_get('/dangerous_zone/show_dangerous_zone', {lat: lat, lng: lng})
    .then((data) => {
        let aroundList = data.aroundDangerousList;
        initMap(aroundList, lat, lng);
    })
}

function setMarker(resultsMap, locationInfo){
    //alert("lat:" + locationInfo.lat + "," + "lng:" + locationInfo.lng);
    var latlng = new google.maps.LatLng(locationInfo.lat, locationInfo.lng);
    var image = {
        size: new google.maps.Size(1, 1)
    }
    
    var contentString = '<div>' + '<h2>' + locationInfo.description + '</h2>' + '</div>';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    })

    var marker = new google.maps.Marker({
        map: resultsMap,
        position: latlng,
        icon: image
    });
    marker.addListener("click", function(){
        infowindow.open(resultsMap, marker);
    })
}


function initMap(aroundList, lat, lng){
    var uluru = {lat: lat, lng: lng};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 21,
      center: uluru
    });

    let label = 'you';
    var marker = new google.maps.Marker({
        map: map,
        position: uluru,
        label: label
    });
    for(let key in aroundList){
        let location = key;
        let locationLat = aroundList[key].lat;
        let locationLng = aroundList[key].lng;
        let locationDescription = aroundList[key].description;
        //alert('lat:' + locationLat + 'lng:' + locationLng + 'des:' + locationDescription);
        let locationInfo = {'lat': locationLat, 'lng': locationLng, 'description': locationDescription};
        setMarker(map, locationInfo);
    }
}

function showPosition(position) {
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;
  latitude = lat;
  longitude = lng;
  getAllDangerousZone(latitude, longitude);
  //initMap(lat, lng);
}

function showError(error) {
  let s = '';
  switch (error.code) {
      case error.PERMISSION_DENIED:
          s = 'User denied the request for Geolocation.';
          break;
      case error.POSITION_UNAVAILABLE:
          s = 'Location information is unavailable.';
          break;
      case error.TIMEOUT:
          s = 'The request to get user location timed out.';
          break;
      case error.UNKNOWN_ERROR:
          s = 'An unknown error occurred.';
          break;
  }
  toastr.warning(s);
  alert(s);
  location.href = '/users/directory';
}