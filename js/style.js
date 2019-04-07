var canvas;
var ctx;
var ratio;

//Radius
var PUNKTRADIUS;
var KREISRADIUS;

// Index am Rand (wird für jeden Mode angepasst)
var OFFSET_X;
var OFFSET_Y;
const DIFF_KREIS_RECHTECK = 10;

//Zeitintervall für Bildschirmwiederholung
var refresh;
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
var INIT_X_1;
var INIT_Y_1;
var INIT_X_2;
var INIT_Y_2;
var INIT_X_3;
var INIT_Y_3;

var points = [];

var count;
var xValues = [];
var yValues = [];
// Anzeigemodus (0 = Alles, 1 = Vertical, 2 = Horizontal)
var mode = 0;

//Prüfen, welcher UserAgent verwendet wird
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
	//Prüfe, ob die Seite von einem mobilen Gerät aufgerufen wurde
    if (!isMobile.any()) {
        var result = 'Die Wasserwaage funktioniert nur auf mobilen Geräten!';
        alert(result);
        return;
    } 
    //Prüfen, ob Gerät ein iOS Gerät ist
    if (!isMobile.iOS()) {
    	iOS_X = -1.0;
		iOS_Y = -1.0;
		iOS_Z = -1.0;
    } else {
    	iOS_X = 1.0;
		iOS_Y = 1.0;
		iOS_Z = 1.0;
    }

    // initialisieren von Canvas
	initCanvas();
    setScreen();
    accelx = 0.0;
    accely = 0.0;
    accelz = 0.0;  

    count = 0; 

    // Aktuallisierungsintervall starten
    refresh = 50;
    mode = 0;
	refreshID = setInterval(draw, refresh);
    canvas.webkitRequestFullScreen();
    document.getElementById("start").disabled = "disabled";
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
    //mode = 2;
	
	switch(mode) {
        case 0:
        	PUNKTRADIUS = 25;
			KREISRADIUS = 6.5 * PUNKTRADIUS;
			OFFSET_X = 220; 
			OFFSET_Y = 10;
			setInitValueOfPoints();
            drawBackgroundAll();
            break;
        case 1:
        	PUNKTRADIUS = 40;
        	OFFSET_X = 370; 
			OFFSET_Y = 20;
			setInitValueOfPoints();
            drawBackgroundVertical();
            break;
        case 2:
        	PUNKTRADIUS = 50;
        	OFFSET_X = 50; 
			OFFSET_Y = 140;
        	setInitValueOfPoints();
            drawBackgroundHorizontal();
            break;
    }

    xValues[count] = accelx;
    yValues[count] = accely;
    if(count >= 5) {
    	setPointsPosition(); 
    	count = 0;
    } else {
    	count += 1;
    }
    drawAngle();
    checkCollision();
    drawPoints();
}

function setInitValueOfPoints() {
	if(mode == 0) {
		//Kreis
		INIT_X_1 = OFFSET_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS + 0.4 * PUNKTRADIUS;
		INIT_Y_1 = OFFSET_Y + KREISRADIUS - 0.2 * PUNKTRADIUS;
	}
	if((mode == 0) || (mode == 1)) {
		//Vertikal
		switch(mode) {
			case 0:
				INIT_X_2 = OFFSET_X + PUNKTRADIUS + 0.4 * PUNKTRADIUS;
				INIT_Y_2 = OFFSET_Y + KREISRADIUS - 0.2 * PUNKTRADIUS;
				break;
			case 1:
				INIT_X_2 = OFFSET_X + PUNKTRADIUS + 0.4 * PUNKTRADIUS;
				INIT_Y_2 = OFFSET_Y + 4.5 * PUNKTRADIUS - 0.2 * PUNKTRADIUS;
				break;
		}
	} 
	if((mode == 0) || (mode == 2)) {
		//Horizontal
		switch(mode) {
			case 0:
				INIT_X_3 = OFFSET_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS + 0.4 * PUNKTRADIUS;
				INIT_Y_3 = OFFSET_Y + DIFF_KREIS_RECHTECK + PUNKTRADIUS + 2 * KREISRADIUS - 0.2 * PUNKTRADIUS;
				break;
			case 2:
				INIT_X_3 = OFFSET_X + 7 * PUNKTRADIUS + 0.4 * PUNKTRADIUS;
				INIT_Y_3 = OFFSET_Y + PUNKTRADIUS - 0.2 * PUNKTRADIUS;
				break;
		}
	}
	points[0] = { x: INIT_X_1, y: INIT_Y_1, radius: PUNKTRADIUS };
	points[1] = { x: INIT_X_2, y: INIT_Y_2, radius: PUNKTRADIUS };
	points[2] = { x: INIT_X_3, y: INIT_Y_3, radius: PUNKTRADIUS };
}

