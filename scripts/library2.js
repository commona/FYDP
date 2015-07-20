// http://www.javascripter.net/faq/querystr.htm?test
// http://stackoverflow.com/questions/1830927/how-do-i-make-a-link-that-goes-no-where

// TODO:
// implement code to find groups of empty desks
// implement floor with 50 desks
// check for invalid entries in data files
// find workaround for callback functions (clean up callback functions as well)
// investigate possible failure points in script
// comment code

// TODO (next term?):
// remove query string after loading the library data to make URL cleaner
// figure out way to implement seat size (make it a property of the floor?)
// put the entire app all on one page?

// COMMON CONSOLE COMMANDS
// library.floors[1].desks[0].status
// clearInterval(1)


var seatSize = 15;

// provide static occupancy data until the server is built and running
var seatStatus = [
    {
        "id" : 100,
        "status" : 0
    },
    {
        "id" : 101,
        "status" : 1
    },
    {
        "id" : 102,
        "status" : 2
    },
    {
        "id" : 103,
        "status" : 1
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
]

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
    var i;
    for (i = 0; i < this.desks.length ; i++){
        var j = 0;
        while( j < seatStatus.length && this.desks[i].id != seatStatus[j].id ){
            j++
        }
        if ( j < seatStatus.length ){
            this.desks[i].status = seatStatus[j].status;
        }
        else{
            console.log( "seat data not found: " + this.desks[i].id );
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

            //ctx.fillRect(seatLocation[i][0],seatLocation[i][1],seatSize,seatSize);
            ctx.beginPath();
            ctx.arc(this.desks[i].x, this.desks[i].y, this.desks[i].size, 0, 2*Math.PI);
            ctx.fill();
            
            // outline the circle
            ctx.fillStyle = 'black';
            ctx.stroke();
        }

    }
    
    // update the time updated
    //var d = new Date();
    //var timeUpdatedText = document.getElementById('timeUpdated');
    //timeUpdatedText.innerHTML = "Time updated -- " + d.toLocaleTimeString();
    console.log("seat status and picture updated");
}



var intervalID;
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
        
        library.floors[library.currentFloor].updateDisplay();
        clearInterval(intervalID);
        intervalID = window.setInterval(function(){library.floors[library.currentFloor].updateDisplay();}, 5000);
        library.floors[library.currentFloor].updateDisplay()    // instantly redraw
        //var intervalID = window.setInterval(library.floors[library.currentFloor].updateDisplay(), 1000);        // remember to remove interval when switching floors
    }
}

// Library class
var Library = function(){
    this.floors = new Array();
    this.currentFloor = 0;
    
    // Get the library selected by the user
    var queryValue = self.location.search;
    queryValue = queryValue.substring(1,queryValue.length);
    
    // Display the library name on the page
    if (queryValue == "design-fair")
        document.getElementById('libraryName').innerHTML = "Design Fair";
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
        dataFile.open('get','../libraries/' + queryValue + '2.txt',true);
    else
        dataFile.open('get','http://commona.github.io/Seat-Spotter/libraries/' + queryValue + '2.txt',true);
    
    dataFile.send();
    
    dataFile.onreadystatechange = function(){
        if (dataFile.readyState == 4){

            var str = dataFile.responseText;
            var lines = str.split('\n');
            var numFloors = Number(lines[0]); 
            var i;
            console.log("starting to create floors..., numfloors = " + numFloors);
            
            // read in floor information from data file (name, map name, etc.)
            for (i = 1; i < 1+numFloors; i++){
                var lineValues = lines[i].split(',');
                library.floors[ i-1 ] = new Floor( lineValues[0], lineValues[1] );
                console.log("created floor" + lineValues[0]);
            }
            // read in desk information (ID, location)
            for (; i < lines.length; i++){
                var lineValues = lines[i].split(',');
                var floorIndex = library.getFloorIndex(lineValues[0]);
                library.floors[floorIndex].desks.push( new Desk( Number(lineValues[1]), Number(lineValues[2]), Number(lineValues[3]),  Number(lineValues[4])) );
            }
            
            // list out available floors
            library.updateFloorLinks();

            // paint picture of the first floor in the floors array and start drawing the seat statuses
            library.floors[0].updateMap();
        }
    }
    
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

var library = new Library();
