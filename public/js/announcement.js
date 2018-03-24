/*global io, Announcement*/
let announcement;
let dHint;
let dSearchPager;

$(document).ready(function () {
    let socket = io();
    announcement = new Announcement('announcement_panel');
    let user = JSON.parse(localStorage.user);
    setAlertHandler(socket);

    dHint = $('#hint_message');
    dSearchPager = $('#search_pager');
    let dPrev = $('#pager_prev');
    let dNext = $('#pager_next');

    if (user.privilege >= CUser.PRIVILEGE_COORDINATOR){
        $('#write_ann').show();
    }
    // get the current posted announcements
    announcement.registerPostAnnouncement(socket, () => {
        update_view_default();
    });

    updateAnnouncements();

    $('#send').click(() => {
        let dText = $('#content_text');
        let content = dText.val();
        //keep the content format
        content = content.replace(/\r?\n/g, '<br />');
        announcement.post({
            token: localStorage.token,
            sender: user.username,
            content: content
        }, () => dText.val(''));
    });

    //search
    let page = 0;
    const perpage = 10;
    let currentSearchTerm = "";

    $('#btn_search').click(() => {
        page = 0;
        inSearchMode = true;
        currentSearchTerm = $('#searchwords').val();
        if (currentSearchTerm !== '') {
            announcement.save();
            search(currentSearchTerm, page, (announcements) => {
                if (!announcements || announcements.length < perpage)
                    canNext = false;
            });
        } else {
            // user elects to cancel search
            updateAnnouncements();
        }
    });

    let canPrev = false;
    let canNext = true;
    let inSearchMode = false;

    dPrev.click(() => {
        if (!canPrev) {
            return;
        }

        page -= 1;
        search(currentSearchTerm, page,
            () => {
                if (page <= 0) {
                    canPrev = false;
                }
                canNext = true;
            });
    });

    dNext.click(() => {
        if (!canNext) {
            return;
        }
        page += 1;
        search(currentSearchTerm, page,
            (announcements) => {
                if (!announcements || announcements.length !== perpage) {
                    dNext.addClass('disabled');
                    canNext = false;
                }
                if (page === 1) {
                    dPrev.removeClass('disabled');
                    canPrev = true;
                }
            });
    });


    $('#content_text').on('focus', () => {
        if (inSearchMode) {
            $('#searchwords').val('');
            update_view_default();
            page = 0;
            canPrev = false;
            canNext = true;
            inSearchMode = false;
            let backup = announcement.restore();
            announcement.update(backup);
        }
    });
});


function updateAnnouncements() {
    announcement.get(
        (ann) => {
            announcement.update(ann);
            update_view_default();
        }, // handle data
        () => {
            update_view_empty();
        } // handle empty
    );
}

function search(searchTerms, page, callback) {
    announcement.search({announcement: searchTerms, page},
        (announcements) => {
            announcement.update(announcements);
            console.log("Updated");
            console.log(announcements);
            update_view_search(false);
            if (callback)
                callback(announcements);
        }, () => {
            update_view_search(true);
            if (callback)
                callback();
        });
}

function update_view_default() {
    dSearchPager.hide();
    dHint.hide();
}

function update_view_search(is_empty) {
    if (is_empty) {
        announcement.update([]);
        dHint.text('There is no result');
        dHint.show();
    } else {
        dHint.hide();
    }
    dSearchPager.show();
}

function update_view_empty() {
    dHint.text('This is no announcement now');
    dHint.show();
    dSearchPager.hide();
}