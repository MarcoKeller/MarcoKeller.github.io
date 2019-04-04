var canvas;
var ctx;
var ratio;

// Index am rand
const RANDINDEX_Y = 40;
const RANDINDEX_X = 220;
const DIFF_KREIS_RECHTECK = 20;

//Radius
var PUNKTRADIUS = 20;
var KREISRADIUS = 6.5 * PUNKTRADIUS;

const VERTICAL_OFFSET_X = 150; 
const VERTICAL_PLUS_Y = 60;

//Zeitintervall für Bildschirmwiederholung
var refresh = 10;
//ID von setIntervall;
var refreshID;

//Aktuell ausgelesene Werte der Orientierungssensoren
var accelx = 0.0;
var accely = 0.0;
var accelz = 0.0;

// Vorzeichen der ausgelesenen Orientierungssensoren (Bei iOS um Faktor -1 anders als beim Rest)
var iOS_X = 1.0;
var iOS_Y = 1.0;
var iOS_Z = 1.0;

//InitialPosition der drei Punkte im mode 0
var INIT_X_1 = RANDINDEX_X + PUNKTRADIUS;
var INIT_Y_1 = RANDINDEX_Y + KREISRADIUS;
var INIT_X_2 = RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS;
var INIT_Y_2 = RANDINDEX_Y + DIFF_KREIS_RECHTECK + PUNKTRADIUS + 2 * KREISRADIUS;
var INIT_X_3 = RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS;
var INIT_Y_3 = RANDINDEX_Y + KREISRADIUS;

var points = [];
points[0] = { x: INIT_X_1, y: INIT_Y_1, radius: PUNKTRADIUS };
points[1] = { x: INIT_X_2, y: INIT_Y_2, radius: PUNKTRADIUS };
points[2] = { x: INIT_X_3, y: INIT_Y_3, radius: PUNKTRADIUS };
// Anzeigemodus (0 = Alles, 1 = Vertical, 2 = Horizontal)
var mode = 0;

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPod|iPad/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return ((isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()));
    }
}; 

function startWasserwaage() {
	var result = 'No mobile device';
    if (isMobile.any()) {
        result = 'Your on a mobile device';
    }
    alert(result);
    if (!isMobile.iOS()) {
    	iOS_X = -1.0;
		iOS_Y = -1.0;
		iOS_Z = -1.0;
        result = 'no iOS Operation System';
    } else {
    	iOS_X = 1.0;
		iOS_Y = 1.0;
		iOS_Z = 1.0;
    	result = 'You have iOS';
    }
    alert(result);

	initCanvas();
    setScreen();
    accelx = 0.0;
    accely = 0.0;
    accelz = 0.0;   

    refresh = 75;
    mode = 0;
	refreshID = setInterval(draw, refresh);
    canvas.webkitRequestFullScreen();
}

function initCanvas(){
	canvas = document.createElement('canvas');		
	canvas.id = "myCanvas";
	canvas.width = "800";
	canvas.height = "400";
	canvas.style = "border:1px solid #61210B;";		
	document.body.appendChild(canvas);
	if(canvas.getContext){
        ctx = canvas.getContext('2d');
    }
}

function setScreen(){
            var width = canvas.width;
            var height = canvas.height;        
            //canvas.webkitRequestFullScreen();                
			ratio = width / height;
            //Höhe und Breite passend zum Seitenverhältnis

            var heightval;
            var widthval;
			//innerWidth/innerHeight < 4:3
			if ((innerWidth / innerHeight) < ratio) {
				//Scrollbalken verhindern => -16
				widthval = window.innerWidth - 16;
				heightval = (widthval / ratio) - 16;
                canvas.style.height = heightval + "px";
                canvas.style.width = widthval + "px";
            //innerWidth/innerHeight >= 4:3
			} else {
				heightval = window.innerHeight - 16;
				widthval = (heightval * ratio) - 16;
                canvas.style.height = heightval + "px";
                canvas.style.width = widthval + "px";
			}		
		}

function draw(){
    setScreen();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //mode = 1;
	switch(mode) {
        case 0:
            drawBackgroundAll();
            break;
        case 1:
            drawBackgroundVertical();
            break;
        case 2:
            drawBackgroundHorizontal();
            break;
    }
    setPointsPosition();
    checkCollision();
    drawPoints();    
}

