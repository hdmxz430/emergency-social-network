$(document).ready(function () {
    /* Feature Detection
    * simple check for the existence of navigator.getUserMedia:
    */
    if (hasGetUserMedia()) {
        // Good to go!
        console.log("Good To Go");
    } else {
        alert('getUserMedia() is not supported in your browser');
    }

    $('#file').on('change', function(event){
       let file = $(this)[0].files[0];
       console.log(file);
       drawOnCanvas(file);
    });

    $('#upload').on('click', function(event){
        event.preventDefault();
        /* Replace the Function of  File Input */
        $('#file').click();
        // let formData = new FormData();
        //
        // let file = $('#file')[0].files[0];
        //
        // console.log(file);
        //
        // formData.append('logo', file);
        //
        // $.ajax({
        //     url: '/chat_public/imageMessages',
        //     type: 'POST',
        //     cache: false,
        //     data: formData,
        //     processData: false,
        //     contentType: false
        // }).done(function(res) {
        //     console.log(res);
        //     //var file = new File(res.imgData, res.originalname);
        //     let img = new Image();
        //     let canvas = document.createElement('canvas')
        //     img.onload = function() {
        //         console.log("The Original Width is: "+img.width);
        //         console.log("The Original Width is: "+img.height);
        //         console.log("Original File Type is "+file.type)
        //         compressedDataURL = compress(img, canvas);
        //         $('#testimg').attr('src', compressedDataURL);
        //     };
        //
        //     img.src = res.imgURL;
        //     // $('#testimg').attr('src', res.imgURL);
        //     console.log("Success");
        // }).fail(function(res) {
        //     console.log("Fail");
        // });

        //let reader = new FileReader();

        // reader.onload = function (e) {
        //     let dataURL = e.target.result,
        //         canvas=document.createElement('canvas'); // Turn a jQuery object to a pure Canvas element.
        //         img = new Image();
        //
        //     img.onload = function() {
        //         let compressedDataURL = compress(img, canvas);
        //         formData.append('logo', compressedDataURL);
        //         $.ajax({
        //             url: '/chat_public/imageMessages',
        //             type: 'POST',
        //             cache: false,
        //             data: formData,
        //             processData: false,
        //             contentType: false
        //         }).done(function(res) {
        //             console.log("Success");
        //         }).fail(function(res) {
        //             console.log("Fail");
        //         });
        //     };
        //
        //     img.src = dataURL;
        //
        // };
        //
        // reader.readAsDataURL(file);

    });



});

function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

/*
    Display the Image on the client-side
    without uploading it e.g.
    for client-side image editing purposes,
    using the FileReader and a canvas element:
 */

function drawOnCanvas(file) {
    let reader = new FileReader();
    let compressedDataURL;

    reader.onload = function (e) {
        let dataURL = e.target.result,
            imagePreview = $('#preview').get(0), // Turn a jQuery object to a pure Canvas element.
            // ctx = imagePreview.getContext('2d'),
            img = new Image();
       // console.log(imagePreview.width);
        //console.log(imagePreview);

        img.onload = function() {
            console.log("The Original Width is: "+img.width);
            console.log("The Original Width is: "+img.height);
            console.log("Original File Type is "+file.type);

            compressedDataURL = compress(img, imagePreview);
            $('#previewDiv').slideDown();

            let bob = dataURLtoBlob(compressedDataURL);
            bob.name = file.name;
            // console.log("Blob File:");
            // console.log(bob);
        };

        img.src = dataURL;

    };

    reader.readAsDataURL(file);

}

//Image Compress
function compress(image, canvas) {
    let width = image.width;
    let height = image.height;
    let scale = 280;
// calculate the width and height, constraining the proportions
    if (width > height) {
        if (width > scale) {
            height = Math.round(height *= scale / width);
            width = scale;
        }
    } else {
        if (height > scale) {
            width = Math.round(width *= scale / height);
            height = scale;
        }
    }
    console.log("New Width is "+width);
    console.log("New Height is "+height);
    canvas.width = width; //New Width of the Pic
    canvas.height = height; //New Height of the Pic
    ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    let dataURL = canvas.toDataURL("image/png", 1.0);
    ctx = null;
    return dataURL;
}

function fileInputClear(input){
    input.wrap('<form></form>');
    input.parent()[0].reset();
    input.unwrap();
}

//**dataURL to blob**
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}