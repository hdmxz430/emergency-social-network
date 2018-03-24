/* eslint-disable no-undef */
let currentUser = '';
let id = '';
$(document).ready(function () {
    let socket = io();
    console.log($.user);
    currentUser = JSON.parse(localStorage.user).username;

    setAlertHandler(socket);

    id = getUrlParameter("id");
    get_poll("/poll/polldetail", {id: id, token: localStorage.token});
    socket.on('vote ' + id, function (data) {
        console.log("got it");
        $("#poll_List").empty();
        get_poll("/poll/polldetail", {id: id, token: localStorage.token});
    });
});


function get_poll(url, data) { //get Directory
    return $.json_get(url, data).then((res, status, xhr) => {//Success Function
        console.log(xhr.status);
        if (xhr.status === 200) {
            //Get UserList Array
            console.log(res);
            let can_vote = true;
            $("#title").text(res.poll.pollname);
            let html = '';
            if (!(res.poll.description.trim() === '')) {
                html = '<div class="list-group"><div class="list-group-item">' + res.poll.description + '</div>';
            }

            if (res.poll.timestamp < moment.now()) {
                html += '<div class="list-group-item"> Expired</div>';
                can_vote = false;
            }
            else {
                html += '<div class="list-group-item"> Expire On' + moment(res.poll.timestamp).format("MMMM Do YYYY, h:mm:ss a") + '</div>';
            }
            let sum = 0;
            for (let i = 0; i < res.poll.vote_num.length; i++) {
                sum += res.poll.vote_num[i];
            }
            for (let i = 0; i < res.poll.voted.length; i++) {
                if (currentUser === res.poll.voted[i]) {
                    can_vote = false;
                    break;
                }
            }
            if (sum == 0) {
                html += '<div class="list-group-item"><form  id="option">';
                for (let i = 0; i < res.poll.vote_num.length; i++) {
                    html += '<input type="radio" name="opt" id="opt" value="' + i + '"><strong>' + res.poll.options[i] + '</strong>' +
                        '  <div>' +
                        '      <div class="bar" style="background-color:lightblue;width: 0;">0%</div>' +
                        '  </div>'
                }
            }
            else {
                html += '<div class="list-group-item"><form id="option">';
                for (let i = 0; i < res.poll.vote_num.length; i++) {
                    html += '<input type="radio" name="opt" id="opt" value="' + i + '"><strong>' + res.poll.options[i] + '</strong>' +
                        '  <div >' +
                        '      <div class="bar" style="background-color:lightblue;width: ' + res.poll.vote_num[i] * 100 / sum + '%;">' + Number((res.poll.vote_num[i] * 100 / sum).toFixed(1)) + '%</div>' +
                        '  </div>'

                }
            }
            html += '</form>';
            if (can_vote) {
                html += '<button class="btn btn-default" type="button" id="vote" name="vote" onclick="vote()">Vote</button>';
            }
            html += '</div>';

            $("#poll_List").append(html);

        }

    }).catch(e => { //Failure Function
        defaultError(e.status);
    });
}


let vote = function () {
    console.log("called");
    let data = {
        token: localStorage.token,
        username: currentUser,
        id: id,
        option: $('input[name=opt]:checked', '#option').val()
    };
    console.log(data);
    $.json_post('/poll/vote', data).catch(err => {
        defaultError(err.status);
    });
};