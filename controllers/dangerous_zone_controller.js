const DangerousZone = require('../models/dangerous_zone');
const moment = require("moment");
const User = require('../models/user');
const dis = require('./distance');


//let twoMiles = 1609;

let twoMiles = mileToMeters(2);
//let twoHours = hourToTimestamp(2);
let smallHours = hourToTimestamp(1/60);
//let halfMiles = mileToMeters(0.5);
let smallMiles = mileToMeters(0.0001);

function mileToMeters(mile){
    return mile * 1609.34;
}

function hourToTimestamp(hour){
    return hour * 3600000;
}

let gotoDangerousZone = (req, res) => {
    res.render('dangerous_zone');
};

let gotoShowDangerousZone = (req, res) => {
    res.render('show_dangerous_zone');
};

let reportDangerousZone = (req, res) => {
    let lat = req.query.lat;
    let lng = req.query.lng;
    res.render('report_dangerous_zone', {lat: lat, lng: lng});
};

let getDangerousZoneAround = (req, res) => {
    let lat = req.query.lat;
    let lng = req.query.lng;
    let timestamp = moment.now().valueOf();
    console.log('timestamp type is:' + typeof(timestamp));
    DangerousZone.getAllDangerousZone().then((dangerousZoneList) => {
        console.log('list is:' + dangerousZoneList);
        let aroundList = new Array();
        let index = 0;
        for(let i = 0; i < dangerousZoneList.length; i++){
            let distance = dis.getFlatternDistance(parseFloat(lat), parseFloat(lng), parseFloat(dangerousZoneList[i].lat), parseFloat(dangerousZoneList[i].lng));
            console.log('distance is:' + distance);
            console.log('saved type is:' + typeof(dangerousZoneList[i].timestamp));
            let timeDiff = timestamp - dangerousZoneList[i].timestamp;
            console.log('timeDiff is:' + timeDiff);
            if(distance < twoMiles && timestamp - dangerousZoneList[i].timestamp < smallHours){
                let thisDangerousZone = {lat: dangerousZoneList[i].lat, lng: dangerousZoneList[i].lng, description: dangerousZoneList[i].description};
                aroundList[index] = thisDangerousZone;
                index++;
            }
        }
        return aroundList;
    }).catch((err) => {
        console.log(err);
    }).then((around) => {
        res.send({status: 200, aroundDangerousList: around});
    });
};

let saveDangerousZone = (req, res) => {
    let lat = req.body.lat;
    let lng = req.body.lng;
    let description = req.body.des;
    let sender = req.body.sender;
    let timestamp = moment.now().valueOf();
    const io = require('../app').io;
    DangerousZone.getAllDangerousZone().then((dangerousZoneList) => {
        console.log('list is:' + dangerousZoneList);
        let i;
        for(i = 0; i < dangerousZoneList.length; i++){
            let distance = dis.getFlatternDistance(parseFloat(lat), parseFloat(lng), parseFloat(dangerousZoneList[i].lat), parseFloat(dangerousZoneList[i].lng));
            console.log('distance=' + distance);
            if(distance < smallMiles){
                break;
            }
        }
        if(i == dangerousZoneList.length){
            return 1;
        }
        else{
            return -1;
        }
    }).catch((err) => {
        console.log(err);
    }).then((result) => {
        if(result == 1){
            DangerousZone.saveDangerousZone(lat, lng, description, timestamp);
            User.getAllowWarnList(lat, lng).then((userList) => {
                io.emit('broadcast dangerous', {sender: sender, included: userList});
            });
            res.status(200).send({status: 200});
        }
        else{
            res.status(400).send({status: 400});
        }
    });
};

module.exports = {gotoDangerousZone, gotoShowDangerousZone, reportDangerousZone, saveDangerousZone, getDangerousZoneAround};
