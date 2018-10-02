const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

//Funcionalidad de inputs
var obstaculos = document.getElementById("obstaculos");
var obsText = document.getElementById("obsText");
obstaculos.oninput = function() {
    obsText.innerHTML = this.value;
}

var tamMapa = document.getElementById("tamMapa");
var tamMapaText = document.getElementById("tamMapaText");
tamMapa.oninput = function() {
    tamMapaText.innerHTML = this.value;
}

//Valores iniciales
var width = 600;
var tamFila = Number(tamMapa.value);
var porc = Number(obstaculos.value);    //Porcentaje de obstaculos
var scaling = width/tamFila;
var cantCeldas = tamFila*tamFila;
var mapa = [];

//Agentes
class Agente{
  constructor(ruta, agua, monte, barranco, normal){
    this.image = new Image();
    this.image.src = ruta;
    this.state = 'unset';
    this.pos_x = undefined;
    this.pos_y = undefined;
    this.afinidadAgua = agua;
    this.afinidadMonte = monte;
    this.afinidadBarranco = barranco;
    this.afinidadNormal = normal;
    this.ultimaPosicion = undefined;
  }

  draw(){
    if(this.state !== 'unset'){
      if(mapa[this.pos_x][this.pos_y] === 1) {
        context.fillStyle = "#e50d14";
        context.fillRect(this.pos_x, this.pos_y, 1, 1);
      }
      else {
        context.drawImage(this.image, this.pos_x, this.pos_y, 1, 1);
      }
    }
  }
}

var selected;
const jugadores = [];
jugadores.push(new Agente('./images/base.png', 1.0, 1.5, 2.5, 0.3));//Test
jugadores.push(new Agente('./images/casa.png'));
jugadores.push(new Agente('./images/crystal.png', 2.5, 0.3, 1.0, 1.5));//Mombo
jugadores.push(new Agente('./images/toad.png', 0.3, 2.5, 1.5, 1.0));//Pirolo
jugadores.push(new Agente('./images/vulture.png', 1.0, 1.5, 2.5, 0.3));//Lucas

const jugador = new Agente('./images/hermit.png', 1.0, 1.5, 2.5, 0.3);//Test

