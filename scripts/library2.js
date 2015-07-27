
// TODO:
// put number of free tables beside floor numbers
// make group box blink
// implement DC library
// investigate possible failure points in script
// check for invalid entries in data files
// comment code

// TODO (next term?):
// remove query string after loading the library data to make URL cleaner
// put the entire app all on one page?
// take into account seat orientation when looking for groups of empty seats

// COMMON CONSOLE COMMANDS
// library.floors[1].desks[0].status
// clearInterval(intervalID)
// statusObj.floors[0].desks[0].status = 0


// provide static occupancy data until the server is running
var seatStatus = [
    {
        "id" : 100,
        "status" : 2
    },
    {
        "id" : 101,
        "status" : 2
    },
    {
        "id" : 102,
        "status" : 0
    },
    {
        "id" : 103,
        "status" : 2
    },
    {
        "id" : 200,
        "status" : 1
    },
    {
        "id" : 201,
        "status" : 1
    },
    {
        "id" : 202,
        "status" : 1
    },
    {
        "id" : 203,
        "status" : 1
    },
    {
        "id" : 301,
        "status" : 2
    },
    {
        "id" : 302,
        "status" : 2
    },
    {
        "id" : 303,
        "status" : 2
    },
]

var intervalID;             // ID for the timer that redraws the seats
const REDRAW_TIME = 5000;   // amount of time (in ms) for desk statuses to be refreshed
var statusObj;              // holds the desks statuses read from the JSON file

// Objects
var Desk = function(id, x, y, size){
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
    this.status = 0;
}

var Floor = function(name, mapName){
    this.name = name;
    this.mapName = mapName;
    this.desks = [];
}

Floor.prototype.updateDisplay = function(){
    
    // update seat statuses
    // var i;
    // for (i = 0; i < this.desks.length ; i++){
        // var j = 0;
        // while( j < seatStatus.length && this.desks[i].id != seatStatus[j].id ){
            // j++
        // }
        // if ( j < seatStatus.length ){
            // this.desks[i].status = seatStatus[j].status;
        // }
        // else{
            // console.log( "seat data not found: " + this.desks[i].id );
        // }
    // }
    
    // get the floor index and desk array
    var deskArray = [];
    for (i = 0; i < statusObj.floors.length; i++){
        if (statusObj.floors[i].name == this.name){
            deskArray = statusObj.floors[i].desks.slice();
            break;
        }
    }
    if (deskArray.length == 0)
        return;
    
    //console.log("desk array");
    //console.log(deskArray);
    
     // update seat statuses with json object  
    for (i = 0; i < this.desks.length ; i++){
        var j = 0;
        for (j = 0; j < deskArray.length; j++){
            if (this.desks[i].id == deskArray[j].id){
                this.desks[i].status = deskArray[j].status;
                break;
            }
        }
    }
    
    var canvas = document.getElementById('canvas');
    
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        
        // clear the canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        // Draw seat status (2)
        var i;
        for (i = 0; i < this.desks.length; i++){
            switch(this.desks[i].status){
                case 0:
                    ctx.fillStyle = "red";
                    break;
                case 1:
                    ctx.fillStyle = "yellow";
                    break;
                case 2:
                    ctx.fillStyle = "green";
                    break;
                default:
                    ctx.fillStyle = "red";
            }
            
            ctx.beginPath();
            ctx.arc(this.desks[i].x, this.desks[i].y, this.desks[i].size, 0, 2*Math.PI);
            ctx.fill();
            
            // outline the circle
            ctx.strokeStyle = "black";
            ctx.lineWidth=1;
            ctx.stroke();
        }

    }
    
    console.log("seat status and picture updated");
    // clearInterval(intervalID);
    // intervalID = window.setInterval(function(){library.floors[library.currentFloor].updateDisplay();}, REDRAW_TIME);
}


Floor.prototype.updateMap = function(){
    console.log("starting updateMap()");
    // load floor map
    var img = new Image();
    img.src = "../maps/" + this.mapName;
    img.onload = function(){
        console.log(img.width);
        console.log(img.height);
        var canvas = document.getElementById('canvas');
        canvas.setAttribute("width", img.width);
        canvas.setAttribute("height", img.height);
        canvas.style.backgroundImage = "url('../maps/" + library.floors[library.currentFloor].mapName + "')";
        console.log("map displayed");

        // set timer to redraw the seats 
        clearInterval(intervalID);
        intervalID = window.setInterval(function(){library.floors[library.currentFloor].updateDisplay();}, REDRAW_TIME);
        
        // redraw seats
        library.floors[library.currentFloor].updateDisplay()
        
        //var intervalID = window.setInterval(library.floors[library.currentFloor].updateDisplay(), 1000);        // remember to remove interval when switching floors
    }
}


