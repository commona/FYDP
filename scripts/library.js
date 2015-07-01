// http://www.javascripter.net/faq/querystr.htm?test

// remove query string after loading the library data to make URL cleaner

//var intervalID = window.setInterval(draw, 1000);

var userInput = 1;;
function pollServer(){
    return userInput;
}

var seat0 = 0;
var seat1 = 0;
var seat2 = 0;
var seat3 = 0;

var seatStatus = [0,0,0,0];
var seatSize = 50;
var seatLocation = [[0,0],[50,0],[100,0],[150,0]];

function draw() {
    var canvas = document.getElementById('canvas');
    
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        // ctx.fillRect(25,25,100,100);
        // ctx.clearRect(45,45,60,60);
        // ctx.strokeRect(50,50,50,50);
        //ctx.strokeRect(0,0,50,50);
        //ctx.strokeRect(50,0,50,50);
        //ctx.strokeRect(100,0,50,50);
        //ctx.strokeRect(150,0,50,50);
        
        // clear the canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);

        // Draw seat status
        ctx.fillStyle = "red";
        //ctx.fillRect(1,1,48,48);
        ctx.fillRect(0,0,50,50);
        ctx.fillStyle = "green";
        //ctx.fillRect(51,1,48,48);
        ctx.fillRect(50,0,50,50);
        
        // Draw seat status (2)
        var i;
        for (i = 0; i < seatStatus.length; i++){
            if (seatStatus[i] == 0)
                ctx.fillStyle = "red";
            else if (seatStatus[i] == 1)
                ctx.fillStyle = "orange";
            else if (seatStatus[i] == 2)
                ctx.fillStyle = "green";
            else
                ctx.fillStyle = "red";
            ctx.fillRect(seatLocation[i][0],seatLocation[i][1],seatSize,seatSize);
        }

        //ctx.lineWidth = 5;
        
        // Outline the seats
        ctx.strokeRect(0,0,50,50);
        ctx.strokeRect(50,0,50,50);
        ctx.strokeRect(100,0,50,50);
        ctx.strokeRect(150,0,50,50);
    }
    
    // update the time updated
    var d = new Date();
    var timeUpdatedText = document.getElementById('timeUpdated');
    timeUpdatedText.innerHTML = "Time updated -- " + d.toLocaleTimeString();
}

//draw();

// Page Initialization

// Get the library selected
var queryValue = self.location.search;
queryValue = queryValue.substring(1,queryValue.length);
console.log(queryValue);

// Display the library name on the page
if (queryValue == "design-fair")
    document.getElementById('libraryName').innerHTML = "Design Fair Demo";
else if (queryValue == "dc-library")
    document.getElementById('libraryName').innerHTML = "DC Library";
else if (queryValue == "dp-library")
    document.getElementById('libraryName').innerHTML = "DP library";

// load library picture
var img = new Image();
img.src = "../maps/" + queryValue + ".png";
img.onload = function(){
    console.log(img.width);
    console.log(img.height);
    var canvas = document.getElementById('canvas');
    canvas.setAttribute("width", img.width);
    canvas.setAttribute("height", img.height);
    canvas.style.backgroundImage = "url('../maps/" + queryValue + ".png')";
}

// load desk locations
var dataFile = new XMLHttpRequest();
dataFile.open('get','../libraries/' + queryValue + '.txt',true);
dataFile.onreadystatechange = function(){
    if (dataFile.readyState == 4){
        console.log(dataFile.responseText);
        alert('txt file read');
    }
}
dataFile.send();