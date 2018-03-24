

GET /poll/list
parameters: token

return polllist(200)
    A list of sorted poll
ERROR 401:
    token auth failed




GET /poll/polldetail
parameters: token, id (poll id)
return poll(200)
    A object contains everything about a poll
ERROR 401:
    token auth failed


Post /poll
payload: username,pollname,description,option,expire(Expiration time),token
On success: 201
ERROR 401:
    token auth failed
      400:
    check error message

Post /poll/vote
payload: username,id(poll id),option(index of the option),token
On success: 200
ERROR 401:
    token auth failed
      400:
    check error message
    
Post /dangerous_zone/save_dangerous_zone
payload: lat, lng, des, sender, token
On success: 200
ERROR 400:
    dangerous zone already exist message
ERROR 401:
    token auth failed
    
Get /dangerous_zone/show_dangerous_zone
parameters: lat, lng
return aroundList(200)
    A list containing all the dangerous zones around.  
ERROR 401:
    token auth failed

GET /admins/users
payload: token
return Userlist(200)
    A list containing all using, include inactive user
ERROR 401:
    token auth failed,are you the admin?

GET /admins/user
payload: token user_id(ObjectID)
return User(200)
    An user object contain all information of the user
ERROR 401:
    token auth failed,are you the admin?

POST /admins/user
payload: token action_num user_id (new_username|new_password|new_account_status|new_privilege)
On success: User updated successfully! (200)
ERROR 401:
    token auth failed, are you the admin?