/*global Directory, io, Announcement, defaultError, AlertMessage*/
let usrList = new Directory();
let resultList = new Directory();
let socket = io(); //connect to our Socket.IO server

let dHint;

$(document).ready(function () {
    console.log(localStorage.user);
    if(JSON.parse(localStorage.user).privilege== 3){
        console.log("Administrator");
        $('#dashboardgotoAdmin').show();
    }
    else{
        $('#dashboardgotoAdmin').hide();
    }
    dHint = $('#hint_message');
    let announcement = new Announcement('announcement_panel');
    announcement.registerPostAnnouncement(socket, () => {
        console.log("new announcement");
        update_view_default();
    }, 1);

    /* Display the latest announcement in User Directory Page*/
    announcement.get((ann) => {
        announcement.update(ann);
        update_view_default();
    }, () => {
        update_view_empty();
    }, 1);

    get_directory('/users', {token: localStorage.token});
    setAlertHandler(socket);
    searchHandler();
    socket.on('update', function (data) {
        usrList.clear();
        console.log(data);
        for (let i = 0; i < data.users.length; i++) {
            usrList.add(data.users[i]);
        }
        usrList.insertAll('#user_List');//Insert All users into the list
    });
    $('#dashboardgotoChatPublic').click(function () {
        location.href = '/chat_public?token=' + localStorage.token;
    });
    /* Go to Administration Directory */
    $('#dashboardgotoAdmin').click(function () {
        //get_admin_page('/admins', {token: localStorage.token});
        if(JSON.parse(localStorage.user).privilege== 3){
                console.log("Administrator");
                location.href = '/admins?token=' + localStorage.token;
            }
        else {
            toastr.info('Only Administrator Can Access Administration Page');
        }
    });
});

function searchHandler() {
    searchInit();
    $('#search').click(function () {
        $('#results').empty();
        resultList.clear();
        let search_words;
        let url = '/search_info/';
        switch ($('#searchfield').text()) {
            case 'Username':
                url += 'search_by_username';
                search_words = $('#searchwords').val();
                searchByNameOrStatus(url, {username: search_words, page: 0});
                break;
            case 'Status':
                url += 'search_by_status';
                search_words = $('#statusField').attr('statusIndex');
                searchByNameOrStatus(url, {status: search_words, page: 0});
                break;
            default:
                break;
        }
    });
}

function searchInit() {
    $('#username').click(function () {
        $('#searchfield').text('Username');
        $('#dropDownField').hide();
        $('#searchwords').show();
    });
    $('#status').click(function () {
        $('#searchfield').text('Status');
        $('#searchwords').hide();
        $('#dropDownField').show();
    });
    $('#statusList').on('click', 'li', function (event) {
        event.preventDefault();
        let statusSelected = $(this);
        $('#statusField').text(statusSelected.text());
        $('#statusField').attr('statusIndex', statusSelected.find('a').attr('index'));
    });
}

function searchByNameOrStatus(url, data) {
    $.json_get(url, data)
        .then((res) => {
            let temp = res.message;
            for (let i = 0; i < temp.length; i++) {
                resultList.add(temp[i]);
            }
            console.log(resultList);
            resultList.insertAll('#searchResult_List');
            $('#searchResultPanel').slideDown();
        })
        .catch(err => defaultError(err));
}

function get_directory(url, data) { //get Directory
    return $.json_get(url, data).then((res, status, xhr) => {//Success Function
        console.log(xhr.status);
        if (xhr.status === 200) {
            //Get UserList Array
            usrList.clear();
            for (let i = 0; i < res.users.length; i++) {
                usrList.add(res.users[i]);
            }
            usrList.insertAll('#user_List');//Insert All users into the list
            /* Test for now */
        }

    }).catch(e => { //Failure Function
        console.log(e.status);
        let message;
        try {
            message = JSON.parse(e.responseText).message || 'Something error happens';
        } catch (err) {
            message = e.responseText.toString();
        }
        console.log(message);
        defaultError(e.status);
    });
}

function update_view_default() {
    dHint.hide();
}

function update_view_empty() {
    dHint.show();
}

