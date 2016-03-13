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

// Draw highlight lines given a group of desks
function highlightGroup(desks){
	var i;
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var lines;
	lines = getGroupLines(desks);
	
	//ctx.beginPath();
	for (i = 0; i < lines.length; i++){
		ctx.moveTo(parseInt(lines[i][0]), parseInt(lines[i][1]));
		ctx.lineTo(parseInt(lines[i][2]), parseInt(lines[i][3]));
	}
	
	clearTimeout(highlightIntId);
	//highlightIntId = window.setInterval(function(){clearInterval(highlightIntId); library.currentFloor.draw(); }, clearHighlightTime);
	highlightIntId = setTimeout(function(){library.currentFloor.draw(); highlightIntId = 0;}, clearHighlightTime);
}


Floor.prototype.getFreeGroup = function(numFree){
	var i, j;
	var desks = [];
	var groups = [];
	
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	desks = getDesks(this, 0);
	if (medianDist == 0){
		medianDist = getFloorMedian(this);
	}
	groups = getDeskGroups(desks, numFree);
	this.draw();
	
	ctx.beginPath();
	for(i = 0; i < groups.length; i++){
		highlightGroup(groups[i]);
	}
	ctx.shadowBlur = 20;
	ctx.shadowColor = 'black';
	ctx.strokeStyle = 'cyan';
	ctx.lineWidth = 6;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.shadowBlur = 0;
	console.log(groups);
}


// assign function to buttons
document.getElementById("button2seats").onclick = function(){library.currentFloor.getFreeGroup(2);};
document.getElementById("button3seats").onclick = function(){library.currentFloor.getFreeGroup(3);};
document.getElementById("button4seats").onclick = function(){library.currentFloor.getFreeGroup(4);};
document.getElementById("button5seats").onclick = function(){library.currentFloor.getFreeGroup(5);};