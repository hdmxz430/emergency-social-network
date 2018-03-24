/* eslint-disable no-undef */
let map;
let groups = [];
let users = [];
let currentUser = JSON.parse(localStorage.user);
$(document).ready(function () {
    let dHint = $('#hint_message');
    let socket = io();

    if (currentUser.latitude) {
        updateMaker(currentUser.latitude, currentUser.longitude, currentUser.username);
        update();
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            currentUser.latitude = position.coords.latitude;
            currentUser.longitude = position.coords.longitude;
            changeStatus(3, () => {
                window.location.href = '/nearby';
            });

        }, showGeoError);
    } else {
        toastr('Geolocation is not supported by this browser.');
    }

    function update() {
        // get the nearby users
        $.json_get('/nearby/users', {token: localStorage.token})
            .then(data => {
                // users should not include this user
                console.log(JSON.stringify(data.users));
                users = data.users;
                users.forEach(user => {
                    updateMaker(user.latitude, user.longitude, user.username);
                });
                localStorage.nearby_users = JSON.stringify(users);

            }).catch(err => defaultError(err.status));

        // get nearby groups
        $.json_get('/nearby/groups', {token: localStorage.token})
            .then(data => {
                let html = '';
                console.log(JSON.stringify(data.groups));
                for (let group of data.groups) {
                    html += '<li class=\'list-group-item\' onclick="clickGroup(\'' + group.group_id + '\')"> ' + group.groupName + '</li>';
                }
                $('.list-group').html(html);
                groups = data.groups;
                // localStorage.nearby_groups = JSON.stringify(groups);
                if (groups.length === 0) {
                    dHint.show();
                } else {
                    dHint.hide();
                }
            }).catch(err => defaultError(err.status));
    }

    $('#askhelp').click(() => {
        // form a new group
        if (users.length === 0) {
            emptyUserMessage();
            return;
        }
        let members = users.map(user => user.username);
        members = [currentUser.username].concat(members);
        let group_id = checkGroupExists(groups, members, currentUser);
        console.log(group_id);
        if (group_id) {
            clickGroup(group_id);
        } else {
            formNewGroup(members);
        }
    });

    socket.on('update_groups', function () {
        window.location.href = '/nearby';
    });

});

function checkGroupExists(groups, users) {
    if (groups.length === 0 || users.length === 0) {
        return null;
    }
    users = users.sort();
    console.log(users);

    let tmpGroups = groups.filter(group => {
        let members = group.members.sort();
        console.log(members);
        for (let i = 0; i < members.length; i++) {
            if (members[i] !== users[i]) {
                return false;
            }
        }
        return true;
    });

    if (tmpGroups.length === 0) {
        return null;
    }
    return tmpGroups[0].group_id;
}

function formNewGroup(users) {
    $.json_post('/nearby/groups', {
        token: localStorage.token,
        members: users
    }).then((data) => {
        localStorage.nearby_group_id = data.group.group_id;
        localStorage.nearby_group = JSON.stringify(data.group);
        window.location.href = '/nearby/chat';
    }).catch(err => {
        if (err.status === 401)
            defaultError(err.status);
        else if (err.status === 500) {
            console.log(err.responseJSON.message);
        }
    });
}

function clickGroup(id) {
    let g = {};
    groups.forEach(group => {
        if (group.group_id === id) {
            g = group;
        }
    });

    localStorage.nearby_group = JSON.stringify(g);
    localStorage.nearby_group_id = id;
    window.location.href = '/nearby/chat';
}

// eslint-disable-next-line no-unused-vars
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: new google.maps.LatLng(currentUser.latitude, currentUser.longitude),
        mapTypeId: 'terrain'
    });

}

function updateMaker(lat, lon, username) {
    console.log(lat, lon, username);
    let latLng = new google.maps.LatLng(lat, lon);
    let markerIcon = {
        url: 'http://image.flaticon.com/icons/svg/252/252025.svg',
        scaledSize: new google.maps.Size(24, 24),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(32, 65),
        labelOrigin: new google.maps.Point(0, 33)
    };

    new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: latLng,
        icon: markerIcon,
        label: {
            text: username,
            color: "#eb3a44",
            fontSize: "16px",
            fontWeight: "bold"
        }
    });
}

function emptyUserMessage() {
    toastr.options.timeOut = 4000;
    toastr.options.onclick = function () {
        window.location.href = '/chat_public?token=' + localStorage.token;
    };

    toastr.warning('No other user within 5 miles, you can post emergency message in public chat');
}

function changeStatus(status, callback) {
    let toastFuns = {1: toastr.success, 2: toastr.warning, 3: toastr.error};

    let data = {
        user_status: status,
        token: localStorage.token,
        latitude: currentUser.latitude,
        longitude: currentUser.longitude
    };
    console.log('Data');
    console.log(JSON.stringify(data));

    $.json_put('/users/status', data)
        .then(() => {
            console.log('Update data Successfully');
            toastFuns[status]('Status Updated: ' + statusString[status]);
            let user = JSON.parse(localStorage.user);
            user.user_status = status;
            // if (user.latitude) {
            user.latitude = currentUser.latitude;
            user.longitude = currentUser.longitude;
            // }
            localStorage.user = JSON.stringify(user);
            callback();
        })
        .catch(err => {
            console.log(err);
            defaultError(err.status);
            toastr.info('Server error happens');
        });
}