function drawBackgroundVertical() {
    ctx.fillStyle = 'hsla(120,100%,50%,0.2)';
    ctx.strokeRect(OFFSET_X, OFFSET_Y, 2 * PUNKTRADIUS, 9 * PUNKTRADIUS);
    ctx.fillRect(OFFSET_X, OFFSET_Y, 2 * PUNKTRADIUS,  9 * PUNKTRADIUS);
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(OFFSET_X, OFFSET_Y + 3.5 * PUNKTRADIUS - 2);
        ctx.lineTo(OFFSET_X + 2 * PUNKTRADIUS, OFFSET_Y + 3.5 * PUNKTRADIUS - 2);
        ctx.stroke();
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(OFFSET_X, OFFSET_Y + 5.5 * PUNKTRADIUS + 2);
        ctx.lineTo(OFFSET_X + 2 * PUNKTRADIUS, OFFSET_Y + 5.5 * PUNKTRADIUS + 2);
        ctx.stroke();
}

function drawBackgroundHorizontal() {
	ctx.fillStyle = 'hsla(120,100%,50%,0.2)';
    ctx.strokeRect(OFFSET_X ,OFFSET_Y, 14 * PUNKTRADIUS, 2 * PUNKTRADIUS);
    ctx.fillRect(OFFSET_X ,OFFSET_Y, 14 * PUNKTRADIUS, 2 * PUNKTRADIUS);
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(OFFSET_X + 6 * PUNKTRADIUS - 2, OFFSET_Y);
        ctx.lineTo(OFFSET_X + 6 * PUNKTRADIUS - 2, OFFSET_Y + 2 * PUNKTRADIUS);
        ctx.stroke();
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(OFFSET_X + 8 * PUNKTRADIUS + 2, OFFSET_Y);
        ctx.lineTo(OFFSET_X + 8 * PUNKTRADIUS + 2, OFFSET_Y + 2 * PUNKTRADIUS);
        ctx.stroke();
}

