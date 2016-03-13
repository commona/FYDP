
// TODO:
// put number of free tables beside floor numbers
// make group box blink
// investigate possible failure points in script
// comment code

// TODO (next term?):
// take into account seat orientation when looking for groups of empty seats

// COMMON CONSOLE COMMANDS
// clearInterval(intervalID)

var intervalID;             // ID for the timer that redraws the seats
const REDRAW_TIME = 60000;   // amount of time (in ms) for desk statuses to be refreshed
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
	
	// identify which desks are nearby in which direction they are in
	var rDesk, dDesk, lDesk, uDesk;
}

Desk.prototype.draw = function(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	// Interior
	if (this.state == 0){
		ctx.fillStyle = 'green';
	}
	else if (this.state == 1){
		ctx.fillStyle = 'yellow';
	}
	else{
		ctx.fillStyle = 'red';
	}
	ctx.fillRect(this.x, this.y, this.w, this.h);
	
	// Outline
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 2;
	ctx.beginPath();
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
	var i;
	for (i = 0; i < this.desks.length; i++){
		this.desks[i].draw();
	}
}

// Given a desk id, return the desk object
Hub.prototype.getDesk = function(id){
	for (i = 0; i < this.desks.length; i++){
		if (this.desks[i].id == id){
			return this.desks[i];
		}
	}
}

var Floor = function(id, name){
    this.id = id;
	this.name = name;
	this.hubs = [];
	this.hubReadyCount = 0;
}

Floor.prototype.draw = function(){
	var i;
	//clearInterval(highlightIntId);
	library.clearCanvas();
	for (i = 0; i < library.currentFloor.hubs.length; i++){
		library.currentFloor.hubs[i].draw();
	}
	console.log('floor re-drawn');
}

Floor.prototype.updateDisplay = function(){
	var dataFile = new XMLHttpRequest();
	var i;
	this.draw();
	for (i = 0; i < this.hubs.length; i++){
		this.hubs[i].update();
		
		// dataFile.open('get', 'http://seatspotter.azurewebsites.net/seatspotter/webapi/deskhubs/' + this.hubs[i].id + '/desks', true);
		// dataFile.send();
		// dataFile.onreadystatechange = updateHub(dataFile, this.hubs[i]);
		
		
		// dataFile.onreadystatechange = function(i){return function(){console.log('new data received'); updateHub(dataFile, this.hubs[i]);};};
		// dataFile.onreadystatechange = function(i){
			// return function(){
				// console.log('updating hub ' + i);
				// updateHub(dataFile, this.hubs[i]);
			// }
		// }
	}
	
	clearInterval(intervalID);
    intervalID = window.setInterval(function(){library.currentFloor.updateDisplay();}, REDRAW_TIME);
	console.log('Screen updated: ' + Date())
}

Hub.prototype.update = function(){
	var dataFile = new XMLHttpRequest();
	var parentHub = this;
	dataFile.open('get', 'http://seatspotter.azurewebsites.net/seatspotter/webapi/deskhubs/' + this.id + '/desks', true);
	dataFile.send();
	dataFile.onreadystatechange = updateHub(dataFile, parentHub);
}

function updateHub(dataFile, parentHub){
	return function(){
		if (dataFile.readyState == 4){
			var str = dataFile.responseText;
			var obj = JSON.parse(str);
			for (i = 0; i < obj.length; i++){
				var id = obj[i]['deskId'];
				var hubId = obj[i]['deskHubId'];
				var state = obj[i]['deskState'];
				var desk = parentHub.getDesk(id);
				if (desk.state != state){
					desk.state = state;
					desk.draw();
				}
			}
			parentHub.draw();
		}
	};
}

function updateHubOLD(dataFile, parentHub){
	return function(){
		if (dataFile.readyState == 4){
			console.log('updating hub ' + parentHub.id);
			
			var str = dataFile.responseText;
			var obj = JSON.parse(str);
			for (i = 0; i < obj.length; i++){
				var id = obj[i]['deskId'];
				var hubId = obj[i]['deskHubId'];
				var state = obj[i]['deskState'];
				var desk = parentHub.getDesk(id);
				if (desk.state != state){
					desk.state = state;
					desk.draw();
				}
			}
			parentHub.draw();
			
		}
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
				var tmpDesk = new Desk(id, hubId, x, y, w, h, state);
				parentHub.desks.push(tmpDesk);
			}
			parentHub.populated = true;
			library.currentFloor.hubReadyCount++;
			parentHub.draw();
			if (library.currentFloor.hubReadyCount == library.currentFloor.hubs.length){
				medianDist = getFloorMedian(library.currentFloor);
				library.currentFloor.populateNearbyDesks();
			}
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
			clearInterval(intervalID);
			intervalID = window.setInterval(function(){library.currentFloor.updateDisplay();}, REDRAW_TIME);
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
	clearInterval(intervalID);
	medianDist = 0;
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



// randomize seat statuses to demonstrate locating groups of free desks
document.getElementById("buttonRandom").onclick = function(){
    
	// Stop polling
	clearInterval(intervalID);
	
    // randomize statuses
	var i, j;
    for (i = 0; i < library.currentFloor.hubs.length; i++){
		for (j = 0; j < library.currentFloor.hubs[i].desks.length; j++){
			var randStatus = Math.floor(Math.random() * 4);
			// Make the chance of a free seat higher
			if (randStatus == 3){
				randStatus = 0;
			}
			library.currentFloor.hubs[i].desks[j].state = randStatus;
		}
		//library.currentFloor.hubs[i].draw();
	}
	library.currentFloor.draw();
}

// Manually poll
document.getElementById('buttonPoll').onclick = function(){
	library.currentFloor.updateDisplay();
}

// start the application
var library = new Library();

// Initialize variables
canvasW = document.getElementById('canvas').width;
canvasH = document.getElementById('canvas').height;


