/* eslint-disable no-undef */
let userList = new Directory();
let socket = io(); //connect to our Socket.IO server

$(document).ready(function () {
    get_All_Users("/admins/users", {token: localStorage.token});
    setAlertHandler(socket);
    socket.on('update_admin', function (data) {
        userList.clear();
        console.log(data);
        for (let i = 0; i < data.all_users.length; i++) {
            userList.add(data.all_users[i]);
        }
        userList.admin_insertAll('#user_List');//Insert All users into the list
    });
});

function get_All_Users(url, data) { //get User Directory (Including Inactive Users)
    return $.json_get(url, data).then((res, status, xhr) => {//Success Function
        console.log(xhr.status);
        if (xhr.status === 200) {
            //Get UserList Array
            userList.clear();
            for (let i = 0; i < res.users.length; i++) {
                console.log(res.users[i]);
                userList.add(res.users[i]);
            }
            userList.admin_insertAll('#user_List');//Insert All users into the list
        }

    }).catch(e => { //Failure Function
        defaultError(e.status);
    });
}
