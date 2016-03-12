// homepage
console.log('starting homepage script...');
var dataFile = new XMLHttpRequest();

dataFile.open('get','http://seatspotter.azurewebsites.net/seatspotter/webapi/libraries',true);
//dataFile.open('get','https://www.codecademy.com/',true);

// var script = document.createElement('script');
// script.src = 'http://seatspotter.azurewebsites.net/seatspotter/webapi/libraries';
// document.getElementsByTagName('head')[0].appendChild(script);

dataFile.send();
dataFile.onreadystatechange = function(){
    if (dataFile.readyState == 4){
		var str = dataFile.responseText;
		var tmp = JSON.parse(str);
		console.log("data pulled from link: ");
		populateLibraries(tmp);
		//console.log(str);
	}
}

populateLibraries = function(obj){
	console.log(obj)
	var table = document.getElementById("libraryTable");
	for (i = 0; i < obj.length; i++){
		var row = table.insertRow(table.rows.length);
		row.insertCell(0).innerHTML = '<a href="libraries/library.html?id=' + obj[i]["libraryId"].toString() + '">' + obj[i]["libraryName"] + '</a>';
		row.insertCell(1).innerHTML = obj[i]["emptyDesks"];
		row.insertCell(2).innerHTML = obj[i]["totalDesks"];
	}
}

// function processJSONPResponse(data) {
    // console.log('processing json');
	// var dataFromServer = data;
// }