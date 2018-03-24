/*global validate,jsSHA*/
let option = 0; //Not Safe, just For Now
let usrName, usrPsw;
let usrConstraint = {
    presence: true,
    length: {
        minimum: 3,
        message: "must be at least 3 characters"
    }
};

let pwdConstraint = {
    presence: true,
    length: {
        minimum: 4,
        message: "must be at least 4 characters"
    }
};

$(document).ready(function () {/*make sure the DOM has finished loading the HTML content before we can reliably use jQuery.*/
    $('#status').html('Connected to Server');
    $('#login').click(() => {
        usrName = $('#user_name').val();
        usrPsw = $('#user_psw').val();
        let constraints = {
            usrName: usrConstraint,
            usrPsw: pwdConstraint
        };
        let valiRes = validate({usrName, usrPsw}, constraints);
        if (reservedUserName.has(usrName)) {
            $('#name_feedback').html('Reserved UserName');
        }
        else if (!valiRes) {
            $('#name_feedback').html('');
            $('#password_feedback').html('');
            let hashObj = new jsSHA("SHA-512", "TEXT", {numRounds: 1});
            hashObj.update(usrPsw);
            let hash = hashObj.getHash("HEX");
            post_log('/users/auth', {username: usrName, password: hash});
        } else {
            if (valiRes.usrName) {
                $('#name_feedback').html(valiRes.usrName.join('<br/>'));
                $('#password_feedback').html('');
            }
            if (valiRes.usrPsw) {
                $('#password_feedback').html(valiRes.usrPsw.join('<br/>'));
                $('#name_feedback').html('');
            }
        }
    });

    $('#infoBoard').on('click', 'button', function (event) {
        event.preventDefault();
        if ($(this).attr('id') == '_cancel') {
            //alert('Cancel is clicked');
            let infoBoard = $(this).closest('#infoBoard');
            infoBoard.find('#tron').html('');
            infoBoard.find('#description').html('');
            infoBoard.find('#statusList').html('');
            infoBoard.find('#commonInfo').html('');
            infoBoard.slideUp();
            $('#login_form').show();
        }
        else if ($(this).attr('id') == '_confirm') {
            if (option === 2) {
                window.location.href = './users/directory';//?token='+localStorage.token;
            }
            else if (option === 1) {
                let hashObj = new jsSHA("SHA-512", "TEXT", {numRounds: 1});
                hashObj.update(usrPsw);
                let hash = hashObj.getHash("HEX");
                post_register('/users/auth', {username: usrName, password: hash});
            }
        }
    });

    //The Eye Icon
    $('#pswVisible').on('click', function (event) {
        event.preventDefault();
        if ($(this).attr('class') === 'glyphicon glyphicon-eye-close feature-i') {
            $('#user_psw').attr('type', 'text');
            $(this).attr('class', 'glyphicon glyphicon-eye-open feature-i');
        }
        else {
            $('#user_psw').attr('type', 'password');
            $(this).attr('class', 'glyphicon glyphicon-eye-close feature-i');
        }
    });
});

function post_register(url, data) {
    return $.json_post(url, data).then((res, status, xhr) => {//Success Function
        if (xhr.status === 200) {
            const infoBoard = $('#infoBoard');
            infoBoard.slideDown();
            $('#login_form').hide();
            let description = "<li style='background: #00ff00'>OK: I am OK, I do not need help</li>"
                + "<li style='background: #fff012'>Help: Need help, but not life threatening.</li>"
                + "<li style='background: #ff0000'>Emergency: Need help now! Life threatening emergency!\n</li>"
                + "<li style='background: #8c8f93'>Undefined: Status unprovided yet.\n</li>";
            infoBoard.find('#statusList').html(description);
            infoBoard.find('#tron').html('Welcome!');
            infoBoard.find('#description').html('Our system proposes a set of statuses to select from:');
            infoBoard.find('#commonInfo').html('Proceed to User Directory Now?');
            option = 2; //
            localStorage.token = res.token;
            localStorage.user = JSON.stringify(res.user);
        }
    }).catch(e => { //Failure Function
        console.log(e.status);
        if (e.status === 400) {
            alert('Unknow Error!');
        }
    });
}

function post_log(url, data) {
    return $.json_get(url, data).then((res, status, xhr) => {//Success Function
        const infoBoard = $('#infoBoard');
        if (xhr.status === 200) {
            infoBoard.find('#commonInfo').html('Proceed to User Directory Now?');
            option = 2;
            localStorage.token = res.token;
            localStorage.user = JSON.stringify(res.user);
        }
        else if (xhr.status === 201) { /*No Such User Name, Ask if Register*/
            infoBoard.find('#commonInfo').html('Would you like to register a new user ?');
            option = 1;
        }
        infoBoard.slideDown();
        $('#login_form').hide();
    }).catch(e => { //Failure Function
        console.log(e.responseJSON.message);
        console.log(e.status);
        if (e.status === 401) {/* Wrong Psw */
            $('#password_feedback').html(e.responseJSON.message);
        } else if (e.status === 400) {/* UserName or PassWord are Invalid */
        }
    });
}

