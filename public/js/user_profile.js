/* eslint-disable no-undef */
/*global toastr, statusString, defaultError*/
$(document).ready(function () {
    let socket = io();
    let user = JSON.parse(localStorage.user);
    $('#status_text').text('Status:' + statusString[user.user_status]);
    $('#username').text(user.username);
    $('#status_list').on('click', 'li', function () {
        changeStatus($(this).attr('index'));
    });
    setAlertHandler(socket);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        toastr('Geolocation is not supported by this browser.');
    }

    $('#warn_list').on('click', 'li', function () {
        changeWarn($(this).attr('index'));
    });
});

function changeWarn(warn) {
    let warnStatus = {1: true, 2: false};
    let allowWarn = {1: 'allowed', 2: 'not allowed'};
    let data = {username: JSON.parse(localStorage.user).username, warn: warnStatus[warn], token: localStorage.token};
    $.json_put('/users/updateWarn', data)
        .then(() => {
            console.log('Update warn status successfully');
            toastr.success('Warn Status updated:' + allowWarn[warn]);
            $('#warn_text').text('Warn Status:' + allowWarn[warn]);
        })
        .catch((err) => {
            console.log(err);
            defaultError(err.status);
            toastr.info('Server error happens');
        });

}

function changeStatus(status) {
    let toastFuns = {1: toastr.success, 2: toastr.warning, 3: toastr.error};

    console.log(status);
    let latitude = $('#latitude').text();
    let longitude = $('#longitude').text();

    let data = {user_status: status, token: localStorage.token};
    if (latitude)
        data.latitude = latitude;
    if (longitude)
        data.longitude = longitude;
    $.json_put('/users/status', data)
        .then(() => {
            console.log('Update data Successfully');
            toastFuns[status]('Status Updated: ' + statusString[status]);
            $('#status_text').text('Status:' + statusString[status]);
            let user = JSON.parse(localStorage.user);
            user.user_status = status;
            user.latitude = latitude;
            user.longitude = longitude;
            localStorage.user = JSON.stringify(user);
        })
        .catch(err => {
            console.log(err);
            defaultError(err.status);
            toastr.info('Server error happens');
        });
}

function showError(error) {
    showGeoError(error);
    $('#latitude').text('Denied');
    $('#longitude').text('Denied');
}

function showPosition(position) {
    $('#latitude').text(position.coords.latitude);
    $('#longitude').text(position.coords.longitude);
}