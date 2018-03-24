require('../../models/db');
const path = require('path');
//const User = require('../../models/user');
//const {dbUsers} = require('../data/user_data');
//const {directory} = require('../../models/esn_directory');

let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;

suite('Image Test', function () {
    let newUser;

    setup(done => {
        done();
    });

    test('Testing upload a VALID File', function (done) {
        console.log("For Debug");

            agent.post(HOST+'/image/upload')
                .attach('logo', path.join(__dirname, "../file/", "testImg0.jpg"))
                .field('extra_info', '{"in":"case you want to send json along with your file"}')
                .end((err, res) => {
                    expect(res.status).to.be(200);
                    //console.log(res.body.imgURL);
                    let imgName = res.body.imgURL.split('-')[1];
                    expect(imgName).to.be("testImg0.jpg");
                    done();
                });
    });

    test('Testing upload a OverSize File', function (done) {

        agent.post(HOST+'/image/upload')
            .attach('logo', path.join(__dirname, "../file/", "testImg_BIGFILE.jpeg"))
            .end((err, res) => {
                expect(res.status).to.be(400);
                console.log(res.body.message);
                expect(res.body.message).to.match(/LIMIT_FILE_SIZE/);
                done();
            });
    });

    test('Testing upload a txt File', function (done) {

        agent.post(HOST+'/image/upload')
            .attach('logo', path.join(__dirname, "../file/", "test_TXTFILE.txt"))
            .end((err, res) => {
                expect(res.status).to.be(400);
                console.log(res.body.message);
                expect(res.body.message).to.match(/NOT_IMAGE_FILE/);
                done();
            });
    });

    test('Testing upload No File', function (done) {

        agent.post(HOST+'/image/upload')
            .send({logo: 'logo'})
            .end((err, res) => {
                expect(res.status).to.be(401);
                console.log(res.body.message);
                expect(res.body.message).to.match(/Can't get File/);
                done();
            });
    });

    test('Testing upload a Valid File and Get File From the Server', function (done) {

        agent.post(HOST+'/image/upload')
            .attach('logo', path.join(__dirname, "../file/", "testImg0.jpg"))
            .field('extra_info', '{"in":"case you want to send json along with your file"}')
            .end((err, res) => {
                expect(res.status).to.be(200);
                let imgURL = res.body.imgURL;
                let imgName = res.body.imgURL.split('-')[1];
                expect(imgName).to.be("testImg0.jpg");
                agent.get(HOST + imgURL)
                    .end((err, res) => {
                        //console.log(res);
                        expect(res.status).to.be(200);
                        done();
                    })
            });
    });

    test('Testing Get Invalid Image (None Exist) From the Server', function (done) {

                let imgName = "testImg0.jpg";
                let imgURL = "/image/" + imgName;

                agent.get(HOST + imgURL)
                    .end((err, res) => {
                        //console.log(res);
                        expect(res.status).to.be(200);
                        //TOBEDONE
                        done();
                    })
    });

});