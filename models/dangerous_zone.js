const mongoose= require('mongoose');


let DangerousZoneSchema = new mongoose.Schema({
    lat: {
        type: String,
        required: true
    },
    lng: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true,
        trim: true
    }
});

class DangerousZone{
    constructor(){
        this.DangerousZoneModel = mongoose.model('DangerousZone', DangerousZoneSchema);
    }

    getAllDangerousZone(){
        return this.DangerousZoneModel.find();
        /*
        return this.DangerousZoneModel.find((dangerousZoneList) => {
            return dangerousZoneList;
        });
        */
    }
    
    saveDangerousZone(lat, lng, description, timestamp){
        let newDangerousZone = new this.DangerousZoneModel({lat, lng, description, timestamp});
        return newDangerousZone.save();
    }

    clear(){
        return this.DangerousZoneModel.remove();
    }
}

let DangerousZoneInstance = new DangerousZone();
module.exports = DangerousZoneInstance;