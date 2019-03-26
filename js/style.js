var canvas;
var ctx;
var ratio;

const RANDINDEX_Y = 40;
const RANDINDEX_X = 220;
const DIFF_KREIS_RECHTECK = 20;

const PUNKTRADIUS = 30;
const KREISRADIUS = 130;
//Startkoordinaten Ball
const XINIT = 770;
const YINIT = 200 - PUNKTRADIUS;

//Zeitintervall für Bildschirmwiederholung
var refresh = 10;
//ID von setIntervall;
var refreshID;

 //Aktuell ausgelesene Beschleunigung aus dem Beschleunigungssensor
var accelx = 0.0;
var accely = 0.0;

//Beschleunigung im letzten Intervall
// aktuelle Beschleunigung * letzte < 0 bedeutet Richtungsänderung
var lastAccx = 0;
var lastAccy = 0;

//Position des Balls
var x = XINIT;
var y = YINIT;
var punkt1 = { x: RANDINDEX_X + PUNKTRADIUS, y: RANDINDEX_Y + KREISRADIUS, radius: PUNKTRADIUS };
var punkt2 = { x: RANDINDEX_X + 2* PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS, 
			   y: RANDINDEX_Y + DIFF_KREIS_RECHTECK + PUNKTRADIUS + 2 * KREISRADIUS, radius: PUNKTRADIUS };
var punkt3 = { x: RANDINDEX_X + 2* PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS, y: RANDINDEX_Y + KREISRADIUS, radius: PUNKTRADIUS };
var way = 1;

function startWasserwaage() {
	initCanvas();
	init();
	refreshID = setInterval(draw, refresh);
}

/*function showInfoScreen(txt){
            var showDiv = document.createElement('div');
            showDiv.id = "showDiv";
            showDiv.style.heihght = 400;
            showDiv.style.textDecoration = "underline";
            showDiv.style.textAlign = "center";
            showDiv.style.paddingTop = "100px";
            showDiv.style.background = "#F6D8CE";
            document.body.appendChild(showDiv);
			var btnText = document.createTextNode(txt);
			showDiv.appendChild(btnText);
			showDiv.addEventListener("click", function() {	
				showDiv.parentNode.removeChild(showDiv);
				initCanvas();
				init();
                //Startet Bildschirmwiederholung für Spiel
				refreshID = setInterval(draw, refresh);
                //canvas.webkitRequestFullScreen();                
			}, false);
		}*/

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

function init(){
			setScreen();

			//Aktuell ausgelesene Beschleunigung aus dem Beschleunigungssensor
			accelx = 0.0;
			accely = 0.0;

			//Beschleunigung im letzten Intervall
			// aktuelle Beschleunigung * letzte < 0 bedeutet Richtungsänderung
			lastAccx = 0;
			lastAccy = 0;

			//Position des Balls
			x = XINIT;
			y = YINIT;			

			refresh = 10;
		}

function draw(){
    setScreen();
	//Ball bewegt sich von der Wand weg, Ballträgheit zurücksetzen
    /*if (lastAccx * accelx < 0){
		ballInertiax = BALLINERTIA;
		lastBricky = -1;
	}
    if (lastAccy * accely < 0) {
		ballInertiay = BALLINERTIA;
		lastBrickx = -1;
	}
             
    lastAccx = accelx;
    lastAccy = accely;
               
    phoneTiltx = accelx * ballInertiax;
    phoneTilty = -accely * ballInertiay;
*/
    ctx.clearRect(0, 0, canvas.width, canvas.height);

	
    drawBackground();
    drawPoints();    
}

function drawBackground() {
	// Kreis
	ctx.beginPath();
        ctx.arc(RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS,
         		RANDINDEX_Y + KREISRADIUS, KREISRADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(120,100%,50%,0.2)";
        ctx.fill();
        ctx.closePath();
    ctx.beginPath();
        ctx.arc(RANDINDEX_X + 2 * PUNKTRADIUS + DIFF_KREIS_RECHTECK + KREISRADIUS,
        		 RANDINDEX_Y + KREISRADIUS, PUNKTRADIUS + 2, 0, Math.PI * 2);
        ctx.fillStyle = "#f4f4f4";
        ctx.fill();
        ctx.closePath();

    // vertikales Rechteck
    ctx.fillStyle = 'hsla(120,100%,50%,0.2)';
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

function drawPoints() {

		//punkt1.x = punkt1.x + 3* way; 
        ctx.beginPath();
        ctx.arc(punkt1.x, punkt1.y, PUNKTRADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#04B45F";
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(punkt2.x, punkt2.y, PUNKTRADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#04B45F";
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(punkt3.x, punkt3.y, PUNKTRADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#04B45F";
        ctx.fill();
        ctx.closePath();
}
/*
//Ermittelt die Beschleunigung entsprechend der Bildschirmorientierung
        if (window.DeviceOrientationEvent) {
            window.addEventListener("devicemotion", function (event) {
                switch (window.orientation) {
                    case 0:
                        accelx = event.accelerationIncludingGravity.x * (-1);
                        accely = event.accelerationIncludingGravity.y * (-1);
                        break;

                    case -90:
                        accelx = event.accelerationIncludingGravity.y * (-1);
                        accely = event.accelerationIncludingGravity.x;
                        break;

                    case 90:
                        accelx = event.accelerationIncludingGravity.y;
                        accely = event.accelerationIncludingGravity.x * (-1);
                        break;

                    case 180:
                        accelx = event.accelerationIncludingGravity.x;
                        accely = event.accelerationIncludingGravity.y;
                        break;

                }
            }, true);
        } else {
            alert("Sorry, ihr Gerät unterstützt keine Bildschirmorientierung!");
        }
		showInfoScreen('Spiel im Vollbildmodus starten!'); */