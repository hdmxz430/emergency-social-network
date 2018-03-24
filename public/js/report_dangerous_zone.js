/* eslint-disable no-undef */
$(document).ready(function () {
    let socket = io();
    let now_user = JSON.parse(localStorage.user).username;

    setAlertHandler(socket);
    $('#reportIncident').click(function(){
        let lat = $('#latitude').text();
        let lng = $('#longitude').text();
        let des = $('#description').val();
        if(des === ''){
            toastr.error('Please enter description');
        }

        else{
            let data = {
                lat: lat,
                lng: lng,
                des: des,
                sender: now_user
            };
        
            $.ajax({
                url: '/dangerous_zone/save_dangerous_zone',
                type: 'post',
                data: data,
                success: function(data, status){
                    if(status === 'success'){
                        //alert('you have successfully post a dangerous zone');
                        toastr.success('post dangerous zone successfully');
                    }
                },
                error: function(data, err){
                    //alert('there is a report around you, you do not have to report it again');
                    toastr.error('there is a report around you, you do not have to report it again');
                }
            });
        
        }
       
    })
});