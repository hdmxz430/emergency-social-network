/*global post_logout*/
$(document).ready(function () {
    $('#gotoChatPublic').click(function(){
        location.href = '/chat_public?token=' + localStorage.token;
    });

    $('#gotoDirectory').click(function(){
        location.href = '/users/directory';//?token=' + localStorage.token;
    });

    $('#gotoUserProfile').click(function(){
        location.href = '/users/profile';
    });

    $('#gotoAnnouncement').click(function(){
        location.href = '/announcement/page';
    });

    $('#gotoDangerousZone').click(function(){
        location.href = '/dangerous_zone';
    });

    $('#gotoShowDangerousZone').click(function(){
        location.href = '/dangerous_zone/goto_show_dangerous_zone';
    });

    $('#gotoPoll').click(function() {
        location.href = '/poll';
    });

    $('#gotoNearby').click(function(){
        location.href = '/nearby';
    });

    $('#logOut').click(function(event){
        event.preventDefault();
        post_logout('/users/auth', { token : localStorage.token});
    });
    $("#sidebar").niceScroll({
        cursorcolor: '#53619d',
        cursorwidth: 4,
        cursorborder: 'none'
    });

    $('#dismiss, .overlay').on('click', function () {
        $('#sidebar').removeClass('active');
        $('.overlay').fadeOut();
    });

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').addClass('active');
        $('.overlay').fadeIn();
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });
});