function drawBackgroundVertical() {
    ctx.fillStyle = 'hsla(120,100%,50%,0.2)';
    ctx.strokeRect(RANDINDEX_X + VERTICAL_OFFSET_X, RANDINDEX_Y, 2 * PUNKTRADIUS, 2 * KREISRADIUS + VERTICAL_PLUS_Y);
    ctx.fillRect(RANDINDEX_X + VERTICAL_OFFSET_X, RANDINDEX_Y, 2 * PUNKTRADIUS, 2 * KREISRADIUS + VERTICAL_PLUS_Y);
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(RANDINDEX_X + VERTICAL_OFFSET_X, RANDINDEX_Y + KREISRADIUS - PUNKTRADIUS - 2 + (VERTICAL_PLUS_Y/2));
        ctx.lineTo(RANDINDEX_X + VERTICAL_OFFSET_X + 2 * PUNKTRADIUS, RANDINDEX_Y + KREISRADIUS - PUNKTRADIUS - 2 + (VERTICAL_PLUS_Y/2));
        ctx.stroke();
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(RANDINDEX_X + VERTICAL_OFFSET_X, RANDINDEX_Y + KREISRADIUS + PUNKTRADIUS + 2 + (VERTICAL_PLUS_Y/2));
        ctx.lineTo(RANDINDEX_X + VERTICAL_OFFSET_X + 2 * PUNKTRADIUS, RANDINDEX_Y + KREISRADIUS + PUNKTRADIUS + 2 + (VERTICAL_PLUS_Y/2));
        ctx.stroke();
}

function drawBackgroundHorizontal() {
    ctx.fillStyle = 'hsla(120,100%,50%,0.2)';

    ctx.strokeRect(RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK ,RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK,
                 2 * KREISRADIUS, 2 * PUNKTRADIUS);
    ctx.fillRect(RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK ,RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK,
                 2 * KREISRADIUS, 2 * PUNKTRADIUS);
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(RANDINDEX_X + PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK - 2, RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK);
        ctx.lineTo(RANDINDEX_X + PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK - 2, 
                    RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK + 2 * PUNKTRADIUS);
        ctx.stroke();
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(RANDINDEX_X + 3 * PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK + 2, RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK);
        ctx.lineTo(RANDINDEX_X + 3 * PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK + 2, 
                    RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK + 2 * PUNKTRADIUS);
        ctx.stroke();
}

