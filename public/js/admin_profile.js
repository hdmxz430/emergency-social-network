/*global toastr, statusString, defaultError*/
let c_user=null;
$(document).ready(function () {
    let socket = io();
    setAlertHandler(socket);
    c_user=getUrlParameter("user_id");
    data={"user_id":c_user,"token":localStorage.token};
    $.json_get("/admins/user", data).then((res, status, xhr)=>{
        $("#dropdownMenu").text(accountStatus[res.user.account_status]);
        $("#dropdownMenu").append('<span class="caret"></span>');
        $("#privilegeLevelDropDown").text(privilegeLevel[res.user.privilege]);
        $("#privilegeLevelDropDown").append('<span class="caret"></span>');
    });
    $('#account_status_list').on('click', 'li', function () {
        changeAccountStatus($(this).attr('index'));
    });
    $('#privilege_level_list').on('click', 'li', function () {
        changePrivilegeLevel($(this).attr('index'));
    });
    $('#submitUsername').click(function(){
        changeUsername($('#username').val());
    });
    $('#submitPassword').click(function(){
        changePassword($('#password').val());
    });
});

function errorHandler(err){
    console.log(err.responseText);
    defaultError(err.status);
    toastr.warning(err.responseText);
}


function changeUsername(usrname) {

    let data = {new_username: usrname, token: localStorage.token, user_id: c_user, action_num: 1};
    $.json_post('/admins/user', data)
        .then((message) => {
            toastr.success('Username Updated' + usrname);
        })
        .catch(err => {
            //errorHandler(err);
            toastr.warning(err.responseJSON.username);
        });
}

function changePassword(pwd) {
    let hashObj = new jsSHA("SHA-512", "TEXT", {numRounds: 1});
    if(pwd.length < 4){
        toastr.warning('Minimum length for password is 4');
        return;
    }
    hashObj.update(pwd);
    let hash = hashObj.getHash("HEX");
    let data = {new_password: hash, token: localStorage.token, user_id: c_user, action_num: 2};
    $.json_post('/admins/user', data)
        .then((message) => {
            toastr.success('Password Updated');
            $("#password").val('');
        })
        .catch(err => {
            errorHandler(err);
        });
}
function changeAccountStatus(status) {


    let data = {new_account_status: status, token: localStorage.token, user_id: c_user, action_num: 3};
    $.json_post('/admins/user', data)
        .then((message) => {
            toastr.success('Status Updated' + accountStatus[status]);
            $("#dropdownMenu").text(accountStatus[status]);
            $("#dropdownMenu").append('<span class="caret"></span>');
        })
        .catch(err => {
            errorHandler(err);
        });
}


function changePrivilegeLevel(status) {

    let data = {new_privilege: status, token: localStorage.token, user_id: c_user, action_num: 4};
    $.json_post('/admins/user', data)
        .then((message) => {
            toastr.success('Status Updated' + privilegeLevel[status]);
            $("#privilegeLevelDropDown").text(privilegeLevel[status]);
            $("#privilegeLevelDropDown").append('<span class="caret"></span>');
        })
        .catch(err => {
            errorHandler(err);
        });
}
