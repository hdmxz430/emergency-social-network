/* eslint-disable no-undef */
let currentUser = JSON.parse(localStorage.user);
let group = JSON.parse(localStorage.nearby_group);
let dExit = $('#exit_btn');

const badgeColors = {
    0: 'bg-grey', // undefined
    1: 'bg-green', //OK
    2: 'bg-orange', //help
    3: 'bg-red' // emergency
};

const NowMessage = {
    left: {
        msg: '',
        name: 'direct-chat-name pull-left',
        badge: 'pull-left',
        timestamp: 'direct-chat-timestamp pull-right',
        avatar: 'fa-user-circle'
    },
    right: {
        msg: 'right',
        name: 'direct-chat-name pull-right',
        badge: 'pull-right',
        timestamp: 'direct-chat-timestamp pull-left',
        avatar: 'fa-user-circle-o'
    }
};

$(document).ready(function () {
    update_user_list(group.members);
    /* Clear File Input */
    fileInputClear($('#file'));

    let socket = io();

    if (currentUser.username !== group.initialUser) {
        dExit.hide();
    }

    let alert_message = new AlertMessage('contain');
    alert_message.alertMessage(socket, currentUser, 'contain');

    if (group.initialUser === currentUser.username && currentUser.user_status !== 3) {
        $.json_put('/users/status', {token: localStorage.token, user_status: 3})
            .then(() => console.log("Update Successfully"))
            .catch(err => defaultError(err.status));
    }

    $.json_get('/nearby/messages', {token: localStorage.token, group_id: "" + localStorage.nearby_group_id})
        .then(data => {
            $('#m').val('');
            let list = data.messages;
            for (let i = 0; i < list.length; i++) {
                generateMessageHtml(list[i], currentUser.username);
                document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
            }
        })
        .catch(err => {
            defaultError(err.status);
        });

    $('#cancelIMG').on('click', function (event) {
        event.preventDefault();
        /* Clear and Hide */
        fileInputClear($('#file'));
        $('#previewDiv').slideUp();
    });

    $('#submit').click(send);

    socket.on(localStorage.nearby_group_id, function (msg) {
        generateMessageHtml(msg, currentUser.username);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
    });

    socket.on(localStorage.nearby_group_id + 'disconnected', function () {
        toastr.info('The initial user dismiss the group');
        setTimeout(() => {
            clear();
            window.location.href = '/users/directory';
        }, 2000);
    });
});

function update_user_list(users) {
    let html = '';
    users.forEach(username => {
        html += '<li class=\'list-group-item\'> ' + username + '</li>';
    });
    $('#user_list').html(html);
}

function confirmToDismiss() {
    $.json_delete('/nearby/groups', {token: localStorage.token, group_id: localStorage.nearby_group_id})
        .then(() => {
            clear();
            window.location.href = '/users/directory';
        })
        .catch(err => {
            clear();
            defaultError(err.status);
        });
}

function clear() {
    localStorage.nearby_users = null;
    localStorage.nearby_groups = null;
    localStorage.nearby_group_id = null;
}

function send() {
    let content = $('#m').val();
    if ((content === '') && ($('#file')[0].files[0] === undefined)) {
        return;
    }

    console.log("Submit" + content);
    let data = {
        token: localStorage.token,
        group_id: localStorage.nearby_group_id,
        content: content
    };

    if($('#file')[0].files[0] !== undefined){
        postImageMessage(data, postMessage);
    }
    else {
        postMessage(data);
    }
}

function postMessage(data) {
    $.json_post('/nearby/messages', data).then(() => {
        $('#m').val('');
    }).catch(err => {
        defaultError(err.status);
    });
}

function postImageMessage(data, successCallback){
    let formData = new FormData();

    let file = $('#file')[0].files[0];
    /* CLEAR WORK */
    fileInputClear($('#file'));
    $('#previewDiv').hide();
    if(file.type.split('/')[0] != 'image'){
        console.log("Not an Image File");
        attachWarning("Not an Image File");
        return;
    }
    let reader = new FileReader();
    let compressedDataURL;

    reader.onload = function (e) {
        let dataURL = e.target.result,
            imagePreview = $('#preview').get(0), // Turn a jQuery object to a pure Canvas element.
            img = new Image();

        img.onload = function() {
            /* Compress The Image */
            compressedDataURL = compress(img, imagePreview);

            let bob = dataURLtoBlob(compressedDataURL);
            bob.name = file.name+"BLOB";
            console.log("Send Blob File:");
            console.log(bob);
            formData.append('logo', bob);
            $.ajax({
                url: '/image/upload',
                type: 'POST',
                cache: false,
                data: formData,
                processData: false,
                contentType: false
            }).done(function(res) {
                console.log(res.imgURL);
                console.log("Success");
                /* Now Post The Message */
                data.image = res.imgURL;
                successCallback(data);

            }).fail(function(res) {
                console.log(res.message);
                attachWarning(res.message);
            });
        };

        img.src = dataURL;

    };

    reader.readAsDataURL(file);
}

function generateMessageHtml(message, currentUser) {
    // console.log("Generate Message Html", message, currentUser);
    let imgURL = message.image;
    let direction = NowMessage[message.username === currentUser ? 'right' : 'left'];
    let html = '<div class="direct-chat-msg ' + direction.msg + '">';
    html += '<div class="direct-chat-info clearfix">';
    html += '<div class="' + direction.name + '">&nbsp;' + message.username + '&nbsp;</div>';
    html += '<span class="badge ' + badgeColors[message.user_status] + ' ' + direction.badge + '" data-toggle="tooltip">' + statusString[message.user_status] + '</span>';
    html += '<span class="' + direction.timestamp + '">' + moment(message.timeOut).format('MMM Do YYYY, h:mm') + '</span>';
    html += '</div>';
    html += '<i class="fa ' + direction.avatar + ' fa-3x direct-chat-img text-aqua"/>';
    html += '<div class="direct-chat-text">' + message.content + '</div>';

    if((imgURL !== "") && (imgURL !== undefined)){
        let imageI = '<img id="testimg" src=' + imgURL + '>';
        html += imageI;
        $('#chatMessages').append(html);

    }
    else{
        $('#chatMessages').append(html);
    }
}

/* Attach Warning Message */
function attachWarning(msg){
    //let div0 = '<div class="alert alert-warning alert-dismissible" role="alert">';
    let b1 =
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
    let warning = '<strong>' + msg + '</strong>';
    let div0 = '<div class="alert alert-warning alert-dismissible" role="alert">' + b1 + warning +'</div>';
    $('#warningDiv').append(div0);
}