function drawBackgroundAll() {
	// Kreis
	ctx.beginPath();
        ctx.arc(RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS,
         		RANDINDEX_Y + KREISRADIUS, KREISRADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(120,100%,50%,0.2)";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    ctx.beginPath();
        ctx.arc(RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS,
        		 RANDINDEX_Y + KREISRADIUS, PUNKTRADIUS + 2, 0, Math.PI * 2);
        //ctx.fillStyle = "#f4f4f4";
        //ctx.fill();
        ctx.stroke();
        ctx.closePath();

    // vertikales Rechteck
    ctx.fillStyle = 'hsla(120,100%,50%,0.2)';
    ctx.strokeRect(RANDINDEX_X, RANDINDEX_Y, 2 * PUNKTRADIUS, 2 * KREISRADIUS);
    ctx.fillRect(RANDINDEX_X, RANDINDEX_Y, 2 * PUNKTRADIUS, 2 * KREISRADIUS);
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(RANDINDEX_X, RANDINDEX_Y + KREISRADIUS - PUNKTRADIUS - 2);
        ctx.lineTo(RANDINDEX_X + 2 * PUNKTRADIUS, RANDINDEX_Y + KREISRADIUS - PUNKTRADIUS - 2);
        ctx.stroke();
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(RANDINDEX_X, RANDINDEX_Y + KREISRADIUS + PUNKTRADIUS + 2);
        ctx.lineTo(RANDINDEX_X + 2 * PUNKTRADIUS, RANDINDEX_Y + KREISRADIUS + PUNKTRADIUS + 2);
        ctx.stroke();

    //Horizontales Rechteck
    ctx.fillStyle = 'hsla(120,100%,50%,0.2)';

    ctx.strokeRect(RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK ,RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK,
    			 2 * KREISRADIUS, 2 * PUNKTRADIUS);
    ctx.fillRect(RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK ,RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK,
                 2 * KREISRADIUS, 2 * PUNKTRADIUS);
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(RANDINDEX_X + PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK - 2, RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK);
        ctx.lineTo(RANDINDEX_X + PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK - 2, 
        			RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK + 2 * PUNKTRADIUS);
        ctx.stroke();
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(RANDINDEX_X + 3 * PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK + 2, RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK);
        ctx.lineTo(RANDINDEX_X + 3 * PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK + 2, 
        			RANDINDEX_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK + 2 * PUNKTRADIUS);
        ctx.stroke();
}

function setPointsPosition() {
    points[0].y = INIT_Y_1 + (KREISRADIUS - PUNKTRADIUS) * accely;

    points[1].x = INIT_X_2 + (KREISRADIUS - PUNKTRADIUS) * accelx;

    points[2].y = INIT_Y_3 + (KREISRADIUS - PUNKTRADIUS) * accely;
    points[2].x = INIT_X_3 + (KREISRADIUS - PUNKTRADIUS) * accelx;
}

function checkCollision() {
    if(points[0].y <= RANDINDEX_Y + PUNKTRADIUS) {
        points[0].y = RANDINDEX_Y + PUNKTRADIUS;
    }
    if(points[0].y >= RANDINDEX_Y + 2 * KREISRADIUS - PUNKTRADIUS) {
        points[0].y = RANDINDEX_Y + 2 * KREISRADIUS - PUNKTRADIUS;
    }
    if(points[1].x <= RANDINDEX_X + 3 * PUNKTRADIUS + DIFF_KREIS_RECHTECK) {
        points[1].x = RANDINDEX_X + 3 * PUNKTRADIUS + DIFF_KREIS_RECHTECK;
    }
    if(points[1].x >= RANDINDEX_X + PUNKTRADIUS + DIFF_KREIS_RECHTECK + 2 * KREISRADIUS) {
        points[1].x = RANDINDEX_X + PUNKTRADIUS + DIFF_KREIS_RECHTECK + 2 * KREISRADIUS;
    }

    if(getDistanceBetweenPositions(INIT_X_3, INIT_Y_3, points[2].x, points[2].y) > (KREISRADIUS - PUNKTRADIUS)) {
        var tempx = getCircleValueX(INIT_X_3, (points[2].y - INIT_Y_3), (points[2].x - INIT_X_3), (KREISRADIUS - PUNKTRADIUS));
        var tempy = getCircleValueY(INIT_Y_3, (points[2].y - INIT_Y_3), (points[2].x - INIT_X_3), (KREISRADIUS - PUNKTRADIUS));
        points[2].x = tempx;
        points[2].y = tempy;
    }

}

function getCircleValueX(offset, rangeY, rangeX, radian) {
    if(rangeX == 0) {
        return 0;
    }
    if(rangeX < 0) {
        return offset + radian * Math.cos(Math.atan(rangeY/rangeX)) * (-1);
    }
    return offset + radian * Math.cos(Math.atan(rangeY/rangeX));
}
function getCircleValueY(offset, rangeY, rangeX, radian) {
    if(rangeX == 0) {
        return 0;
    }
    if(rangeX < 0) {
        return offset + radian * Math.sin(Math.atan(rangeY/rangeX)) * (-1);
     }
    return offset + radian * Math.sin(Math.atan(rangeY/rangeX));
}

function getDistanceBetweenPositions(StartX, StartY, EndX, EndY) {
    var distanceX = StartX - EndX;
    var distanceY = StartY - EndY;
    return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
}

function drawPoints() {
		var min = 0;
        var max = 3;
        switch(mode) {
            case 0: break;
            case 1: max = 1; break;
            case 2: min = 1; max = 2; break;
        }
        for(var i = min; i < max; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, PUNKTRADIUS, 0, Math.PI * 2);
            ctx.fillStyle = "#04B45F";
            ctx.fill();
            ctx.closePath();
        }
}

//Ermittelt die Beschleunigung entsprechend der Bildschirmorientierung
if (window.DeviceOrientationEvent) {
    window.addEventListener("devicemotion", function (event) {
    	switch (window.orientation) {
        	case 0:
            	accelz = event.accelerationIncludingGravity.z * (-1);
            	//document.getElementById('test').firstChild.text = accelz;
            	if(-3 <= accelz && accelz <= 3) {
                	accelx = event.accelerationIncludingGravity.x * (-1);
                	accely = event.accelerationIncludingGravity.y;
                	if(!(accely <= 8 && accely >= -8)) {
                    	mode = 2;
                    	break;
	                }
    	            if(!(accelx <= 8 && accelx >= -8)) {
        	            mode = 1;
            	        break;
                	}
	            } else {
    	            mode = 0;
        	        accelx = event.accelerationIncludingGravity.x * (-1);
            	    accely = event.accelerationIncludingGravity.y;
	            }
    	        break;
        	case -90:
            	accelx = event.accelerationIncludingGravity.y * (-1);
	            accely = event.accelerationIncludingGravity.x * (-1);
    	        accelz = event.accelerationIncludingGravity.z * (-1);
        	    break;
            case 90:
	            accelx = event.accelerationIncludingGravity.y;
    	        accely = event.accelerationIncludingGravity.x;
        	    accelz = event.accelerationIncludingGravity.z * (-1);
            	break;
	        case 180:
    	        accelx = event.accelerationIncludingGravity.x;
        	    accely = event.accelerationIncludingGravity.y * (-1);
            	accelz = event.accelerationIncludingGravity.z * (-1);
 	            break;
    	}
	}, true);
} else {
    alert("Sorry, ihr Gerät unterstützt keine Bildschirmorientierung!");
}
