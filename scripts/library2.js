// http://www.javascripter.net/faq/querystr.htm?test

// TODO:
// remove query string after loading the library data to make URL cleaner
// figure out way to implement seat size (make it a property of the floor?)
// create the classes
// clean up site initialization code
// implement code to find groups of empty desks
// read from data from JSON format
// check for invalid entries in data files

//var intervalID = window.setInterval(draw, 1000);

var seatStatus = [0,0,0,0];
var seatSize = 15;
//var seatLocation = [[0,0],[50,0],[100,0],[150,0]];
var seatLocation = [];
var seatIDs = [];
var pageReady = false;      // keeps track of when the images are loaded and initial seat statuses are received before drawing
var currentFloor = 1;       // the current floor displayed    

function updateSeatLocations(str){
    var lines = str.split('\n');
    var i;
    for (i = 0; i < lines.length; i++){
        var lineValues = lines[i].split(',');
        seatIDs.push(Number(lineValues[0]));
        seatLocation.push([Number(lineValues[1]),Number(lineValues[2])]);
    }
    draw();
}


// Objects
var Desk = function(id, x, y){
    this.id = id;
    this.x = x;
    this.y = y;
    this.status = 0;
}

var Floor = function(floorNumber, mapName){
    this.floorNumber = floorNumber;
    this.mapName = mapName;
    this.desks = [];
}

Floor.prototype.updateDisplay = function(){
    if (pageReady==false) return;   // check if page is ready before drawing
    
    var canvas = document.getElementById('canvas');
    
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        
        // clear the canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
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
            //ctx.fillRect(seatLocation[i][0],seatLocation[i][1],seatSize,seatSize);
            ctx.beginPath();
            ctx.arc(seatLocation[i][0],seatLocation[i][1],seatSize,0,2*Math.PI);
            ctx.fill();
            
            // outline the circle
            ctx.fillStyle = 'black';
            ctx.stroke();
        }

    }
    
    // update the time updated
    var d = new Date();
    var timeUpdatedText = document.getElementById('timeUpdated');
    timeUpdatedText.innerHTML = "Time updated -- " + d.toLocaleTimeString();
}

// Library class
var Library = function(){
    this.floors = [];
    this.currentFloor = 1;
    
    // Get the library selected by the user
    var queryValue = self.location.search;
    queryValue = queryValue.substring(1,queryValue.length);
    
    // Display the library name on the page
    if (queryValue == "design-fair")
        document.getElementById('libraryName').innerHTML = "Design Fair Demo";
    else if (queryValue == "dc-library")
        document.getElementById('libraryName').innerHTML = "DC Library";
    else if (queryValue == "dp-library")
        document.getElementById('libraryName').innerHTML = "DP library";
    else
        return;
    
    // load desk locations and IDs
    var dataFile = new XMLHttpRequest();
    // browser refuses to open local files, so open data file from github when testing on local computer
    if (self.location.origin == "http://commona.github.io")
        dataFile.open('get','../libraries/' + queryValue + '.txt',true);
    else
        dataFile.open('get','http://commona.github.io/Seat-Spotter/libraries/' + queryValue + '2.txt',true);
    
    dataFile.send();
    
    dataFile.onreadystatechange = function(){
        if (dataFile.readyState == 4){
            //console.log(dataFile.responseText);
            var str = dataFile.responseText;
            var lines = str.split('\n');
            var numFloors = Number(lines[0]); 
            var i;
            for (i = 1; i < 1+numFloors; i++){
                var lineValues = lines[i].split(',');
                this.floors[ Number(lineValues[0]) ] = new Floor( Number(lineValues[0]), lineValues[1] );
            }
            
            for (; i < lines.length; i++){
                var lineValues = lines[i].split(',');
                this.floors[Number(lineValues[0])].desks.push( new Desk( Number(lineValues[1]), Number(lineValues[2]), Number(lineValues[3]) ) );
            }
        }
    }
    
}
Library.prototype.initializeDesks = function(){

    // load floor picture
    var img = new Image();
    img.src = "../maps/" + queryValue + ".png";
    img.onload = function(){
        console.log(img.width);
        console.log(img.height);
        var canvas = document.getElementById('canvas');
        canvas.setAttribute("width", img.width);
        canvas.setAttribute("height", img.height);
        canvas.style.backgroundImage = "url('../maps/" + queryValue + ".png')";
        pageReady = true;
    }

    
}
Library.prototype.updateDesks = function(){
    
}


var library = new Library();
