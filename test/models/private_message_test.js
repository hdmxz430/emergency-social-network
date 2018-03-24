require('../../models/db');
const _ = require('lodash');
const message=require('../../models/private_message');
const moment=require("moment");
let expect = require('expect.js');
let random_flag=Date.now().toString();
suite('Chat private Tests', function () {
    test('Testing adding new message', function (done) {
        // Your assertion statements here
        message.postMessage("tester1", "tester2", "test msg"+random_flag, moment.now().valueOf(), 1).then(() => {
            expect(1).to.be.ok();
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    test('Testing the history message with correct query', done => {
        // Your assertion statements here
        message.getHistoryMessageList("tester1","tester2").then(messagelist => {
            let len=_.size(messagelist)-1;
            expect(messagelist[len].get('content')).to.eql("test msg"+random_flag);
            expect(messagelist[len].get('sender_status')).to.eql(1);
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    test('Testing the history message with bad query', done => {
        // Your assertion statements here
        message.getHistoryMessageList("tester1","tester"+random_flag).then(msg_list => {
            expect(_.size(msg_list)).to.be(0);
            done();
        }).catch(function (err) {
            done(err);
        });
    });
});