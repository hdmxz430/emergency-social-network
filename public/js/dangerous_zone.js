/* eslint-disable no-undef */
let latitude;
let longitude;

$(document).ready(function () {
    let socket = io();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showGeoError);
    }
    else {
        toastr('Geolocation is not supported by this browser.');
    }

    setAlertHandler(socket);
    $('#report').click(function () {
        location.href = '/dangerous_zone/report_dangerous_zone?' + 'lat=' + latitude + '&lng=' + longitude;
    });


});


function initMap(lat, lng) {
    var uluru = {lat: lat, lng: lng};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 19,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map,
        label: 'you'
    });
}

function showPosition(position) {
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;
    latitude = lat;
    longitude = lng;
    initMap(lat, lng);
}