// Library class
var Library = function(){
    this.floors = new Array();
    this.currentFloor = 0;      // hold the index of the current floor
    this.name = "";
    
    // Get the library selected by the user
    var queryValue = self.location.search;
    queryValue = queryValue.substring(1,queryValue.length);
    
    // Display the library name on the page
    // if (queryValue == "design-fair")
        // document.getElementById('libraryName').innerHTML = "Design Fair";
    // else if (queryValue == "dc-library")
        // document.getElementById('libraryName').innerHTML = "DC Library";
    // else if (queryValue == "dp-library")
        // document.getElementById('libraryName').innerHTML = "DP library";
    // else
        // return;
    
    // load data file
    var dataFile = new XMLHttpRequest();
    
    // web browser refuses to open local files, so open data file from Github when testing the site on a local computer
    if (self.location.origin == "http://commona.github.io")
        dataFile.open('get','../libraries/' + queryValue + '.csv',true);
    else
        dataFile.open('get','http://commona.github.io/Seat-Spotter/libraries/' + queryValue + '.csv',true);
    
    dataFile.send();
    
    dataFile.onreadystatechange = function(){
        if (dataFile.readyState == 4){

            // isolate each line
            var str = dataFile.responseText;
            var lines = str.split('\n');
            
            // read and set the library name
            var lineValues = lines[0].split(',');
            library.name = lineValues[0];
            document.getElementById('libraryName').innerHTML = library.name;
            
            // read in the number of floors
            var lineValues = lines[1].split(',');
            var numFloors = Number(lineValues[0]); 
            
            var i;
            console.log("starting to create floors..., numfloors = " + numFloors);
            
            // read in floor information from data file (name, map name, etc.)
            for (i = 2; i < 2+numFloors; i++){
                lineValues = lines[i].split(',');
                library.floors[ i-2 ] = new Floor( lineValues[0], lineValues[1] );
                console.log("created floor" + lineValues[0]);
            }
            // read in desk information (ID, location)
            for (; i < lines.length-1; i++){        // length-1 because the last line is empty
                lineValues = lines[i].split(',');
                var floorIndex = library.getFloorIndex(lineValues[0]);
                console.log(floorIndex + " " + lineValues[0]);
                library.floors[floorIndex].desks.push( new Desk( Number(lineValues[1]), Number(lineValues[2]), Number(lineValues[3]),  Number(lineValues[4])) );
            }
            
            // list out available floors
            library.updateFloorLinks();
            
            var jsonFile = new XMLHttpRequest();
            jsonFile.open('get','http://commona.github.io/Seat-Spotter/libraries/design-fair.json',true);
            jsonFile.send();
            jsonFile.onreadystatechange = function(){
                if (jsonFile.readyState == 4){
                    var str = jsonFile.responseText;
                    //console.log(str);
                    console.log("parsing string...");
                    statusObj = JSON.parse(str);
                    console.log("parsed object");
                    console.log(statusObj);
                    
                    // paint picture of the first floor in the floors array and start drawing the seat statuses
                    library.floors[0].updateMap();
                }
            }
            
            
        }
    }
    
    // load initial seat statuses from static JSON file
    
    // web browser refuses to open local files, so open data file from Github when testing the site on a local computer
    // if (self.location.origin == "http://commona.github.io")
        // dataFile.open('get','../libraries/' + queryValue + '.csv',true);
    // else
        // dataFile.open('get','http://commona.github.io/Seat-Spotter/libraries/' + queryValue + '.csv',true);
    
    // dataFile.send();
    
    // dataFile.onreadystatechange = function(){
        // if (dataFile.readyState == 4){
}

