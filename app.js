const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
/* ImageUC */
const multer = require('multer');




require('./models/db');

const index = require('./routes/index_route');
const wall=require('./routes/chat_public_route');
const announcement = require('./routes/announcement_route');
const privateChat = require('./routes/chat_private_route');
const searchInfo = require('./routes/search_info');
const admin = require('./routes/admin_route');
const dangerousZone = require('./routes/dangerous_zone_route');
const poll = require('./routes/poll_route');
const nearby = require('./routes/nearby_route');
const image = require('./routes/image_route');


let app = express();
let server = http.Server(app);
let io = socketIO(server);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', '/images/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//route
app.use('/', index);
app.use('/chat_public',wall);
app.use('/announcement', announcement);
app.use('/chat_private', privateChat);
app.use('/search_info', searchInfo);
app.use('/nearby', nearby);
app.use('/admins', admin);
app.use('/dangerous_zone', dangerousZone);
app.use('/poll', poll);
app.use('/image', image);

let nsp = io.of('/directory');

/* ImageU&C */
/* Set Location of the Uploaded Files */
//let upload = multer({ dest: './upload/' });
/* Use 'storage' to self define the Uploaded file path and File Name */
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'/upload/'));    // The Saving Folder(Path)
    },
    filename: function (req, file, cb) {
        // Set the storage Name of the File
        // Here is 'timeStap + Original Name
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

/* FILE SIZE LIMITS = 10M = 10 X 1024 X 1024 BYTES */
let upload = multer({ storage: storage, limits:{fileSize: 10485760},fileFilter:fileFilter }).single('logo');

/* Limit the Uploaded File to be Image Only */
function fileFilter(req, file, cb){
    const extension = file.mimetype.split('/')[0];
    if(extension !== 'image'){
        return cb(new Error( "The file is not image type File"), false);
    }
    cb(null, true);
};



server.listen(process.env.PORT, () => {
    console.log('Here in app.js listen on: ' + process.env.PORT);
});

module.exports = {
    io,
    nsp,
    app,
    upload
};
