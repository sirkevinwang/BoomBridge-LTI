var lakhota = true;
$(document).ready(function () {
    $('.eng').addClass('hidden');
    $('.lkt').addClass('inline');
    $(document).on('click', '#translate', function () {
        lakhota = !lakhota;
        if (lakhota) {
            $('.eng').removeClass('inline').addClass('hidden');
            $('.lkt').removeClass('hidden').addClass('inline');
        } else {
            $('.eng').removeClass('hidden').addClass('inline');
            $('.lkt').removeClass('inline').addClass('hidden');
        }
    });
    renderWelcomeSection();
    addInputEventListeners();

    $("div.text-center.card-button").click(function() {
        renderWelcomeSection();
        let inputElement = document.getElementById("upload");
        if (inputElement.file != null) {
            inputElement.file = null;
            addInputEventListeners();
        }
    });
});

function process_screenshot(file) {
    renderProcessingSection();
    console.log(typeof file)

    //let img = new Image(),
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
    //let timeCrop = performance.now();
    //console.log("cropping took " + (timeCrop - t0) + " milliseconds.")


    let t0 = performance.now()
    Tesseract.recognize(
        file,
        'eng', {
        logger: m => {} // logger is removed here
    }
    ).then(({
        data: {
            text
        }
    }) => {
        // let t1 = performance.now()
        // console.log("OCR took " + (t1 - t0) + " milliseconds.")        
        let numCorrect = ""
        let correctPts = -1
        let numIncorrect = ""
        let totalPts = -1
        try{
            // here we attempt to determine the grades
            let splitCorrect = text.substr(0, text.indexOf(' correct')).split(" ");
            numCorrect = splitCorrect[splitCorrect.length - 1];
            correctPts = parseInt(numCorrect);

            let splitIncorrect = text.substr(0, text.indexOf(' incorrect')).split(" ");
            numIncorrect = splitIncorrect[splitIncorrect.length - 1];
            totalPts = parseInt(numCorrect) + parseInt(numIncorrect);
            console.log("correct");
            console.log(correctPts);

        } catch(err){
            console.log("error")
        }
        
        if (!isNaN(correctPts) || !isNaN(totalPts)){
            // encrypted grade pass back
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
                // here server is dead :(
                // console.error('Error:', error);
            });
        } else {
            renderWrongImagePage();
        }
    })
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
    var possible_gifts = [
        "&#128018;", // monkey
        "&#129421;", // gorilla
        "&#128021;", // dog
        "&#128008;", // cat
        "&#128005;", // tiger
        "&#128006;", // leopard
        "&#128014;", // horse
        "&#129420;", // deer
        "&#128002;", // ox
        "&#128003;", // water buffalo
        "&#128004;", // cow
        "&#128022;", // pig
        "&#128017;", // sheep
        "&#128042;", // camel
        "&#128043;", // two-hump camel
        "&#128024;", // elephant
        "&#129423;", // rhinoceros
        "&#128001;", // mouse
        "&#128007;", // rabbit
        "&#129415;", // bat
        "&#129411;", // turkey
        "&#128038;", // bird
        "&#128039;", // penguin
        "&#128010;", // crocodile
        "&#128034;", // turtle
        "&#129422;", // lizard
        "&#128013;", // snake
        "&#128009;", // dragon
        "&#128051;", // whale
        "&#128032;", // fish
        "&#129416;", // shark
        "&#128025;", // octopus
        "&#129425;", // squid
        "&#129419;", // butterfly
        "&#128029;", // bee
        "&#128030;", // ladybug
        "&#129410;" // scorpion
    ];
    var gift = possible_gifts[Math.floor(Math.random() * possible_gifts.length)];
    
    hideProcessingSection();
    $("#result-section").css("display", "block");
    $("#full-marks-page").css("display", "block");
    if (!lakhota) {
        $("#full-marks-page-note").html("<span class='eng'>Your score is " + correctPts + " / " + totalPts + "!</span>");
        $("#gift").html("It's a " + gift + "!");
    } else {
        $("#full-marks-page-note").html("<span class='lkt'>" + correctPts + " / " + totalPts + " yákámna!</span>");
        $("#gift").html(gift + " héčha!");
    }
    confetti();
}

// 3
function renderPartialCreditPage(correctPts, totalPts) {
    hideProcessingSection();
    $("#result-section").css("display", "block");

    if (!lakhota) {
        $("#partial-credit-page-note").html("<span class='eng'>You didn’t get all questions (" + correctPts + " / " + totalPts + ").</span>");
    } else {
        $("#partial-credit-page-note").html("<span class='lkt'>Wóiyuŋǧe kiŋ iyúha taŋyáŋ alúpte šni (" + correctPts + " / " + totalPts + ").</span>");
    }

    $("#partial-credit-page").css("display", "block");
    
}

function renderWrongImagePage(){
    hideProcessingSection();
    $("#result-section").css("display", "block");
    if (!lakhota) {
        $("#wrong-image-page-note").html("<span class='eng'>Perhaps you turned in the wrong screenshot. Try again.</span>");
    } else {
        $("#wrong-image-page-note").html("<span class='lkt'>Itówapi héčhetu šni waŋ iyáyeyayiŋ kte séče. Akhé iyútȟa yo/ye.</span>");
    }
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
    $("#wrong-image-page").css("display", "none");
}

function showResultSection() {
    $("#display-section").css("display", "block");
}

function addInputEventListeners() {
    $(document).ready(function() {
        let inputElement = document.getElementById("upload");
        inputElement.addEventListener("change", (e) => {
            if (inputElement.files.length != 0) {
                process_screenshot(inputElement.files[inputElement.files.length - 1]);
            }
        });
    });
}
