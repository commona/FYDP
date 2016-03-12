
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
var canvasW, canvasH;

// Objects
var Desk = function(id, hubId, x, y, w, h, state){
    this.id = id;
	this.hubId = hubId;
    this.x = x;
    this.y = y;
	this.w = w;
	this.h = h;
    this.state = state;
}

Desk.prototype.draw = function(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.strokeStyle = 'black';
	ctx.rect(this.x, this.y, this.w, this.h);
	ctx.stroke();
}

var Hub = function(id, x, y, w, h){
	this.id = id;
	this.x = x;
	this.y = y;
	this.h = h;
	this.w = w;
	this.desks = new Array();
	this.populated = false;
}

Hub.prototype.draw = function(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	//ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.strokeStyle = 'black';
	for (i = 0; i < this.desks.length; i++){
		var tmpDesk = this.desks[i];
		if (tmpDesk.state == 0){
			ctx.fillStyle = 'green';
		}
		else if (tmpDesk.state == 1){
			ctx.fillStyle = 'yellow';
		}
		else{
			ctx.fillStyle = 'red';
		}
		ctx.fillRect(tmpDesk.x, tmpDesk.y, tmpDesk.w, tmpDesk.h);
		//ctx.clear(true);
		ctx.beginPath();
		ctx.rect(tmpDesk.x, tmpDesk.y, tmpDesk.w, tmpDesk.h);
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

var Floor = function(id, name){
    this.id = id;
	this.name = name;
	this.hubs = [];
}

Floor.prototype.updateDisplay = function(){
    
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
	
Floor.prototype.initDesks = function(parentHub){
	var dataFile = new XMLHttpRequest();
	// Get the deskhubs for the floor
	dataFile.open('get', 'http://seatspotter.azurewebsites.net/seatspotter/webapi/deskhubs/' + parentHub.id + '/desks', true);
    dataFile.send();
	dataFile.onreadystatechange = populateHub(dataFile, parentHub);
}

function populateHub(dataFile, parentHub){
	return function(){
		if (dataFile.readyState == 4){
			var str = dataFile.responseText;
			var obj = JSON.parse(str);
			for (i = 0; i < obj.length; i++){
				var id = obj[i]['deskId'];
				var hubId = obj[i]['deskHubId'];
				var x = Math.round(parentHub.x + parentHub.w * obj[i]['coordinateX'] / 100);
				var y = Math.round(parentHub.y + parentHub.h * obj[i]['coordinateY'] / 100);
				var w = Math.round(parentHub.w * obj[i]['lengthX'] / 100);
				var h = Math.round(parentHub.h * obj[i]['lengthY'] / 100);
				var state = obj[i]['deskState'];
				parentHub.desks.push(new Desk(id, hubId, x, y, w, h, state));
			}
			parentHub.populated = true;
			parentHub.draw();
		}
	};
}

Floor.prototype.initHubs = function(){
	var dataFile = new XMLHttpRequest();
	// Get the deskhubs for the floor
	dataFile.open('get', 'http://seatspotter.azurewebsites.net/seatspotter/webapi/floors/' + this.id + '/deskhubs', true);
    dataFile.send();
    dataFile.onreadystatechange = function(){
        if (dataFile.readyState == 4){
			var str = dataFile.responseText;
			var obj = JSON.parse(str);
			library.clearCanvas();
			library.currentFloor.hubs = [];
			for (i = 0; i < obj.length; i++){
				var x = Math.round(canvasW * (obj[i]['coordinateX'] / 100));
				var y = Math.round(canvasH * (obj[i]['coordinateY'] / 100));
				var w = Math.round(canvasW * (obj[i]['lengthX'] / 100));
				var h = Math.round(canvasH * (obj[i]['lengthY'] / 100));
				// library.currentFloor.hubs.push(new Hub(obj[i]['deskHubId'], obj[i]['coordinateX'], obj[i]['coordinateY'], obj[i]['lengthX'], obj[i]['lengthY']))
				var tmpHub = new Hub(obj[i]['deskHubId'], x, y, w, h)
				library.currentFloor.hubs.push(tmpHub)
				library.currentFloor.initDesks(tmpHub);
			}
		}
	}
}

// Library class
var Library = function(){
    this.id = -1;
	this.floors = new Array();
	//this.hubs = new Array();
    this.currentFloor = 0;      // hold a reference to the current floor
    this.name = "";
    
    // Get the library selected by the user
    var queryValue = self.location.search;
	var regex = new RegExp("[?&]id(=([^&#]*)|&|#|$)"), queryValue = regex.exec(queryValue);
    this.id = queryValue[2];
	
	this.updateTitle();
	this.initFloors();
}

Library.prototype.clearCanvas = function(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0, canvas.width, canvas.height);
}

Library.prototype.initFloors = function(){
	var dataFile = new XMLHttpRequest();
	dataFile.open('get', 'http://seatspotter.azurewebsites.net/seatspotter/webapi/libraries/' + this.id + '/floors', true);
    dataFile.send();
    dataFile.onreadystatechange = function(){
        if (dataFile.readyState == 4){
            var str = dataFile.responseText;
			var obj = JSON.parse(str);
			library.floors = []
			for (i = 0; i < obj.length; i++){
				
				// Save basic floor information (ID and name)
				var floor = new Floor(obj[i]['floorId'], obj[i]['floorLevel']);
				library.floors.push(new Floor(obj[i]['floorId'], obj[i]['floorLevel']));
				
				// Create list of floors at the top of the page
				if (i == 0){
					var tmp = document.createTextNode(obj[i]['floorLevel']);
					document.getElementById('floorList').appendChild(tmp);
				}
				else{
					var a = document.createElement('a');
					var text = document.createTextNode(obj[i]['floorLevel']);
					a.appendChild(text);
					a.href = "javascript:";     // this makes the link do nothing when clicked
					//console.log(library);
					//a.addEventListener('click', function(){library.changeFloor(library.floors[i].name)}, false);
					a.onclick = function(){library.changeFloor( this.innerHTML );};
					document.getElementById('floorList').appendChild(a);
					
				}
				
				// add space if not at the last floor
				if (i < obj.length - 1){
					var space = document.createTextNode(" ");
					document.getElementById('floorList').appendChild(space);
				}
			}
			library.currentFloor = library.floors[0];
			library.floors[0].initHubs();
		}
	}
}

Library.prototype.updateTitle = function(){
	var dataFile = new XMLHttpRequest();
	dataFile.open('get', 'http://seatspotter.azurewebsites.net/seatspotter/webapi/libraries/' + this.id, true);
    dataFile.send();
    dataFile.onreadystatechange = function(){
        if (dataFile.readyState == 4){
            var str = dataFile.responseText;
			var obj = JSON.parse(str);
			library.name = obj['libraryName'];
			document.getElementById('libraryName').innerHTML = library.name;
		}
	}
}

// Update the floor links, and disabling the link for the currently displayed floor
Library.prototype.updateFloorLinks = function(){
    //clear the current links
    document.getElementById('floorList').innerHTML = "";
    
    var i;
    for (i = 0; i < this.floors.length; i++){
        if (this.currentFloor == this.floors[i]){
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
	this.clearCanvas();
    var floorIndex = this.getFloorIndex(floorName); 
    library.currentFloor = library.floors[floorIndex];
    library.currentFloor.initHubs(); // may want to disable redraw before this
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
    }
    
    //console.log(minDistances);
    
    // Get the median distance of the space between desks
    minDistances.sort();
    var median;
    if (minDistances.length % 2 == 0)
        median = (minDistances[minDistances.length/2 - 1] + minDistances[minDistances.length/2 - 1])/2
    else
        median = minDistances[minDistances.length/2 - 0.5];
    
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

// start the application
var library = new Library();

// Initialize variables
canvasW = document.getElementById('canvas').width;
canvasH = document.getElementById('canvas').height;

// assign function to buttons
document.getElementById("button2seats").onclick = function(){library.floors[library.currentFloor].getFreeGroup(2);};
document.getElementById("button3seats").onclick = function(){library.floors[library.currentFloor].getFreeGroup(3);};
document.getElementById("button4seats").onclick = function(){library.floors[library.currentFloor].getFreeGroup(4);};
document.getElementById("button5seats").onclick = function(){library.floors[library.currentFloor].getFreeGroup(5);};
