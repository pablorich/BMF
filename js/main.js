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
    // this.ultimaPosicion = undefined;
  }
}

const casa = new Agente('./images/casa.jpg');
// const jugador = new Agente('./images/crystal.png', 0.3, 2.5, 1.5, 1.0);//Mombo
// const jugador = new Agente('./images/toad.png', 2.5, 0.3, 1.0, 1.5);//Pirolo
// const jugador = new Agente('./images/vulture.png', 1.0, 1.5, 2.5, 0.3);//Lucas
const jugador = new Agente('./images/hermit.png', 1.0, 1.5, 2.5, 0.3);//Test

var caminoCasa = [];
// var ultimaPosicion;

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
  casa.state = 'unset';
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

function drawPlayer(){
  if(jugador.state !== 'unset'){
    if(mapa[jugador.pos_x][jugador.pos_y] === 1) {
      context.fillStyle = "#e50d14";
      context.fillRect(jugador.pos_x, jugador.pos_y, 1, 1);
    }
    else {
      context.drawImage(jugador.image, jugador.pos_x, jugador.pos_y, 1, 1);
    }
  }
}

function drawCasa(){
  if(casa.state !== 'unset'){
    // context.fillStyle = "#dbbc90";
    if(mapa[casa.pos_x][casa.pos_y] === 1) {
      context.fillStyle = "#e50d14";
      context.fillRect(casa.pos_x, casa.pos_y, 1, 1);
    }
    else {
      context.drawImage(casa.image, casa.pos_x, casa.pos_y, 1, 1);
    }
  }
}

let contadorMovimiento = 0;
let intervaloMovimiento = 20;
let lastTime = 0;
function updateMap(time = 0){
  const deltaTime = time - lastTime;
  lastTime = time;
  contadorMovimiento += deltaTime;
  if (contadorMovimiento > intervaloMovimiento) {
    // console.log(jugador.pos_x, jugador.pos_y)
    if (jugador.state === 'set' && casa.state === 'set') {
      moveJugador();
    }
    contadorMovimiento = 0;
  }
  drawMap();
  drawCasa();
  drawPlayer();
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

function ajustarJugador(){
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
  jugador.pos_x = canvas_x;
  jugador.pos_y = canvas_y;
  jugador.state = 'setting';
  // console.log(canvas_x, canvas_y);
}

function setPlayer(){
  if (mapa[jugador.pos_x][jugador.pos_y] === 0) {
    canvas.removeEventListener('mousemove', positionPlayer);
    canvas.removeEventListener('click', setPlayer);
    jugador.state = 'set';
    ultimaPosicion = {x:jugador.pos_x, y: jugador.pos_y};
    enableInput();
    if (casa.state === 'set') {
      caminoCasa = line(jugador.pos_x, jugador.pos_y, casa.pos_x, casa.pos_y);
      caminoCasa.shift();
    }
  }
}

function ajustarCasa(){
  canvas.addEventListener('mousemove', positionCasa);
  canvas.addEventListener('click', setCasa);
  disableInput();
}

function positionCasa(){
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
  casa.pos_x = canvas_x;
  casa.pos_y = canvas_y;
  casa.state = 'setting';
  // console.log(canvas_x, canvas_y);
}

function setCasa(){
  if (mapa[casa.pos_x][casa.pos_y] === 0) {
    canvas.removeEventListener('mousemove', positionCasa);
    canvas.removeEventListener('click', setCasa);
    casa.state = 'set';
    enableInput();
    if (jugador.state === 'set') {
      caminoCasa = line(jugador.pos_x, jugador.pos_y, casa.pos_x, casa.pos_y);
      caminoCasa.shift();
    }
  }
}

function moveJugador(){
  if(!(jugador.pos_x === casa.pos_x && jugador.pos_y === casa.pos_y)) {
    var newPos = caminoCasa.shift();
    if (mapa[newPos.x0][newPos.y0] === 1) {
      if (mapa[jugador.pos_x][jugador.pos_y] === 0) {
        mapa[jugador.pos_x][jugador.pos_y] = 5;
      }
      else if (mapa[jugador.pos_x][jugador.pos_y] !== 1) {
        mapa[jugador.pos_x][jugador.pos_y] -= 1;
      }
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
      caminoCasa = line(jugador.pos_x, jugador.pos_y, casa.pos_x, casa.pos_y);
      caminoCasa.shift();
    }
    else {
      ultimaPosicion = {x:jugador.pos_x, y: jugador.pos_y}
      jugador.pos_x = newPos.x0;
      jugador.pos_y = newPos.y0;
    }
  }
}

function line(x0, y0, x1, y1){
  const camino = [];
  var dx = Math.abs(x1-x0);
  var dy = Math.abs(y1-y0);
  var sx = (x0 < x1) ? 1 : -1;
  var sy = (y0 < y1) ? 1 : -1;
  var err = dx-dy;
  while(true){
    camino.push({x0,y0}); //Siguiente cuadro

    if ((x0==x1) && (y0==y1)) break;
    var e2 = 2*err;
    if (e2 >-dy){ err -= dy; x0  += sx; }
    if (e2 < dx){ err += dx; y0  += sy; }
  }
  return camino;
}

//Inicializaciones
createMap();
updateMap();
