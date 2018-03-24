/*global statusString, statusLabel*/
const offline = 0;
const online = 1;

function insertUser(data, loc) {
    console.log(data);
    let user = $('<a href="/chat_private?chatMate='+data.username+'&token='+localStorage.token+'" class="list-group-item"></a>').append('<div class="row"></div>');

    let html = '<div class="row">' +
        '<div class="col-xs-8">' +
            '<span>'+data.username+'</span></div>' +
            '<div class="col-xs-4"><span class="label '+statusLabel[data.user_status]+'">'+statusString[data.user_status]+'</span></div>' +
        '</div>' +
        '</div>';

    user.html(html);
    if(data.online_status === 1){//OnlineUser
        user.attr('class', 'list-group-item list-group-item-success');
    }
    $(loc).append(user);
}

/* For Administration Page */
function admin_insertUser(data, loc){
    let user = $('<a href="/admins/userPage?user_id='+data._id+'&token='+localStorage.token+'" class="list-group-item"></a>');//.append('<div class="row"></div>');

    let row = $('<div class="row"></div>');
    let nameDiv = $('<div class="col-xs-6">' + '<span>'+data.username+'</span></div>');
    let statusDiv = $('<div class="col-xs-4"><span class="label '+statusLabel[data.user_status]+'">'+statusString[data.user_status]+'</span></div>');

    let privilegeDiv = $('<div class="col-xs-2"></div>');
    let privilegeI = $('<i class="fa fa-user-o fa-2x"></i>');
    if(data.privilege == 1)privilegeI.attr('class', 'fa fa-user-o fa-2x');
    else if(data.privilege == 2)privilegeI.attr('class', 'fa fa-user fa-2x');
    else if(data.privilege == 3)privilegeI.attr('class', 'fa fa-user-plus fa-2x');

    nameDiv.appendTo(row);
    privilegeI.appendTo(privilegeDiv);
    privilegeDiv.appendTo(row);
    statusDiv.appendTo(row);
    row.appendTo(user);
    if(data.account_status === 0){
        user.attr('class', 'list-group-item list-group-item-warning');
    }
    else {
        if (data.online_status === 1) {//OnlineUser
            user.attr('class', 'list-group-item list-group-item-success');
        }
    }
    $(loc).append(user);
}

// eslint-disable-next-line no-unused-vars
class Directory {
    constructor() {
        this.userList = [];
    }

    add(user){ //User Object
        this.userList.push(user);
    }

    deleteUser(username) {
        this.userList = this.userList.filter(user => user.username !== username);
    }

    getUserList() {
        return this.userList;
    }

    getUser(username) {
        return this.userList.filter(user => user.username === username);
    }

    updateStatus(username, is_online) {
        this.userList = this.userList.map(user => {
            if (user.username === username) {
                user.status = is_online ? online : offline;
            }
            return user;
        });
    }

    insertAll(loc){
        $(loc).html('');//Empty the #user_list
        for(let i=0; i<this.userList.length;i++){
            insertUser(this.userList[i],loc);
        }
    }

    admin_insertAll(loc){
        $(loc).html('');//Empty the #user_list
        for(let i=0; i<this.userList.length;i++){
            admin_insertUser(this.userList[i],loc);
        }
    }

    clear(){
        this.userList.splice(0,this.userList.length);
    }

    // sort() {
    //     return this.userList.sort((o1, o2) => {
    //         if (o1.online_status && !o2.online_status) //if o1 is Online and o2 is offline
    //             return -1;
    //         if (!o1.online_status && o2.online_status) //
    //             return 1;
    //         if (o1.username < o2.username)
    //             return -1;
    //         return 1;
    //     });
    // }
}
