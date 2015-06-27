// My personal code

var intervalID = window.setInterval(draw, 1000);

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

draw();
