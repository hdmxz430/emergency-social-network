/* eslint-disable no-undef */
$(document).ready(function () {
    let socket = io();
    console.log($.user);
    get_poll('/poll/list', {token: localStorage.token});
    setAlertHandler(socket);
    socket.on('poll posted', function (data) {
        console.log("got it");
        $("#poll_List").empty();
        get_poll('/poll/list', {token: localStorage.token});
    });
    $("#createbox").click(function () {
        $("#create_box").css("display", "inline");
    });

    $('#create').click(create);
});

function create() {
    let currentUser = JSON.parse(localStorage.user).username;
    let opt = $('#polloptions').val();
    let title = $('#polltitle').val();
    let description = $('#polldes').val();
    let expire = $('#expire').val();
    if ((title.trim()) === '') {
        alert("Title can not be empty");
        return;
    }
    if (opt.split("\n").length < 2) {
        alert("There should be at leastt two options");
        return;
    }
    if (description.length === 0) {
        description = ' ';
    }
    let data = {
        token: localStorage.token,
        username: currentUser,
        description: description,
        pollname: title,
        expire: moment(expire).unix() * 1000,
        option: opt
    };
    $.json_post('/poll', data).then(() => {
        $("#create_box").css("display", "none");
    }).catch(err => {
        defaultError(err.status);
    });
}

function insertPoll(data, loc) {
    console.log(data);
    let poll = $('<a href="/poll/detail?id=' + data._id + '" class="list-group-item"></a>').append('<div class="row"></div>');

    let html = '<div class="row">' +
        '<div class="col-xs-12">' +
        '<h4>' + data.pollname + '</h4></div>';
    if (data.timestamp < moment.now()) {
        html += '<div class="col-xs-8"><span class="Expiration">Expired</span></div>';
    }
    else {
        html += '<div class="col-xs-8"><span class="Expiration">Expire On ' + moment(data.timestamp).format("MMMM Do YYYY, h:mm:ss a") + '</span></div>';
    }
    html += '</div>' +
        '<div>' + data.description + '</div>' +
        '</div>';

    poll.html(html);
    $(loc).append(poll);
}

function get_poll(url, data) { //get Directory
    return $.json_get(url, data).then((res, status, xhr) => {//Success Function
        console.log(xhr.status);
        if (xhr.status === 200) {
            //Get UserList Array
            console.log(res);
            for (let i = 0; i < res.polllist.length; i++) {
                insertPoll(res.polllist[i], "#poll_List");
            }

        }

    }).catch(e => { //Failure Function
        defaultError(e.status);
    });
}