// Update the floor links, and disabling the link for the currently displayed floor
Library.prototype.updateFloorLinks = function(){
    //clear the current links
    document.getElementById('floorList').innerHTML = "";
    
    var i;
    for (i = 0; i < this.floors.length; i++){
        if (this.currentFloor == i){
            var text = document.createTextNode(this.floors[i].name);
            document.getElementById('floorList').appendChild(text);
        }
        else{
            var a = document.createElement('a');
            var text = document.createTextNode(this.floors[i].name);
            a.appendChild(text);
            a.href = "javascript:";     // this makes the link do nothing when clicked
            console.log(library);
            //a.addEventListener('click', function(){library.changeFloor(library.floors[i].name)}, false);
            a.onclick = function(){library.changeFloor( this.innerHTML );};
            document.getElementById('floorList').appendChild(a);
            
        }
        
        // add space if not at the last floor
        if (i < this.floors.length - 1){
            var space = document.createTextNode(" ");
            document.getElementById('floorList').appendChild(space);
        }
    }
}

// Change the floor displayed
Library.prototype.changeFloor = function(floorName){
    console.log("Change floor request");
    var floorIndex = this.getFloorIndex(floorName); 
    library.currentFloor = floorIndex;
    library.floors[floorIndex].updateMap(); // may want to disable redraw before this
    library.updateFloorLinks();
}

// (utility function) get index of floor, given the name of the floor
Library.prototype.getFloorIndex = function(floorName){
    var i = 0;
    while( i < this.floors.length && this.floors[i].name != floorName ){
        i++;
    }
    if ( i < this.floors.length)
        return i;
    else
        return -1;
}

Floor.prototype.getFreeGroup = function(numFree){
    
    // Calculate the distance from each point to its nearest point
    var minDistances = [];
    var i;
    var j;
    for(i = 0; i < this.desks.length; i++){
        var distances = [];
        for (j = 0; j < this.desks.length; j++){
            if (j != i){
                // calculate distance between seats
                distances.push( Math.sqrt( Math.pow(this.desks[i].x - this.desks[j].x, 2) + Math.pow(this.desks[i].y - this.desks[j].y, 2) ));
            }
        }
        minDistances.push(Math.min.apply(Math, distances));     // get the distance from this desk to the next closest desk
        //console.log("distances of index " + i);
        //console.log(distances);
    }
    
    //console.log(minDistances);
    
    // Get the median distance of the space between desks
    minDistances.sort();
    var median;
    if (minDistances.length % 2 == 0)
        median = (minDistances[minDistances.length/2 - 1] + minDistances[minDistances.length/2 - 1])/2
    else
        median = minDistances[minDistances.length/2 - 0.5];
    //console.log("median: " + median);
    
    // calculate the upper bound and lower bound
    var upperBound = median * 1.25;
    var lowerBound = median * 0.75;
    
    // Duplicate the desks array
    var freeDesks = this.desks.slice();
    
    // remove desks that are occupied/have something on the desk
    for (i = freeDesks.length-1; i >= 0; i--){
        if (freeDesks[i].status != 2)
            freeDesks.splice(i,1);
    }
    //console.log(freeDesks);
    
    // go through the new desk array and try to find available desks that are within the median distance, taking out those are aren't within a group
    var foundFlag = false;
    
    var deskGroup = [];         // array to hold currently examined group of desks
    var groupArray = [];        // array of groups of desks (because there may be multiple locations where x number of desks of free)
    while (freeDesks.length > 0){
        foundFlag = false;
        deskGroup = [];
        deskGroup.push( freeDesks.splice(0,1)[0] );
        // loop through all desks in the group
        for (i = 0; i < deskGroup.length; i++){
            // finds desks closeby to the currently examined desk
            for (j = freeDesks.length-1; j >= 0; j--){      // performance may worsen because working backwards
                var distance = Math.sqrt( Math.pow(deskGroup[i].x - freeDesks[j].x, 2) + Math.pow(deskGroup[i].y - freeDesks[j].y, 2) );
                if (distance <= upperBound && distance >= lowerBound)
                    deskGroup.push( freeDesks.splice(j,1)[0] );
                if (deskGroup.length >= numFree){
                    foundFlag = true;
                    break;
                }
            }
            if (foundFlag == true)
                break;
        }
        if (foundFlag == true){
            groupArray.push(deskGroup.slice());
            //break;
        }
    }
    console.log("group array:");
    console.log(groupArray);
    
    
    // if a suitable set of desks has not been found, exit function
    if (groupArray.length == 0){
        this.updateDisplay();   // clear any previously displayed blue boxes
        return;
    }
    
    // calculate the top-left corner and bottom-right corner of the box
    var topLeft = [deskGroup[0].x - deskGroup[0].size, deskGroup[0].y - deskGroup[0].size];
    var bottomRight = [deskGroup[0].x + deskGroup[0].size, deskGroup[0].y + deskGroup[0].size];
    for (i = 1; i < deskGroup.length; i++){
        if (topLeft[0] > deskGroup[i].x - deskGroup[i].size)
            topLeft[0] = deskGroup[i].x - deskGroup[i].size;
        if (topLeft[1] > deskGroup[i].y - deskGroup[i].size)
            topLeft[1] = deskGroup[i].y - deskGroup[i].size;
        if (bottomRight[0] < deskGroup[i].x + deskGroup[i].size)
            bottomRight[0] = deskGroup[i].x + deskGroup[i].size;
        if (bottomRight[1] < deskGroup[i].y + deskGroup[i].size)
            bottomRight[1] = deskGroup[i].y + deskGroup[i].size;
    }
    var width = bottomRight[0] - topLeft[0];
    var height = bottomRight[1] - topLeft[1];
    console.log(topLeft);
    console.log(bottomRight);
    
    // draw blue rectangle around the desks
    var canvas = document.getElementById('canvas');
    
    if (canvas.getContext){
        var ctx = canvas.getContext('2d');
        
        // update the display to remove previous boxed desk groups
        this.updateDisplay();
        clearInterval(intervalID);
        intervalID = window.setInterval(function(){library.floors[library.currentFloor].updateDisplay();}, REDRAW_TIME);
        
        for (i = 0; i < groupArray.length; i++){

            var topLeft = [groupArray[i][0].x - groupArray[i][0].size, groupArray[i][0].y - groupArray[i][0].size];
            var bottomRight = [groupArray[i][0].x + groupArray[i][0].size, groupArray[i][0].y + groupArray[i][0].size];
            for (j = 1; j < groupArray[i].length; j++){
                if (topLeft[0] > groupArray[i][j].x - groupArray[i][j].size)
                    topLeft[0] = groupArray[i][j].x - groupArray[i][j].size;
                if (topLeft[1] > groupArray[i][j].y - groupArray[i][j].size)
                    topLeft[1] = groupArray[i][j].y - groupArray[i][j].size;
                if (bottomRight[0] < groupArray[i][j].x + groupArray[i][j].size)
                    bottomRight[0] = groupArray[i][j].x + groupArray[i][j].size;
                if (bottomRight[1] < groupArray[i][j].y + groupArray[i][j].size)
                    bottomRight[1] = groupArray[i][j].y + groupArray[i][j].size;
            }
            
            var width = bottomRight[0] - topLeft[0];
            var height = bottomRight[1] - topLeft[1];
            
            // Draw rectangle
            ctx.strokeStyle = "blue";
            ctx.lineWidth=3;
            ctx.strokeRect(topLeft[0], topLeft[1], width, height);
        }
    }

}

