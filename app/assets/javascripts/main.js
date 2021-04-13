// FIXME: this thing gets called twice!
$(document).ready(function () {
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");

        dropZoneElement.addEventListener("click", (e) => {
            inputElement.click();
        });

        inputElement.addEventListener("change", (e) => {
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
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

            //var t0 = performance.now()
            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
                file = e.dataTransfer.files[0];
            }
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });
});
// });

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {

    $('#spinner').css('display', 'inline');
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
    console.log(typeof file)
    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {

        //var t0 = performance.now()
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
            //var t1 = performance.now()
            //console.log("OCR took " + (t1 - t0) + " milliseconds.")
            var splitCorrect = text.substr(0, text.indexOf(' correct')).split(" ");
            var numCorrect = splitCorrect[splitCorrect.length - 1]

            var splitIncorrect = text.substr(0, text.indexOf(' incorrect')).split(" ");
            var numIncorrect = splitIncorrect[splitIncorrect.length - 1]

            fetch('/grade', {
                method: 'post',
                body: JSON.stringify({
                    correct_pts: parseInt(numCorrect), 
                    total_pts: parseInt(numCorrect) + parseInt(numIncorrect), 
                    lis_result_sourcedid: lis_result_sourcedid, 
                    lis_outcome_service_url: lis_outcome_service_url }
                ),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': Rails.csrfToken()
                },
                credentials: 'same-origin'
            }).then(function (response) {
                window.location.replace("/success");
            }).then(function (data) {
                console.log(data);
            });

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

    // Show thumbnail for image files
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = url('${reader.result}');
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }
}

function removeImageBlanks(imageObject) {
    imgWidth = imageObject.width;
    imgHeight = imageObject.height;
    var canvas = document.createElement('canvas');
    canvas.setAttribute("width", imgWidth);
    canvas.setAttribute("height", imgHeight);
    var context = canvas.getContext('2d');
    context.drawImage(imageObject, 0, 0);

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
                    if (fromTop) {
                        return y;
                    } else {
                        return Math.min(y + 1, imgHeight);
                    }
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
                    if (fromLeft) {
                        return x;
                    } else {
                        return Math.min(x + 1, imgWidth);
                    }
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

    canvas.setAttribute("width", cropWidth);
    canvas.setAttribute("height", cropHeight);
    // finally crop the guy
    canvas.getContext("2d").drawImage(imageObject,
        cropLeft, cropTop, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight);

    return canvas.toDataURL();
}