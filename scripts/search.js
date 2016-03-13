// search.js

var clearHighlightTime = 5000;
var highlightIntId = 0;
var distanceThreshold = 1.2;
var medianDist = 0;

// Returns the distance in pixels between two desks
function getDeskDistance(d1, d2){
	return Math.sqrt( Math.pow(d2.x - d1.x, 2) + Math.pow(d2.y - d1.y, 2) );
}

function getHubMedian(hub){
	var i, j
	var dist = [];
	var tmpD;
	for (i = 0; i < hub.desks.length; i++){
		dist[i] = Number.MAX_SAFE_INTEGER;
		for (j = 0; j < hub.desks.length; j++){
			if (i != j){
				tmpD = getDeskDistance(hub.desks[i], hub.desks[j]);
				if (tmpD < dist[i]){
					dist[i] = tmpD;
				}
			}
		}
	}
	return getMedian(dist);
}

// Get the median of an array
function getMedian(arr){
	arr.sort();
	if (arr.length % 2 == 0){
		return (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2;
	}
	else{
		return arr[Math.floor(arr.length / 2)];
	}
}

// Returns the median distance between each desk
function getFloorMedian(floor){
	var i, j, k;
	var desks = getDesks(floor, -1);
	var minDist = []; 
	
	// get the median minimum distances for each hub
	for(i = 0; i < floor.hubs.length; i++){
		minDist[i] = getHubMedian(floor.hubs[i]);
	}
	// console.log(minDist);
	return getMedian(minDist);
}

// return an array of all desks on the floor with a specified state (-1 for all)
function getDesks(floor, state){
	var i, j;
	var desks = [];
	for(i = 0; i < floor.hubs.length; i++){
		for(j = 0; j < floor.hubs[i].desks.length; j++){
			if (state == -1){
				desks.push(floor.hubs[i].desks[j]);	
			}
			else if (floor.hubs[i].desks[j].state == state){
				desks.push(floor.hubs[i].desks[j]);
			}
		}
	}
	return desks;
}

// Checks if a desk is across from another (function assumes that the 2 desks are within range)
function isDeskAcross(d1, d2){
	if (d1.lDesk == d2 || d1.rDesk == d2){
		if (d1.uDesk != null && d1.dDesk != null)
			return true;
		else
			return false;
	}
	else if (d1.uDesk == d2 || d1.dDesk == d2){
		if (d1.lDesk != null && d1.rDesk != null)
			return true;
		else
			return false;
	}
}

// given a desk, and an array of desks, the function will return a list of desks that are nearby
// the nearby desks will be removed from the original array and sent back to the caller
function getNearbyDesks(desk, arr){
	var output = [];
	var uBound = medianDist * distanceThreshold;
	var i;
	var d = 0;
	for(i = arr.length - 1; i >= 0; i--){
		d = getDeskDistance(desk, arr[i]);
		if (d < uBound && !( isDeskAcross(desk, arr[i]) )){
			output.push(arr.splice(i,1)[0]);
		}
	}
	return [output, arr];
}

// For each desk, identify nearby desks and save references on each nearby desk
Floor.prototype.populateNearbyDesks = function(){
	var i;
	var desks = [];
	desks = getDesks(this, -1);
	for (i = 0; i < desks.length; i++){
		getNearbyDesksDirectional(desks[i], desks);
	}
}

// Locate nearby desks, including their direction, and update the desk object with references/IDs to those nearby desks
function getNearbyDesksDirectional(desk, arr){
	var uBound = medianDist * distanceThreshold;
	var dX, dY
	var i;
	for (i = 0; i < arr.length; i++){
		if (desk.id != arr[i].id && getDeskDistance(desk, arr[i]) < uBound ){
			dX = arr[i].x - desk.x;
			dY = arr[i].y - desk.y;
			if (Math.abs(dX) > Math.abs(dY)){
				if (dX > 0) desk.rDesk = arr[i];
				else desk.lDesk = arr[i];
			}
			else{
				if (dY > 0) desk.dDesk = arr[i];
				else desk.uDesk = arr[i];
			}
		}
	}
}

// Append 2 arrays
function appendArrays(arr1, arr2){
	var i;
	for ( i = 0; i < arr2.length; i++){
		arr1.push(arr2[i]);
	}
	return arr1;
}

// Return extra desks from an array of desks
function returnDesks(group, arr, numFree){
	while (group.length > numFree){
		arr.push(group.splice(group.length-1, 1)[0]);
	}
}

// Given an array of desks and a number, return an array of groups of desks
function getDeskGroups(desks, numFree){
	var i, j;
	var tempGroup = [];
	var output = [];
	var tmp;
	
	while (desks.length > 0){
		tempGroup.push(desks.splice(0,1)[0]);
		i = 0
		while (i < tempGroup.length){
			tmp = getNearbyDesks( tempGroup[i], desks );
			tempGroup = appendArrays(tempGroup, tmp[0]);
			desks = tmp[1];
			i++;
			if (tempGroup.length == numFree){
				break;
			}
			else if (tempGroup.length > numFree){
				returnDesks(tempGroup, desks, numFree);
				break;
			}
		}
		if (tempGroup.length == numFree)
			output.push(tempGroup.slice());
		tempGroup = [];
	}
	return output;
}

// Check if a desk is in an array
function isInArray(desk, arr){
	var i;
	for (i = 0; i < arr.length; i++){
		if (desk == arr[i]) return true
	}
	return false;
}

// Return an array of lines needed to highlight a single desk in a group
// line format: [x1,y1,x2,y2]
function getDeskLines(desk, arr){
	var output = [];
	if (!isInArray(desk.rDesk, arr))
		output.push([desk.x + desk.w, desk.y, desk.x + desk.w, desk.y + desk.h ])
	if (!isInArray(desk.dDesk, arr))
		output.push([desk.x, desk.y + desk.h, desk.x + desk.w, desk.y + desk.h ])
	if (!isInArray(desk.lDesk, arr))
		output.push([desk.x, desk.y, desk.x, desk.y + desk.h ])
	if (!isInArray(desk.uDesk, arr))
		output.push([desk.x, desk.y, desk.x + desk.w, desk.y ])
	return output;
}

// Return an array of lines needed to highlight a group of desks
function getGroupLines(desks){
	var i;
	var lines = [];
	var tempLines = [];
	for(i = 0; i < desks.length; i++){
		tempLines = getDeskLines(desks[i], desks);
		lines = appendArrays(lines, tempLines);
	}
	return lines;
}

// Draw highlight given an array of lines
function highlightGroup(desks){
	var i;
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var lines;
	lines = getGroupLines(desks);
	ctx.shadowBlur = 20;
	ctx.shadowColor = 'black';
	ctx.strokeStyle = 'cyan';
	ctx.lineWidth = 6;
	ctx.lineCap = 'round';
	ctx.beginPath();
	for (i = 0; i < lines.length; i++){
		ctx.moveTo(parseInt(lines[i][0]), parseInt(lines[i][1]));
		ctx.lineTo(parseInt(lines[i][2]), parseInt(lines[i][3]));
	}
	ctx.stroke();
	ctx.shadowBlur = 0;
	
	clearTimeout(highlightIntId);
	//highlightIntId = window.setInterval(function(){clearInterval(highlightIntId); library.currentFloor.draw(); }, clearHighlightTime);
	highlightIntId = setTimeout(function(){library.currentFloor.draw(); highlightIntId = 0;}, clearHighlightTime);
}

//testFunction();
function testFunction(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.moveTo(5,5);
	ctx.lineTo(50,5);
	ctx.moveTo(5,20);
	ctx.lineTo(50,20);
	ctx.stroke();
}

// Highlight a group of desks
function highlightGroup_OLD(desks){
	var i;
	// get top left and bottom right corners
	var topLeft = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
	var bottomRight = [0,0];
	for (i = 0; i < desks.length; i++){
		if (desks[i].x < topLeft[0]) topLeft[0] = desks[i].x;
		if (desks[i].y < topLeft[1]) topLeft[1] = desks[i].y;
		if (desks[i].x + desks[i].w > bottomRight[0]) bottomRight[0] = desks[i].x + desks[i].w;
		if (desks[i].y + desks[i].h > bottomRight[1]) bottomRight[1] = desks[i].y + desks[i].h;
	}
	
	// Draw blue rectangle
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	ctx.shadowBlur = 20;
	ctx.shadowColor = 'black';
	ctx.strokeStyle = 'cyan';
	ctx.lineWidth = 6;
	ctx.beginPath();
	ctx.rect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0] , bottomRight[1] - topLeft[1] );
	ctx.stroke();
	
	ctx.shadowBlur = 0;
	
	clearInterval(highlightIntId);
	highlightIntId = window.setInterval(function(){clearInterval(highlightIntId); library.currentFloor.draw(); }, clearHighlightTime);
}

Floor.prototype.getFreeGroup = function(numFree){
	var i, j;
	var desks = [];
	var groups = [];
	
	//clearInterval(highlightIntId);
	
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	desks = getDesks(this, 0);
	if (medianDist == 0){
		medianDist = getFloorMedian(this);
	}
	groups = getDeskGroups(desks, numFree);
	this.draw();
	for(i = 0; i < groups.length; i++){
		highlightGroup(groups[i]);
	}
	ctx.stroke();
	console.log(groups);
}

Floor.prototype.getFreeGroup_OLD = function(numFree){
    
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

// assign function to buttons
document.getElementById("button2seats").onclick = function(){library.currentFloor.getFreeGroup(2);};
document.getElementById("button3seats").onclick = function(){library.currentFloor.getFreeGroup(3);};
document.getElementById("button4seats").onclick = function(){library.currentFloor.getFreeGroup(4);};
document.getElementById("button5seats").onclick = function(){library.currentFloor.getFreeGroup(5);};