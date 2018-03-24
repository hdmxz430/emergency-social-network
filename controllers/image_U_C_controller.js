const fs = require("fs");
const path = require('path');
//
// let showUploadDialog = (req, res) => {
//     res.render('imageUpload');
// };

let postImageMessage = (req, res) => {
    // Single Picture Upload
    console.log('In Image Upload')
    /* Error Handling */
    const upload = require('../app').upload;
    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            console.log("Error occurred when uploading");
            console.log(err);
            if(err.code !== undefined){
                return res.status(400).send({message: err.code});
            }
            return res.status(400).send({message: "NOT_IMAGE_FILE"});
        }

        // Everything went fine
        // Here 'upload.array('logo', 2) means supporting 2 photos being uploaded at the same time
        /*
        A multer file object is a JSON object with the following properties.

            1.fieldname - Field name specified in the form
            2.originalname - Name of the file on the user's computer
            3.name - Renamed file name
            4.encoding - Encoding type of the file
            5.mimetype - Mime type of the file
            6.***path - Location of the uploaded file***
            7.extension - Extension of the file
            8. size - Size of the file in bytes
            9.truncated - If the file was truncated due to size limitation
            10.buffer - Raw data (is null unless the inMemory option is true)
         */
        console.log(req.file);
        console.log(req.body);
        let file = req.file;

        if(req.file === undefined){
            return res.status(401).send({message: "Can't get File"});
        }

        console.log('Mime Type：%s', file.mimetype);
        console.log('Original File Name：%s', file.originalname);
        console.log('Original FieldName：%s', file.fieldname);
        console.log('File Size：%s', file.size);
        console.log('Location of the File：%s', file.path);
        console.log(file);

        /* Send Back The File URL */
        let imgURL = "/image/" + file.filename;


        console.log("Done!");
        res.status(200).send({ret_code: '0', imgURL: imgURL});
    });
};

let getImage = (req, res) => {
    /* Get the Image Path Under 'upload' Folder */
    let filePath = path.join(__dirname, "../upload", req.params.filename);
    console.log("GetImage: "+filePath);
    /*
        Test whether or not the given path exists
        by checking with the file system.
        Then call the callback argument with either true or false.
     */
    fs.exists(filePath, function(exists){
        /* If Image Exists, Send it Back, Other Wise Send Back a Default Icon */
       res.sendFile(exists ? filePath : path.join(__dirname, "../public/images/favicon.ico"));
    });
};

module.exports = { postImageMessage, getImage};