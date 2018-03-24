/* eslint-disable no-unused-vars */
/*global toastr, moment*/
$.extend({ //extend JQuery functions
    json_post: function (url, body) {
        return $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(body),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    json_get: function (url, body) {
        return $.ajax({
            type: 'GET',
            url: url,
            data: body,
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    json_put: function (url, body) {
        return $.ajax({
            type: 'PUT',
            url: url,
            data: JSON.stringify(body),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    json_delete: function (url, body) {
        return $.ajax({
            type: 'DELETE',
            url: url,
            data: JSON.stringify(body),
            contentType: 'application/json',
            dataType: 'json'
        });
    }
});

let statusString = {0: 'Undefined', 1: 'OK', 2: 'Help', 3: 'Emergency'};
let statusLabel = {0: 'label-default', 1: 'label-success', 2: 'label-warning', 3: 'label-danger'};
let accountStatus = {1: 'Active', 0: 'InActive'};
let privilegeLevel = {1: 'Citizen', 2: 'Coordinator', 3: 'Admin'};

//let socket = io(); //connect to our Socket.IO server

class AlertMessage {
    // constructor(id) {
    //     this.id = id;
    // }

    alertGroup(socket, currentUser, message_id) {
        socket.on('update_groups', function (msg) {
            //localStorage.user = JSON.stringify(msg.user);
            let iconSpan = $('<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>');
            let aPop = $('<a href="/" class="close" data-dismiss="alert" aria-label="close" title="close">' + 'OK' + '</a>');
            let textSpan = $('<span class="lead">'+"      New Group Chat Message From Nearby Users"+'</span>');
            let divPop = $('<div class="alert alert-danger" role="alert" id="popmessage"></div>');
                iconSpan.attr('class', 'glyphicon glyphicon-exclamation-sign');
                aPop.attr('href', "/nearby");
                divPop.attr("class", "alert alert-warning");

            iconSpan.appendTo(divPop);
            aPop.appendTo(divPop);
            textSpan.appendTo(divPop);
            $('#' + message_id).append(divPop);
        });
    }

    alertInactive(socket, currentUser, message_id) {
        socket.on('notify_account_info' + currentUser, function (msg) {
            localStorage.user = JSON.stringify(msg.user);
            let iconSpan = $('<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>');
            let aPop = $('<a href="/" class="close" data-dismiss="alert" aria-label="close" title="close">' + 'OK' + '</a>');
            let textSpan = $('<span class="lead">'+"      "+msg.msg+'</span>');
            let divPop = $('<div class="alert alert-danger" role="alert" id="popmessage"></div>');
            if(msg.info_type == 0 || msg.info_type == 2){
                iconSpan.attr('class', 'glyphicon glyphicon-exclamation-sign');
                aPop.attr('href', "/");
                divPop.attr("class", "alert alert-danger");
                if(msg.info_type == 2){
                    window.location.href = '/';
                }
            }
            else if(msg.info_type == 1){
                iconSpan.attr('class', 'glyphicon glyphicon-wrench');
                aPop.attr('href', "#");
                aPop.text('x');
                divPop.attr("class", "alert alert-info");
            }
            iconSpan.appendTo(divPop);
            aPop.appendTo(divPop);
            textSpan.appendTo(divPop);
            $('#' + message_id).append(divPop);
        });
    }
    alertMessage(socket, currentUser, message_id) {
        socket.on('notify receiver' + currentUser, function (msg) {
            let sender = msg.sender;
            let aPop = '<a href="#" class="close" data-dismiss="alert" aria-label="close" title="close">' + 'x' + '</a>';
            let privateUrl = '/chat_private?chatMate=' + sender + '&token=' + localStorage.token;
            let text = '<a href=\'' + privateUrl + '\'>' + 'a new message' + '</a>';
            let divPop = '<div class="alert alert-info" id="popmessage">' + aPop + text + '</div>';
            $('#' + message_id).append(divPop);
        });
    }

    alertDangerous(socket, currentUser, message_id){
        socket.on('broadcast dangerous', function(msg){
            let sender = msg.sender;
            let includedList = msg.included;
            let flag = false;
            for(let i = 0; i < includedList.length; i++){
                if(currentUser == includedList[i].username){
                    flag = true;
                    break;
                }
            }
            
            if(flag){
                let aPop = '<a href="#" class="close" data-dismiss="alert" aria-label="close" title="close">' + 'x' + '</a>';
                let gotoDangerous = '/dangerous_zone/goto_show_dangerous_zone';
                let text;
                if(sender == currentUser){
                    text = '<a href=\'' + gotoDangerous + '\'>' + 'you have updated a dangerous zone' + '</a>';
                }
                else{
                    text = '<a href=\'' + gotoDangerous + '\'>' + 'a new dangerous zone' + '</a>';
                }
           
                let divPop = '<div class="alert alert-danger" id="popdangerous">' + aPop + text + '</div>';
                $('#' + message_id).append(divPop);
            }
        })
    }
}


class Announcement {
    constructor(panel_id) {
        this.data = [];
        this.backup_data = [];
        this.panel_id = panel_id;
        this.list_id = 'ann_' + panel_id;
    }

    get(data_callback, empty_callback, limit = 0) {
        // if limit is undefined, null or 0, it would display all announcements
        let token = localStorage.token;
        return $.json_get('/announcement', {token, limit})
            .then((data, status, xhr) => {
                if (xhr.status === 204) {
                    empty_callback();
                } else {
                    data_callback(data.announcements);
                }
            }).catch(err => defaultError(err.status));
    }

    search(data, data_callback, empty_callback) {
        let token = localStorage.token;
        return $.json_get('/search_info/search_by_announcement', data)
            .then((data, status, xhr) => {
                if (data.message.length === 0) {
                    empty_callback();
                } else {
                    data_callback(data.message);
                }
            }).catch(err => defaultError(err.status));
    }

    post(data, callback) {
        $.json_post('/announcement', data).then(() => {
            if (callback)
                callback();
        }).catch(err => {
            defaultError(err.status);
        });
    }

    append(announcements, limit = 0) {
        if (!announcements)
            return;
        this.data = this.data.concat(announcements);
        this.data = Announcement.trunc(this.data, limit);
        this.update(this.data);
    }

    prepend(announcements, limit = 0) {
        console.log(announcements);
        if (!announcements)
            return;
        this.data = announcements.concat(this.data);
        this.data = Announcement.trunc(this.data, limit);
        this.update(this.data, this.list_id);
    }

    static trunc(announcements, limit = 0) {
        if (limit !== 0) {
            announcements = announcements.slice(0, limit);
        }
        return announcements;
    }

    update(announcements, list_id = this.list_id) {
        // if (!$('#' + this.panel_id).html()) {
        //     this.panelInsert(this.panel_id, this.list_id);
        // }
        let html = '';
        this.data = announcements;
        announcements.forEach(announcement => {
            html += Announcement.generateHtml(announcement);
        });
        $('#' + list_id).html(html);
    }

    static generateHtml(announcement) {
        console.log(announcement);
        return '<div class="list-group-item"><div>' + announcement.content + '</div>' +
            '<div class="row">' +
            '<p class="col-xs-offset-8 col-xs-4 text-right">' + announcement.sender + '</p></div>' +
            '<div class="row">' +
            '<p class="col-xs-offset-4 col-xs-8 text-right"><small>' + moment(announcement.timestamp).format('MMMM Do YYYY, h:mm') + '</small></p></div>' +
            '</div>';
    }


    panelInsert(id, list_id) {
        let panel = $('#' + id);
        const nav = '<nav aria-label="...">' +
            '  <ul class="pager">' +
            '    <li class="previous"><a href="#"><span aria-hidden="true">&larr;</span> Older</a></li>' +
            '    <li class="next"><a href="#">Newer <span aria-hidden="true">&rarr;</span></a></li>' +
            '  </ul>' +
            '</nav>';
        const html = '<div class="panel panel-info">' +
            '<div class="panel-heading">' +
            '<h3 class="panel-title">Latest Announcement</h3>' +
            '</div>' +
            '<div class="panel-body" id="' + list_id + '"></div>' + nav +
            '</div>';
        panel.html(html);
    }

    registerPostAnnouncement(socket, callback, limit = 0, is_reversed = true) {
        socket.on('announcement posted', announcement => {
            console.log(announcement);
            if (is_reversed) {
                this.prepend([announcement], limit);
            } else {
                this.append([announcement], limit);
            }
            if (callback)
                callback(announcement);
        });
    }

    save() {
        this.backup_data = [];
        this.data.forEach(d => this.backup_data.push(d));
    }

    restore() {
        return this.backup_data;
    }

}

function post_logout(url, data) {
    return $.json_delete(url, data).then((res, status, xhr) => {//Success Function
        console.log(typeof(xhr.status));
        console.log(res);
        if (xhr.status === 200) {
            //Clear localStorage
            localStorage.token = null; //******This Need To be Notified Later, Cause two users on the same Browser will share one token******
            localStorage.user = null;
            //socket.emit('logout',localStorage.token);
            window.location.href = '/'; //Go back to homepage
        }

    }).catch(e => { //Failure Function
        console.log(e.status);
        localStorage.token = null;
        localStorage.user = null;
        window.location.href = '/';
    });
}

toastr.options = {
    'closeButton': false,
    'debug': false,
    'progressBar': false,
    'positionClass': 'toast-bottom-center',
    'preventDuplicates': true,
    'showDuration': '300',
    'hideDuration': '1000',
    'timeOut': '1000',
    'extendedTimeOut': '1000',
    'showEasing': 'swing',
    'hideEasing': 'linear',
    'showMethod': 'fadeIn',
    'hideMethod': 'fadeOut'
};

let defaultError = (status) => {
    if (status === 401) {
        window.location.href = '/';
    }
};

let showGeoError = (error) => {
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
    // alert(s);
    // location.href = '/users/directory';
};

let getUrlParameter = function getUrlParameter(sParam) {
    let sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

let setAlertHandler = (socket) => {
    let currentUser = JSON.parse(localStorage.user).username;
    let alert_Group = new AlertMessage('contain');
    alert_Group.alertGroup(socket, currentUser, 'contain');
    let alert_Inactive = new AlertMessage('contain');
    alert_Inactive.alertInactive(socket, currentUser, 'contain');
    let alert_message = new AlertMessage('contain');
    alert_message.alertMessage(socket, currentUser, 'contain');
    let alert_dangerous = new AlertMessage('dangerous');
    alert_dangerous.alertDangerous(socket, currentUser, 'dangerous');
}

const CUser = {
    PRIVILEGE_USER: 1,
    PRIVILEGE_COORDINATOR: 2,
    PRIVILEGE_ADMIN: 3,

    STATUS_ONLINE:1,
    STATUS_OFFLINE: 0,

    ACCOUNT_STATUS_ACTIVE: 1,
    ACCOUNT_STATUS_INACTIVE: 0,

    USER_STATUS_UNDEFINED: 0,
};