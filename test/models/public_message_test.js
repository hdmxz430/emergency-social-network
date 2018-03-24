require('../../models/db');
const _ = require('lodash');
const message=require('../../models/message');

let expect = require('expect.js');
let random_flag=Date.now().toString();
suite('Chat public Tests', function () {
    test('Testing adding new message', function (done) {
        // Your assertion statements here

        message.postMessage("this is a test!"+random_flag, "",/*Empty Image*/  "test"+random_flag,"0",1).then(() => {
            expect(1).to.be.ok();
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    test('Testing the history message', function (done) {
        // Your assertion statements here

        message.getlatestMessageList().then(function (messagelist){
            let len=_.size(messagelist)-1;
            expect(messagelist[len].get('content')).to.eql("this is a test!"+random_flag);
            expect(messagelist[len].get('username')).to.eql("test"+random_flag);

            done();
        }).catch(function (err) {
            done(err);
        });
    });

});