//Funcionalidades
function createMatrix(w, h){ //Crea una matriz vacia del tamaño del mapa
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createMap(){ //Crea el arreglo del mapa
  cantCeldas = tamFila*tamFila;
  scaling = width/tamFila;
  mapa = createMatrix(tamFila, tamFila);
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.scale(scaling, scaling);
  cantidad = 0;
  max = cantCeldas*porc/100;
  while (cantidad < max) {
    j = getRndInteger(0, tamFila-1);
    k = getRndInteger(0, tamFila-1);
    if (mapa[j][k] === 0) {
      mapa[j][k] = 1;
      cantidad+=1;
    }
  }
}

function ajustarMapa(){ //Prepara valores para generar mapa
  tamFila = Number(tamMapa.value);
  porc = Number(obstaculos.value);
  jugador.state = 'unset';
  for (var i = 0; i < jugadores.length; i++) {
    jugadores[i].state = 'unset';
  }
  createMap();
}

function drawMap(){
  for (var j = 0; j < mapa.length; j++) {
    for (var k = 0; k < mapa[j].length; k++) {
      var currentCell = mapa[j][k];
      if (currentCell === 0) {
        context.fillStyle = "#E3D6AA";
      }
      else if (currentCell === 1) {
        context.fillStyle = "#918c8a";
      }
      else if (currentCell === 2) {
        context.fillStyle = "#68655c";
      }
      else if (currentCell === 3) {
        context.fillStyle = "#847e6b";
      }
      else if (currentCell === 4) {
        context.fillStyle = "#999075";
      }
      else if (currentCell === 5) {
        context.fillStyle = "#baaf8d";
      }
      context.fillRect(j, k, 1, 1);
    }
  }
}

let contadorMovimiento = 0;
let intervaloMovimiento = 500;
let lastTime = 0;
function updateMap(time = 0){
  const deltaTime = time - lastTime;
  lastTime = time;
  contadorMovimiento += deltaTime;
  if (contadorMovimiento > intervaloMovimiento) {
    // console.log(jugador.pos_x, jugador.pos_y)
    if (jugador.state === 'set' && jugadores[1].state === 'set') {
      moveJugador();
    }
    contadorMovimiento = 0;
  }
  drawMap();
  jugador.draw();
  for (var i = 0; i < jugadores.length; i++) {
    jugadores[i].draw();
  }
  requestAnimationFrame(updateMap);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function disableInput() {
  document.getElementById('botonJugador').disabled = true;
  document.getElementById('botonCasa').disabled = true;
  document.getElementById('tamMapa').disabled = true;
  document.getElementById('obstaculos').disabled = true;
  document.getElementById('botonAjustar').disabled = true;
}

function enableInput(){
  document.getElementById('botonJugador').disabled = false;
  document.getElementById('botonCasa').disabled = false;
  document.getElementById('tamMapa').disabled = false;
  document.getElementById('obstaculos').disabled = false;
  document.getElementById('botonAjustar').disabled = false;
}

function ajustarJugador(num){
  selected = num;
  canvas.addEventListener('mousemove', positionPlayer);
  canvas.addEventListener('click', setPlayer);
  disableInput();
}

function positionPlayer(){
  var rect = canvas.getBoundingClientRect();
  var canvas_x = Math.floor((event.clientX - rect.left)/scaling);
  if (canvas_x > tamFila-1) {
    canvas_x = tamFila-1;
  }
  else if (canvas_x < 0) {
    canvas_x = 0;
  }
  var canvas_y = Math.floor((event.clientY - rect.top)/scaling);
  if (canvas_y > tamFila-1) {
    canvas_y = tamFila-1;
  }
  else if (canvas_y < 0) {
    canvas_y = 0;
  }
  jugadores[selected].pos_x = canvas_x;
  jugadores[selected].pos_y = canvas_y;
  jugadores[selected].state = 'setting';
}

function setPlayer(){
  if (mapa[jugadores[selected].pos_x][jugadores[selected].pos_y] === 0) {
    canvas.removeEventListener('mousemove', positionPlayer);
    canvas.removeEventListener('click', setPlayer);
    jugadores[selected].state = 'set';
    jugadores[selected].ultimaPosicion = {x:jugadores[selected].pos_x, y: jugadores[selected].pos_y};
    enableInput();
  }
}

function moveJugador(){
  if(!(jugador.pos_x === casa.pos_x && jugador.pos_y === casa.pos_y)) {
    let posicionesDisponibles = [];
    for (var i = jugador.pos_x-1; i <= jugador.pos_x +1; i++) {
      for (var j = jugador.pos_y-1; j <= jugador.pos_y+1; j++) {
        if (i >= 0 && i < tamFila && j >= 0 && j < tamFila) {
          if (!(i === jugador.pos_x && j === jugador.pos_y)) {
            if (!(i === ultimaPosicion.x && j === ultimaPosicion.y)) {
              if (mapa[i][j] !== 1) {
                posicionesDisponibles.push({x:i,y:j});
              }
            }
          }
        }
      }
    }
    if (posicionesDisponibles.length === 0) {
      if (mapa[ultimaPosicion.x][ultimaPosicion.y] !== 1) {
        if (!(jugador.pos_x === ultimaPosicion.x && jugador.pos_y === ultimaPosicion.y)) {
          let temp = {x:jugador.pos_x, y: jugador.pos_y};
          jugador.pos_x = ultimaPosicion.x;
          jugador.pos_y = ultimaPosicion.y;
          ultimaPosicion = temp;
        }
        else {
          jugador.state = 'unset';
        }
      }
      else {
        jugador.state = 'unset';
      }
    }
    else {
      let newPos = posicionesDisponibles[getRndInteger(0,posicionesDisponibles.length-1)]
      ultimaPosicion = {x:jugador.pos_x, y: jugador.pos_y};
      jugador.pos_x = newPos.x;
      jugador.pos_y = newPos.y;
    }
  }
}

//Inicializaciones
createMap();
updateMap();
