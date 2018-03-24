/*global io, defaultError, statusString, moment*/
$(document).ready(function () {
    let socket = io();
    let now_user = JSON.parse(localStorage.user).username;
    let page = 0;

    setAlertHandler(socket);
    
    function GetQueryString(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r !== null) return unescape(r[2]);
        return '';
    }

    let chatMate = GetQueryString("chatMate");
    let para = (now_user > chatMate) ? (now_user + chatMate) : (chatMate + now_user);

    socket.on('notify receiver' + now_user, function (msg) {
        let sender = msg.sender;
        if (sender !== chatMate) {
            let aPop = '<a href="#" class="close" data-dismiss="alert" aria-label="close" title="close">' + 'x' + '</a>';
            let privateUrl = '/chat_private?chatMate=' + sender + "&token=" + localStorage.token;
            let text = "<a href='" + privateUrl + "'>" + "a new message" + "</a>";
            let divPop = '<div class="alert alert-info" id="popmessage">' + aPop + text + '</div>';
            $('#contain').append(divPop);
        }
    });

    $.json_get('/chat_private/messages', {
        user1: now_user,
        user2: chatMate,
        token: localStorage.token
    }).then(data => {
        $('#m').val('');
        let list = data.historyMessage;
        for (let i = 0; i < list.length; i++) {
            let divAll = generateMessageHtml(list[i]);
            $('#chatMessages').append(divAll);
            document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
        }
    }).catch(err => {
        defaultError(err.status);
    });

    $('#submit').click(function () {
        let messageDom = $('#m');
        let user_status = JSON.parse(localStorage.user).user_status;
        let message = messageDom.val();
        let data = {
            token: localStorage.token,
            sender: now_user,
            receiver: chatMate,
            sender_status: user_status,
            content: message
        };
        $.json_post('/chat_private/messages', data)
            .then(() => messageDom.val(''))
            .catch(err => {
                defaultError(err.status);
            });
    });

    socket.on('message posted' + para, function (msg) {
        let divAll = generateMessageHtml(msg);
        $('#chatMessages').append(divAll);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
    });

    function searchPriMessage(message, page, click_by, currentUser) {
        $.json_get('/search_info/search_by_private_message', {
            message: message,
            page: page,
            current_user: currentUser,
            chat_mate: chatMate
        }).then(data => {
            let list = data.message;
            if (list.length === 0) {
                if (click_by === 'search') {
                    $('#searchBox').hide();
                } else {
                    $('#see_more').text('no more');
                }
            } else {
                update_view(list);
            }
        }).catch(err => {
            defaultError(err.status);
        });
    }

    function update_view(list) {
        for (let i = 0; i < list.length; i++) {
            let divAll = generateMessageHtml(list[i]);
            $('#searchPubMessages').append(divAll);
        }
        $('#searchBox').slideDown();
    }

    $('#search').click(function () {
        $('#searchPubMessages').empty();
        $('#see_more').text('see more...');
        page = 0;
        let search_words = $('#searchwords').val();
        searchPriMessage(search_words, page, 'search', now_user);
    });

    $('#see_more').click(function () {
        page = page + 1;
        let search_words = $('#searchwords').val();
        searchPriMessage(search_words, page, 'see_more', now_user);
    });


});

function generateMessageHtml(msg) {
    let userName = msg.sender;
    let status = msg.sender_status;
    let sendMessage = msg.content;
    let currentTime = moment(msg.timestamp).format('MMMM Do YYYY, h:mm');
    let userStatus = statusString[status];

    let spanUser = '<span class="direct-chat-name pull-left">' + userName + '</span>';
    let spanTime = '<span class="direct-chat-timestamp pull-right">' + currentTime + '</span>';
    let spanStatus = '<span class="direct-chat-status" style="margin-left:10px">' + userStatus + '</span>';
    let divUserAndTime = '<div class="direct-chat-info clearfix">' + spanUser + spanTime + spanStatus + '</div>';
    let divSubMessage = '<div style="background: #000 color: #FFF">' + sendMessage + '</div>';
    let divMessage = '<div id="addMessage" class="direct chat-text text-right">' + divSubMessage + '</div>';
    return '<div class="direct-chat-msg wordwrap">' + divUserAndTime + divMessage + '</div>';
}