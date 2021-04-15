$(document).ready(function () {
    renderWelcomeSection();
    addInputEventListeners();

    $(".text-center card-button").click(function () {
        //e.preventDefault();
        renderWelcomeSection();
        var old_element = document.getElementById("dropzone");
        var dropzoneInputElem = document.getElementById("drop-zone-input");
        dropzoneInputElem.value = null;
        old_element.innerHTML = "<span class='drop-zone__prompt caption'>Drop file here or click to upload</span> <input type='file' name='myFile' class='drop-zone__input'>"
    });
    

    //$("#failure-reload-btn").click(function () {
        // just to clear out the already existing file uploads
    //    renderWelcomeSection();
    //    var old_element = document.getElementById("dropzone");
    //    var dropzoneInputElem = document.getElementById("drop-zone-input");
    //    dropzoneInputElem.value = null;
    //    old_element.innerHTML = "<span class='drop-zone__prompt caption'>Drop file here or click to upload</span> <input type='file' name='myFile' class='drop-zone__input'>"
    //});

    //$("#failure-reload-btn-2").click(function () {
        // just to clear out the already existing file uploads
    //    renderWelcomeSection();
    //    var old_element = document.getElementById("dropzone");
    //    var dropzoneInputElem = document.getElementById("drop-zone-input");
    //    dropzoneInputElem.value = null;
    //    old_element.innerHTML = "<span class='drop-zone__prompt caption'>Drop file here or click to upload</span> <input type='file' name='myFile' class='drop-zone__input'>"
    //});
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
    renderProcessingSection();
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
    console.log(typeof file)

    //var img = new Image(),
    //$canvas = $("<canvas>"),
    //canvas = $canvas[0],
    //context;

    //img.crossOrigin = "anonymous";
    //img.onload = function () {
    //    $canvas.attr({ width: this.width, height: this.height });
    //    context = canvas.getContext("2d");
    //    if (context) {
    //        context.drawImage(this, 0, 0);
    //        $("body").append("<p>original image:</p>").append($canvas);
        
    //        removeBlanks(this.width, this.height);
    //    } else {
    //        alert('Get a real browser!');
    //    }
    //};

    // define here an image from your domain
    //img.src = file;
    //file = img.src;
    //var timeCrop = performance.now();
    //console.log("cropping took " + (timeCrop - t0) + " milliseconds.")
    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {

        var t0 = performance.now()
        Tesseract.recognize(
            file,
            'eng', {
            logger: m => console.log(m)
        }
        ).then(({
            data: {
                text
            }
        }) => {
            var t1 = performance.now()
            console.log("OCR took " + (t1 - t0) + " milliseconds.")
            // FIXME: handle the part where "corret , incorrect is not found"
            
            var numCorrect = ""
            var correctPts = -1
            var numIncorrect = ""
            var totalPts = -1
            try{
                var splitCorrect = text.substr(0, text.indexOf(' correct')).split(" ");
                numCorrect = splitCorrect[splitCorrect.length - 1];
                correctPts = parseInt(numCorrect);

                var splitIncorrect = text.substr(0, text.indexOf(' incorrect')).split(" ");
                numIncorrect = splitIncorrect[splitIncorrect.length - 1];
                totalPts = parseInt(numCorrect) + parseInt(numIncorrect);

            }catch(err){
                console.log("error")
            }
            
            if (!isNaN(correctPts) || !isNaN(totalPts)){
                
                fetch('/grade', {
                    method: 'post',
                    body: JSON.stringify({
                        correct_pts: correctPts, 
                        total_pts: totalPts, 
                        lis_result_sourcedid: lis_result_sourcedid, 
                        lis_outcome_service_url: lis_outcome_service_url 
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': Rails.csrfToken()
                    },
                    credentials: 'same-origin'
                })
                .then(response => response.json())
                .then(result => {
                    // here server will respond a 200 success
                    // first check here if Canvas got the grade
                    // console.log(result)
                    if (result["success"] === 1) {
                        // then case on full mark or not
                        if (correctPts === totalPts) {
                            // render the full-marks page
                            renderFullMarksPage(correctPts, totalPts);
                        } else {
                            // render the partial credit page with option to reload the welcome section
                            renderPartialCreditPage(correctPts, totalPts);
                        }
                    }
                })
                .catch(error => {
                    // here server is dead
                    // console.error('Error:', error);
                });
            } else {
                renderWrongImagePage();
            }

            })
            dropZoneElement.querySelector(".drop-zone__prompt").remove();
        }

    // First time - there is no thumbnail element, so lets create it
    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;
    thumbnailElement.style.backgroundImage = null;
}

// 1
function renderWelcomeSection() {
    hideProcessingSection();
    hideResultSection();
    $("#welcome-section").css("display", "block");
}

// 2
function renderProcessingSection() {
    hideWelcomeSection();
    $("#processing-section").css("display", "inline");
}

// 3
function renderFullMarksPage(correctPts, totalPts) {
    hideProcessingSection();
    $("#result-section").css("display", "block");
    $("#full-marks-page").css("display", "block");
    $("#full-marks-page-note").html("Your score is " + correctPts + " / " + totalPts + "!");
    confetti();
}

// 3
function renderPartialCreditPage(correctPts, totalPts) {
    hideProcessingSection();
    $("#result-section").css("display", "block");
    $("#partial-credit-page-note").html("You didn’t get all questions (" + correctPts + " / " + totalPts + ").");
    $("#partial-credit-page").css("display", "block");
}

function renderWrongImagePage(){
    hideProcessingSection();
    $("#result-section").css("display", "block");
    $("#wrong-image-page-note").html("Perhaps you turned in the wrong screenshot. Try again.");
    $("#wrong-image-page").css("display", "block");
}

// hide view utilities
function hideWelcomeSection() {
    $("#welcome-section").css("display", "none");
}

function hideProcessingSection() {
    $("#processing-section").css("display", "none");
}

function hideResultSection() {
    $("#display-section").css("display", "none");
    $("#partial-credit-page").css("display", "none");
    $("#full-marks-page").css("display", "none");
}

function showResultSection() {
    $("#display-section").css("display", "block");
}

function addInputEventListeners() {
    $(document).ready(function() {
        document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
            const dropZoneElement = inputElement.closest(".drop-zone");

            dropZoneElement.addEventListener("click", (e) => {
                inputElement.click();
            });

            inputElement.addEventListener("change", (e) => {
                if (inputElement.files.length != 0) {
                    updateThumbnail(dropZoneElement, inputElement.files[inputElement.files.length - 1]);
                }
            });

            dropZoneElement.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropZoneElement.classList.add("drop-zone--over");
            });

            ["dragleave", "dragend"].forEach((type) => {
                dropZoneElement.addEventListener(type, (e) => {
                    dropZoneElement.classList.remove("drop-zone--over");
                });
            });

            dropZoneElement.addEventListener("drop", (e) => {
                e.preventDefault();

                var t0 = performance.now()
                if (e.dataTransfer.files.length) {
                    inputElement.files = e.dataTransfer.files;
                    updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
                    file = e.dataTransfer.files[0];
                    
                }
                dropZoneElement.classList.remove("drop-zone--over");
            });
        });

    });
   
}

