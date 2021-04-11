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

        console.log("I am here.");

        dropZoneElement.addEventListener("drop", (e) => {
            console.log("I am inside");
            e.preventDefault();

            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
                file = e.dataTransfer.files[0];
                console.log("file"+file);
                // FIXME: this thing will only get called when the user drags and drops. If the user click the "upload file" button, then nothing will happen.
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
                    console.log(text);
                    var splitCorrect = text.substr(0, text.indexOf(' correct')).split(" ");
                    var numCorrect = splitCorrect[splitCorrect.length - 1]

                    var splitIncorrect = text.substr(0, text.indexOf(' incorrect')).split(" ");
                    var numIncorrect = splitIncorrect[splitIncorrect.length - 1]

                    fetch('/grade', {
                        method: 'post',
                        body: JSON.stringify({ correct_pts: parseInt(numCorrect), total_pts: parseInt(numCorrect) + parseInt(numIncorrect) }),
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': Rails.csrfToken()
                        },
                        credentials: 'same-origin'
                    }).then(function (response) {
                        //             console.log(response.data)
                        //             obj = JSON.parse(response.responseText);
                        //             if (obj['success'] = 1) {
                        //                 var tag = document.createElement("p");
                        //                 var text = document.createTextNode("Got" + obj['numCorrect'] + "correct and " + 
                        // obj['numTotal']) + "incorrect.";
                        //                 tag.appendChild(text);
                        //                 document.body.appendChild(tag);
                        //             }
                        window.location.replace("/success");
                    }).then(function (data) {
                        console.log(data);
                    });

                })
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
    console.log("i am here updateThumbnail");

    $('#spinner').css('display', 'inline');
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        console.log("I am here 02");

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
            console.log(text);
            var splitCorrect = text.substr(0, text.indexOf(' correct')).split(" ");
            var numCorrect = splitCorrect[splitCorrect.length - 1]

            var splitIncorrect = text.substr(0, text.indexOf(' incorrect')).split(" ");
            var numIncorrect = splitIncorrect[splitIncorrect.length - 1]

            fetch('/grade', {
                method: 'post',
                body: JSON.stringify({ correct_pts: parseInt(numCorrect), total_pts: parseInt(numCorrect) + parseInt(numIncorrect) }),
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
        console.log("I am here 03");
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    // Show thumbnail for image files
    if (file.type.startsWith("image/")) {
        console.log("I am here 04");
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = url('${reader.result}');
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }
}