function drawBackgroundAll() {
	// Kreis
	ctx.beginPath();
        ctx.arc(OFFSET_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS,
         		OFFSET_Y + KREISRADIUS, KREISRADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(120,100%,50%,0.2)";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    ctx.beginPath();
        ctx.arc(OFFSET_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS,
        		 OFFSET_Y + KREISRADIUS, PUNKTRADIUS + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();

    // vertikales Rechteck
    ctx.fillStyle = 'hsla(120,100%,50%,0.2)';
    ctx.strokeRect(OFFSET_X, OFFSET_Y, 2 * PUNKTRADIUS, 2 * KREISRADIUS);
    ctx.fillRect(OFFSET_X, OFFSET_Y, 2 * PUNKTRADIUS, 2 * KREISRADIUS);
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(OFFSET_X, OFFSET_Y + KREISRADIUS - PUNKTRADIUS - 2);
        ctx.lineTo(OFFSET_X + 2 * PUNKTRADIUS, OFFSET_Y + KREISRADIUS - PUNKTRADIUS - 2);
        ctx.stroke();
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(OFFSET_X, OFFSET_Y + KREISRADIUS + PUNKTRADIUS + 2);
        ctx.lineTo(OFFSET_X + 2 * PUNKTRADIUS, OFFSET_Y + KREISRADIUS + PUNKTRADIUS + 2);
        ctx.stroke();

    //Horizontales Rechteck
    ctx.fillStyle = 'hsla(120,100%,50%,0.2)';
    ctx.strokeRect(OFFSET_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK ,OFFSET_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK,
    			 2 * KREISRADIUS, 2 * PUNKTRADIUS);
    ctx.fillRect(OFFSET_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK ,OFFSET_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK,
                 2 * KREISRADIUS, 2 * PUNKTRADIUS);
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(OFFSET_X + PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK - 2, OFFSET_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK);
        ctx.lineTo(OFFSET_X + PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK - 2, 
        			OFFSET_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK + 2 * PUNKTRADIUS);
        ctx.stroke();
    ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(OFFSET_X + 3 * PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK + 2, OFFSET_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK);
        ctx.lineTo(OFFSET_X + 3 * PUNKTRADIUS + KREISRADIUS + DIFF_KREIS_RECHTECK + 2, 
        			OFFSET_Y + 2 * KREISRADIUS + DIFF_KREIS_RECHTECK + 2 * PUNKTRADIUS);
        ctx.stroke();
}

function average(values) {
	var sum = 0;
	for (var i = 0; i < values.length; i++) {
		sum += values[i];
	}
	return (sum / values.length);
}

function setPointsPosition() {
	switch(mode) {
		case 0:
			points[0].y = INIT_Y_1 + 3 * PUNKTRADIUS * average(yValues);
    		points[0].x = INIT_X_1 + 3 * PUNKTRADIUS * average(xValues);

   			points[1].y = INIT_Y_2 + 3 * PUNKTRADIUS * average(yValues);// - 0.2 * PUNKTRADIUS;

   			points[2].x = INIT_X_3 + 3 * PUNKTRADIUS * average(xValues);// + 0.4 * PUNKTRADIUS;
			break;
		case 1:
			points[1].y = INIT_Y_2 + 3 * PUNKTRADIUS * average(yValues);// - 0.2 * PUNKTRADIUS;
			break;
		case 2:
			points[2].x = INIT_X_3 + 3 * PUNKTRADIUS * average(xValues);// + 0.4 * PUNKTRADIUS;
			break;
	}
}

function checkCollision() {
	switch(mode) {
		case 0:
			if(points[1].y <= OFFSET_Y + PUNKTRADIUS) {
        		points[1].y = OFFSET_Y + PUNKTRADIUS;
    		}
    		if(points[1].y >= OFFSET_Y + 2 * KREISRADIUS - PUNKTRADIUS) {
        		points[1].y = OFFSET_Y + 2 * KREISRADIUS - PUNKTRADIUS;
    		}
    		if(points[2].x <= OFFSET_X + 3 * PUNKTRADIUS + DIFF_KREIS_RECHTECK) {
        		points[2].x = OFFSET_X + 3 * PUNKTRADIUS + DIFF_KREIS_RECHTECK;
    		}
    		if(points[2].x >= OFFSET_X + PUNKTRADIUS + DIFF_KREIS_RECHTECK + 2 * KREISRADIUS) {
        		points[2].x = OFFSET_X + PUNKTRADIUS + DIFF_KREIS_RECHTECK + 2 * KREISRADIUS;
    		}

    		if(getDistanceBetweenPositions(INIT_X_1, INIT_Y_1, points[0].x, points[0].y) > (KREISRADIUS - PUNKTRADIUS)) {
        		var tempx = getCircleValueX(INIT_X_1, (points[0].y - INIT_Y_1), (points[0].x - INIT_X_1), (KREISRADIUS - PUNKTRADIUS));
        		var tempy = getCircleValueY(INIT_Y_1, (points[0].y - INIT_Y_1), (points[0].x - INIT_X_1), (KREISRADIUS - PUNKTRADIUS));
        		points[0].x = tempx;
        		points[0].y = tempy;
    		}
			break;
		case 1:
			if(points[1].y >= (INIT_Y_2 + 3.5 * PUNKTRADIUS)) {
        		points[1].y = (INIT_Y_2 + 3.5 * PUNKTRADIUS);
    		}
    		if(points[1].y <= (INIT_Y_2 - 3.5 * PUNKTRADIUS)) {
        		points[1].y = (INIT_Y_2 - 3.5 * PUNKTRADIUS);
    		}
			break;
		case 2:
			if(points[2].x >= (INIT_X_3 + 6 * PUNKTRADIUS)) {
        		points[2].x = (INIT_X_3 + 6 * PUNKTRADIUS);
    		}
    		if(points[2].x <= (INIT_X_3 - 6 * PUNKTRADIUS)) {
        		points[2].x = (INIT_X_3 - 6 * PUNKTRADIUS);
    		}
			break;
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
            case 1: min = 1; max = 2; break;
            case 2: min = 2; break;
        } 
        for(var i = min; i < max; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, PUNKTRADIUS, 0, Math.PI * 2);
            ctx.fillStyle = "#04B45F";
            ctx.fill();
            ctx.closePath();
        }
}

function getXAngle() {
	var dif = INIT_X_3 - points[2].x;
	var angle = (90 / 1475) * dif;
	return angle.toFixed(0);
}

function getYAngle() {
	var dif = INIT_Y_2 - points[1].y;
	var angle = (90 / 1475) * dif;
	return dif.toFixed(0);
}

function drawAngle() {
	if(mode == 0 || mode == 2) {
		ctx.font = "28px Calibri";
    	ctx.fillStyle = "#8B2323";
    	ctx.fillText("Winkel in x: " + getXAngle() + "°", 10, 132);
	}
	if(mode == 0 || mode == 1) {
		ctx.font = "28px Calibri";
    	ctx.fillStyle = "#8B2323";
    	ctx.fillText("Winkel in y: " + getYAngle() + "°", 10, 22);
	}
}

//Ermittelt die Beschleunigung entsprechend der Bildschirmorientierung
if (window.DeviceOrientationEvent) {
    window.addEventListener("devicemotion", function (event) {
    	switch (window.orientation) {
        	case 0:
            	accelz = iOS_Z * event.accelerationIncludingGravity.z * (-1);
            	accelx = iOS_X * event.accelerationIncludingGravity.x * (-1);
                accely = iOS_Y * event.accelerationIncludingGravity.y;
    	        break;
        	case -90:
            	accelx = iOS_X * event.accelerationIncludingGravity.y * (-1);
	            accely = iOS_Y * event.accelerationIncludingGravity.x * (-1);
    	        accelz = iOS_Z * event.accelerationIncludingGravity.z * (-1);
        	    break;
            case 90:
	            accelx = iOS_X * event.accelerationIncludingGravity.y;
    	        accely = iOS_Y * event.accelerationIncludingGravity.x;
        	    accelz = iOS_Z * event.accelerationIncludingGravity.z * (-1);
            	break;
	        case 180:
    	        accelx = iOS_X * event.accelerationIncludingGravity.x;
        	    accely = iOS_Y * event.accelerationIncludingGravity.y * (-1);
            	accelz = iOS_Z * event.accelerationIncludingGravity.z * (-1);
 	            break;
    	}
    	if(-5 <= accelz && accelz <= 5) {
            if(!(accely <= 5 && accely >= -5)) {
            	mode = 2;
	        } else {
	        	if(!(accelx <= 5 && accelx >= -5)) {
        	    mode = 1;
            	}
	        } 
	    } else {
    	    mode = 0;
	    }
	}, true);
} else {
    alert("Sorry, ihr Gerät unterstützt keine Bildschirmorientierung!");
}