let clickEventFunction = (e) => {

}

var removeBlanks = function (imgWidth, imgHeight) {
    var imageData = context.getImageData(0, 0, imgWidth, imgHeight),
        data = imageData.data,
        getRBG = function(x, y) {
            var offset = imgWidth * y + x;
            return {
                red:     data[offset * 4],
                green:   data[offset * 4 + 1],
                blue:    data[offset * 4 + 2],
                opacity: data[offset * 4 + 3]
            };
        },
        isWhite = function (rgb) {
            // many images contain noise, as the white is not a pure #fff white
            return rgb.red > 200 && rgb.green > 200 && rgb.blue > 200;
        },
        scanY = function (fromTop) {
            var offset = fromTop ? 1 : -1;
            
            // loop through each row
            for(var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {
                
                // loop through each column
                for(var x = 0; x < imgWidth; x++) {
                    var rgb = getRBG(x, y);
                    if (!isWhite(rgb)) {
                        return y;                        
                    }      
                }
            }
            return null; // all image is white
        },
        scanX = function (fromLeft) {
            var offset = fromLeft? 1 : -1;
            
            // loop through each column
            for(var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {
                
                // loop through each row
                for(var y = 0; y < imgHeight; y++) {
                    var rgb = getRBG(x, y);
                    if (!isWhite(rgb)) {
                        return x;                        
                    }      
                }
            }
            return null; // all image is white
        };
    
    var cropTop = scanY(true),
        cropBottom = scanY(false),
        cropLeft = scanX(true),
        cropRight = scanX(false),
        cropWidth = cropRight - cropLeft,
        cropHeight = cropBottom - cropTop;
    
    var $croppedCanvas = $("<canvas>").attr({ width: cropWidth, height: cropHeight });
    
    // finally crop the guy
    $croppedCanvas[0].getContext("2d").drawImage(canvas,
        cropLeft, cropTop, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight);
    
    $("body").
        append("<p>same image with white spaces cropped:</p>").
        append($croppedCanvas);
    console.log(cropTop, cropBottom, cropLeft, cropRight);
};