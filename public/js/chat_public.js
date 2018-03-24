/*global io, AlertMessage, defaultError, moment, statusString*/
let imgLoadingFlag = 0;
$(document).ready(function () {
    //For Debug

    fileInputClear($('#file'));
    console.log($('#file')[0].files[0]);
    let socket = io();
    let now_user = JSON.parse(localStorage.user).username;
    let page = 0;
    imgLoadingFlag = 0;

    setAlertHandler(socket);

    $.json_get('/chat_public/messages', {token: localStorage.token})
        .then(data => {
            $('#m').val('');
            let list = data.latestMessage;
            for (let i = 0; i < list.length; i++) {
                //let divAll = generateMessageHtml(list[i]);
                generateMessageHtml(list[i]);
                //$('#chatMessages').append(divAll);
                document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
            }
        })
        .catch(err => {
            defaultError(err.status);
        });

    function searchPubMessage(message, page, click_by) {
        $.json_get('/search_info/search_by_public_message', {message: message, page: page})
            .then(data => {
                let list = data.message;
                if (list.length == 0) {
                    if (click_by == 'search') {
                        $('#searchBox').hide();
                    } else {
                        $('#see_more').text('no more');
                    }
                } else {
                    for (let i = 0; i < list.length; i++) {
                        let divAll = generateMessageHtml(list[i]);
                        $('#searchPubMessages').append(divAll);
                    }
                    $('#searchBox').slideDown();
                }
            }).catch(err => defaultError(err.status));
    }

    $('#cancelIMG').on('click', function (event) {
        event.preventDefault();
        /* Clear and Hide */
        fileInputClear($('#file'));
        $('#previewDiv').slideUp();
    });

    $('#search').click(function () {
        $('#searchPubMessages').empty();
        $('#see_more').text('see more...');
        page = 0;
        let search_words = $('#searchwords').val();
        searchPubMessage(search_words, page, 'search');
    });

    $('#see_more').click(function () {
        page = page + 1;
        let search_words = $('#searchwords').val();
        searchPubMessage(search_words, page, 'see_more');
    });
    // post new message
    $('#submit').click(function () {
        let user_status = JSON.parse(localStorage.user).user_status;
        let content = $('#m').val();
        if ((content === '') && ($('#file')[0].files[0] === undefined)) {
            return;
        }

        let data = {
            token: localStorage.token,
            username: now_user,
            user_status: user_status,
            content: content
        };
        if($('#file')[0].files[0] !== undefined){
            postImageMessage(data)
        }
        else {
            $.json_post('/chat_public/messages', data)
                .then(() => {
                    $('#m').val('');
                }).catch(err => {
                defaultError(err.status);
            });
        }
    });

    socket.on('message posted', function (msg) {
        console.log("Get Socket! ")
        console.log(msg);
        divAll = generateMessageHtml(msg);
        // $('#chatMessages').append(divAll);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
    });
});


function postImageMessage(data){
    let formData = new FormData();

    let file = $('#file')[0].files[0];
    /* CLEAR WORK */
    fileInputClear($('#file'));
    $('#previewDiv').hide();
    if(file.type.split('/')[0] != 'image'){
        console.log("Not an Image File");
        // $('#warningDiv').show();
        // $('#warningDiv').find('strong').text("Not an Image File");
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
                $.json_post('/chat_public/messages', data).then((res, status, xhr) => {
                    $('#m').val('');
                    console.log("Post Success");
                    console.log(res);
                }).catch(err => {
                    defaultError(err.status);
                });


            }).fail(function(res) {
                console.log(res.message);
                attachWarning(res.message);
            });
        };

        img.src = dataURL;

    };

    reader.readAsDataURL(file);

}

function generateMessageHtml(msg) {
    let userName = msg.username;
    let status = msg.user_status;
    let sendMessage = msg.content;
    let currentTime = moment(msg.timestamp).format('MMMM Do YYYY, h:mm');
    let userStatus = statusString[status];
    let imgURL = msg.image;

    let spanUser = '<span class="direct-chat-name pull-left">' + userName + '</span>';
    let spanTime = '<span class="direct-chat-timestamp pull-right">' + currentTime + '</span>';
    let spanStatus = '<span class="direct-chat-status" style="margin-left:10px">' + userStatus + '</span>';
    let divUserAndTime = '<div class="direct-chat-info clearfix">' + spanUser + spanTime + spanStatus + '</div>';
    let divSubMessage = '<div style="background: #000 color: #FFF">' + sendMessage + '</div>';
    let divMessage = '<div id="addMessage" class="direct chat-text text-right">' + divSubMessage + '</div>';
     console.log("New Message Time:"+sendMessage+"|"+currentTime+" The Flag: "+imgLoadingFlag);

    if((imgURL !== "") && (imgURL !== undefined)){

        let imageI = '<img id="testimg" src=' + imgURL + '>';
        let divAll = '<div class="direct-chat-msg wordwrap">' + divUserAndTime + divMessage + imageI + '</div>';
        $('#chatMessages').append(divAll);

    }
    else{
        let divAll = '<div class="direct-chat-msg wordwrap">' + divUserAndTime + divMessage  + '</div>';
        $('#chatMessages').append(divAll);
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