// start the application
var library = new Library();

// assign function to buttons
document.getElementById("button2seats").onclick = function(){library.floors[library.currentFloor].getFreeGroup(2);};
document.getElementById("button3seats").onclick = function(){library.floors[library.currentFloor].getFreeGroup(3);};
document.getElementById("button4seats").onclick = function(){library.floors[library.currentFloor].getFreeGroup(4);};
document.getElementById("button5seats").onclick = function(){library.floors[library.currentFloor].getFreeGroup(5);};

// randomize seat statuses for the purpose of demonstrating locating groups of free desks
document.getElementById("buttonRandom").onclick = function(){
    // find index of floor in statusObj
    var index = -1;
    for (i = 0; i < statusObj.floors.length; i++){
        if (statusObj.floors[i].name == library.floors[library.currentFloor].name){
            index = i;
            break;
        }
    }
    if (index == -1)
        return;
    
    // randomize statuses
    for (i = 0; i < statusObj.floors[index].desks.length; i++){
        // var randStatus = Math.floor(Math.random() * 3);
        var randStatus = Math.floor(Math.random() * 4);
        if (randStatus == 3) randStatus = 2;
        statusObj.floors[index].desks[i].status = randStatus;
    }
    
    // update the display
    library.floors[library.currentFloor].updateDisplay();
    clearInterval(intervalID);
    intervalID = window.setInterval(function(){library.floors[library.currentFloor].updateDisplay();}, REDRAW_TIME);
}


// console.log('starting test....adsfas');
// var dataFile = new XMLHttpRequest();

// dataFile.open('get','http://20.20.2.57/Seatspotter/libraries',true);
// dataFile.send();
// dataFile.onreadystatechange = function(){
    // var str = dataFile.responseText;
    // console.log("data pulled from link: ");
    // console.log(str);
// }