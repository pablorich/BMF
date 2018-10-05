const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

//Funcionalidad de inputs
var obstaculos = document.getElementById("obstaculos");
var obsText = document.getElementById("obsText");
obstaculos.oninput = function() {
    obsText.innerHTML = this.value;
}

var sliderAgua = document.getElementById("agua");
var aguaText = document.getElementById("aguaText");
sliderAgua.oninput = function() {
    aguaText.innerHTML = this.value;
}

var sliderMontes = document.getElementById("montes");
var monteText = document.getElementById("monteText");
sliderMontes.oninput = function() {
    monteText.innerHTML = this.value;
}

var sliderBarrancos = document.getElementById("barrancos");
var barrancoText = document.getElementById("barrancoText");
sliderBarrancos.oninput = function() {
    barrancoText.innerHTML = this.value;
}

var cantTrain = document.getElementById("training");
var trainText = document.getElementById("trainText");
cantTrain.oninput = function() {
    trainText.innerHTML = this.value;
}

var tamMapa = document.getElementById("tamMapa");
var tamMapaText = document.getElementById("tamMapaText");
tamMapa.oninput = function() {
    tamMapaText.innerHTML = this.value;
}

//Valores iniciales
var width = 600;
var tamFila = Number(tamMapa.value);
var porcObs = Number(obstaculos.value);    //Porcentaje de obstaculos
var porcAgua = Number(sliderAgua.value);
var porcMontes = Number(sliderMontes.value);
var porcBarrancos = Number(sliderBarrancos.value);
var imgAgua = new Image();
var imgMonte = new Image();
var imgBarranco = new Image();
var imgPared = new Image();
imgAgua.src = './images/water.jpg';
imgMonte.src = './images/mountain2.png';
imgBarranco.src = './images/canyon.jpg';
imgPared.src = './images/brick.png';
var scaling = width/tamFila;
var cantCeldas = tamFila*tamFila;
var mapa = [];
var grafo;

//Agentes
class Agente{
  constructor(ruta, agua, monte, barranco, normal, ind){
    this.image = new Image();
    this.image.src = ruta;
    this.indice = ind;
    this.state = 'unset';
    this.pos_x = undefined;
    this.pos_y = undefined;
    this.afinidadAgua = agua;
    this.afinidadMonte = monte;
    this.afinidadBarranco = barranco;
    this.afinidadNormal = normal;
    this.ultimaPosicion = undefined;
    this.hasTrained = false;
  }

  updateEsfuerzo(newE){
    if (this.hasTrained) {
      if (newE < this.minE) {
        this.minE = newE;
      }
      if (newE > this.maxE) {
        this.maxE = newE;
      }
    }
    else {
      this.hasTrained = true;
      this.minE = newE;
      this.maxE = newE;
    }
  }

  calcAjuste(esf){
    return esf - (this.minE + this.maxE) / 2;
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

  moveJugador(){
    if(!(this.pos_x === casa.pos_x && this.pos_y === casa.pos_y)) {
      let posicionesDisponibles = [];
      posicionesDisponibles = grafo.listaAdy[(this.pos_x*tamFila)+this.pos_y].connections.slice();
      if (posicionesDisponibles.length === 1) {
        if (!(this.pos_x === this.ultimaPosicion.x && this.pos_y === this.ultimaPosicion.y)) {
          let temp = {x:this.pos_x, y: this.pos_y};
          this.pos_x = this.ultimaPosicion.x;
          this.pos_y = this.ultimaPosicion.y;
          this.ultimaPosicion = temp;
        }
        else {
          this.state = 'unset';
        }
      }
      else {
        let okay = false;
        let newPos;
        while (!okay) {
          newPos = posicionesDisponibles[getRndInteger(0,posicionesDisponibles.length-1)]
          if (!(newPos.x == this.ultimaPosicion.x && newPos.y == this.ultimaPosicion.y)) {
            okay = true;
          }
        }
        this.ultimaPosicion = {x:this.pos_x, y: this.pos_y};
        this.pos_x = newPos.x;
        this.pos_y = newPos.y;
      }
    }
  }

  moveJugadorTrained(){
    if(!(this.pos_x === casa.pos_x && this.pos_y === casa.pos_y)) {
      let posicionesDisponibles = [];
      posicionesDisponibles = grafo.listaAdy[(this.pos_x*tamFila)+this.pos_y].connections.slice();
      if (posicionesDisponibles.length <= 1) {
        if (!(this.pos_x === this.ultimaPosicion.x && this.pos_y === this.ultimaPosicion.y)) {
          let temp = {x:this.pos_x, y: this.pos_y};
          this.pos_x = this.ultimaPosicion.x;
          this.pos_y = this.ultimaPosicion.y;
          this.ultimaPosicion = temp;
        }
        else {
          this.state = 'unset';
        }
      }
      else {
        let lowest = 0;
        if (posicionesDisponibles[0].x == this.ultimaPosicion.x && posicionesDisponibles[0].y == this.ultimaPosicion.y) {
          lowest = 1;
        }
        let newPos;
        for (var i = 0; i < posicionesDisponibles.length; i++) {
          if (i == lowest) {
            continue;
          }
          if (posicionesDisponibles[i].pond[this.indice] < posicionesDisponibles[lowest].pond[this.indice]) {
            if (!(posicionesDisponibles[i].x == this.ultimaPosicion.x && posicionesDisponibles[i].y == this.ultimaPosicion.y)) {
              lowest = i;
            }
          }
          newPos = posicionesDisponibles[lowest];
        }
        this.ultimaPosicion = {x:this.pos_x, y: this.pos_y};
        this.pos_x = newPos.x;
        this.pos_y = newPos.y;
      }
    }
  }

}

class Entrenador{
  constructor(){
    this.trainingMode = false;
    this.trained = false;
  }

  startTraining(num, x, y){
    this.trainingMode = true;
    this.entrenamientos = num;
    this.inicio_x = x;
    this.inicio_y = y;
    this.running = 0;
    this.vuelta = 0;
    disableInput();
    this.setRunning();
  }

  setRunning(){
    jugadores[this.running].pos_x = this.inicio_x;
    jugadores[this.running].pos_y = this.inicio_y;
    jugadores[this.running].ultimaPosicion = {x: this.inicio_x, y: this.inicio_y};
    jugadores[this.running].state = 'set';
  }

  continueTraining(){
    this.vuelta +=1;
    if (this.vuelta == this.entrenamientos) {
      this.vuelta = 0;
      jugadores[this.running].state = 'unset';
      console.log(this.running + ' finished');
      this.running +=1;
      if (this.running > 2) {
        this.trainingMode = false;
        this.trained = true;
        document.getElementById('botonMombo').hidden = false;
        document.getElementById('botonLucas').hidden = false;
        document.getElementById('botonPirolo').hidden = false;
        enableInput();
      }
    }
    this.setRunning();
  }
}

class Grafo{
  constructor(map){
    this.listaAdy = [];
    for (var i = 0; i < map.length; i++) {
      for (var j = 0; j < map[i].length; j++) {
        let conn = [];
        if (map[i][j] !== 1) {
          //Calcula las posiciones disponibles a las que se puede llegar desde este nodo
          for (var k = i-1; k <= i+1; k++) {
            for (var l = j-1; l <= j+1; l++) {
              if (k >= 0 && k < tamFila && l >= 0 && l < tamFila) {
                if (!(k === i && l === j)) {
                  if (map[k][l] !== 1) {
                    conn.push({
                      x:k,
                      y:l,
                      pond: [Number.MAX_SAFE_INTEGER/2, Number.MAX_SAFE_INTEGER/2, Number.MAX_SAFE_INTEGER/2]
                    });
                  }
                }
              }
            }
          }
        }
        //Agrega a la lista un nodo con la posicion del mismo y un arreglo de posiciones disponibles
        this.listaAdy.push({
          x: i,
          y: j,
          connections: conn.slice()
        })
        //
      }
    }
  }


}

var selected;
const jugadores = [];
jugadores.push(new Agente('./images/toad.png', 0.3, 2.5, 1.5, 1.0, 0));//Mombo
jugadores.push(new Agente('./images/crystal.png', 2.5, 0.3, 1.0, 1.5, 1));//Pirolo
jugadores.push(new Agente('./images/vulture.png', 1.0, 1.5, 2.5, 0.3, 2));//Lucas
jugadores.push(new Agente('./images/base.png', 1.0, 1.0, 1.0, 1.0, 3));//Base

var casa = new Agente('./images/casa.png');
const entrenador = new Entrenador();

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

  let cantidad = 0;
  let max = cantCeldas*porcObs/100;
  while (cantidad < max) {
    j = getRndInteger(0, tamFila-1);
    k = getRndInteger(0, tamFila-1);
    if (mapa[j][k] === 0) {
      mapa[j][k] = 1;
      cantidad+=1;
    }
  }

  cantidad = 0;
  max = cantCeldas*porcAgua/100;
  while (cantidad < max) {
    j = getRndInteger(0, tamFila-1);
    k = getRndInteger(0, tamFila-1);
    if (mapa[j][k] === 0) {
      mapa[j][k] = 2;
      cantidad+=1;
    }
  }

  cantidad = 0;
  max = cantCeldas*porcMontes/100;
  while (cantidad < max) {
    j = getRndInteger(0, tamFila-1);
    k = getRndInteger(0, tamFila-1);
    if (mapa[j][k] === 0) {
      mapa[j][k] = 3;
      cantidad+=1;
    }
  }

  cantidad = 0;
  max = cantCeldas*porcBarrancos/100;
  while (cantidad < max) {
    j = getRndInteger(0, tamFila-1);
    k = getRndInteger(0, tamFila-1);
    if (mapa[j][k] === 0) {
      mapa[j][k] = 4;
      cantidad+=1;
    }
  }
}

function ajustarMapa(){ //Prepara valores para generar mapa
  tamFila = Number(tamMapa.value);
  porcObs = Number(obstaculos.value);
  porcAgua = Number(sliderAgua.value);
  porcMontes = Number(sliderMontes.value);
  porcBarrancos = Number(sliderBarrancos.value);
  casa.state = 'unset';
  for (var i = 0; i < jugadores.length; i++) {
    jugadores[i].state = 'unset';
  }
  createMap();
  grafo = new Grafo(mapa);
  document.getElementById('botonJugador').hidden = false;
  document.getElementById('botonCasa').hidden = false;
  document.getElementById('training').hidden = false;
  document.getElementById('trainTextContext').hidden = false;
  document.getElementById('trainText').hidden = false;
  document.getElementById('botonEntrenar').hidden = false;
  document.getElementById('botonEntrenarVisual').hidden = false;
  document.getElementById('botonMombo').hidden = true;
  document.getElementById('botonLucas').hidden = true;
  document.getElementById('botonPirolo').hidden = true;
  entrenador.trained = false;
}

function drawMap(){
  for (var j = 0; j < mapa.length; j++) {
    for (var k = 0; k < mapa[j].length; k++) {
      var currentCell = mapa[j][k];
      if (currentCell === 0) {
        context.fillStyle = "#d9f966";
        context.fillRect(j, k, 1, 1);
      }
      else if (currentCell === 1) {//Ladrillo
        context.drawImage(imgPared, j, k, 1, 1);
      }
      else if (currentCell === 2) {//Agua
        context.drawImage(imgAgua, j, k, 1, 1);
      }
      else if (currentCell === 3) {//Monte
        context.drawImage(imgMonte, j, k, 1, 1);
      }
      else if (currentCell === 4) {//Barranco
        context.drawImage(imgBarranco, j, k, 1, 1);
      }
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
    if (entrenador.trainingMode) {
      if (entrenador.running < 3 && entrenador.running >= 0) {
        if (jugadores[entrenador.running].state === 'set' && casa.state === 'set') {
          if (!(jugadores[entrenador.running].pos_x === casa.pos_x && jugadores[entrenador.running].pos_y === casa.pos_y)) {
            jugadores[entrenador.running].moveJugador();
            if (jugadores[entrenador.running].pos_x === casa.pos_x && jugadores[entrenador.running].pos_y === casa.pos_y) {
              entrenador.continueTraining();
            }
          }
        }
      }
    }
    else {
      if (entrenador.trained) {
        for (var i = 0; i < 3; i++) {
          if (jugadores[i].state == 'set') {
            if (!(jugadores[i].pos_x === casa.pos_x && jugadores[i].pos_y === casa.pos_y)) {
              jugadores[i].moveJugadorTrained();
              if (jugadores[i].pos_x === casa.pos_x && jugadores[i].pos_y === casa.pos_y) {
                jugadores[i].state = 'unset';
              }
            }
          }
        }
      }
    }

    contadorMovimiento = 0;
  }
  drawMap();
  if (!entrenador.trained) {
    jugadores[3].draw();
  }
  casa.draw();
  for (var i = 0; i < 3; i++) {
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
  document.getElementById('agua').disabled = true;
  document.getElementById('montes').disabled = true;
  document.getElementById('barrancos').disabled = true;
  document.getElementById('botonAjustar').disabled = true;
  document.getElementById('training').disabled = true;
  document.getElementById('botonEntrenar').disabled = true;
  document.getElementById('botonEntrenarVisual').disabled = true;
}

function enableInput(){
  document.getElementById('botonJugador').disabled = false;
  document.getElementById('botonCasa').disabled = false;
  document.getElementById('tamMapa').disabled = false;
  document.getElementById('obstaculos').disabled = false;
  document.getElementById('agua').disabled = false;
  document.getElementById('montes').disabled = false;
  document.getElementById('barrancos').disabled = false;
  document.getElementById('botonAjustar').disabled = false;
  document.getElementById('training').disabled = false;
  document.getElementById('botonEntrenar').disabled = false;
  document.getElementById('botonEntrenarVisual').disabled = false;
}

function ajustarJugador(num){
  selected = num;
  if (selected >= 0 && selected < 5) {
    if(selected === 4){
      jugadores.push(casa);
    }
    canvas.addEventListener('mousemove', positionPlayer);
    canvas.addEventListener('click', setPlayer);
    disableInput();
  }
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
  if (mapa[jugadores[selected].pos_x][jugadores[selected].pos_y] !== 1) {
    let flag = true;
    if (selected == 4) {
      if (jugadores[4].pos_x === jugadores[3].pos_x && jugadores[4].pos_y === jugadores[3].pos_y) {
        flag = false;
      }
    }
    else {
      if (casa.state == 'set') {
        if (jugadores[selected].pos_x === casa.pos_x && jugadores[selected].pos_y === casa.pos_y) {
          flag = false;
        }
      }
    }

    if (flag) {
      canvas.removeEventListener('mousemove', positionPlayer);
      canvas.removeEventListener('click', setPlayer);
      jugadores[selected].state = 'set';
      jugadores[selected].ultimaPosicion = {x:jugadores[selected].pos_x, y: jugadores[selected].pos_y};
      enableInput();
      if (selected === 4) {
        casa = jugadores.pop();
      }
    }
  }
}

function entrenar(){
  disableInput();
  if (jugadores[3].state == 'set' && casa.state == 'set') {
    document.getElementById('botonJugador').hidden = true;
    document.getElementById('botonCasa').hidden = true;
    document.getElementById('training').hidden = true;
    document.getElementById('trainTextContext').hidden = true;
    document.getElementById('trainText').hidden = true;
    document.getElementById('botonEntrenar').hidden = true;
    document.getElementById('botonEntrenarVisual').hidden = true;

    let listaVisitado = [];
    let sumaRecorrido;
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < Number(cantTrain.value); j++) {
        jugadores[i].pos_x = jugadores[3].pos_x;
        jugadores[i].pos_y = jugadores[3].pos_y;
        jugadores[i].ultimaPosicion = {x: jugadores[i].pos_x, y: jugadores[i].pos_y};
        listaVisitado = [];
        sumaRecorrido = 0;

        while (!(jugadores[i].pos_x === casa.pos_x && jugadores[i].pos_y === casa.pos_y)) {
          let xProc = jugadores[i].pos_x;
          let yProc = jugadores[i].pos_y;
          let esfuerzo;
          switch (mapa[xProc][yProc]) {
            case 0:
              esfuerzo = jugadores[i].afinidadNormal;
              break;
            case 2:
              esfuerzo = jugadores[i].afinidadAgua;
              break;
            case 3:
              esfuerzo = jugadores[i].afinidadMonte;
              break;
            case 4:
              esfuerzo = jugadores[i].afinidadBarranco;
              break;
            default:
              esfuerzo = 0;
          }

          jugadores[i].moveJugador();
          let xDest = jugadores[i].pos_x;
          let yDest = jugadores[i].pos_y;
          let flag = false;
          for (var f = 0; f < listaVisitado.length; f++) {
            if (xProc == listaVisitado[f].xProc && yProc == listaVisitado[f].yProc &&
              xDest == listaVisitado[f].xDest && yDest == listaVisitado[f].yDest) {
                flag = true;
                break;
            }
          }
          if (!flag) {
            sumaRecorrido += esfuerzo;
            listaVisitado.push({
              xProc: xProc,
              yProc: yProc,
              xDest: xDest,
              yDest: yDest
            });
          }
          // console.log(jugadores[i].pos_x, jugadores[i].pos_y);
          if ((jugadores[i].pos_x === casa.pos_x && jugadores[i].pos_y === casa.pos_y)) {
            if (jugadores[i].hasTrained) {
              let ajuste = jugadores[i].calcAjuste(sumaRecorrido);
              for (var z = 0; z < listaVisitado.length; z++) {
                for (var a = 0; a < grafo.listaAdy[(listaVisitado[z].xProc*tamFila)+listaVisitado[z].yProc].connections.length; a++) {
                  if (grafo.listaAdy[(listaVisitado[z].xProc*tamFila)+listaVisitado[z].yProc].connections[a].x == listaVisitado[z].xDest) {
                    if (grafo.listaAdy[(listaVisitado[z].xProc*tamFila)+listaVisitado[z].yProc].connections[a].y == listaVisitado[z].yDest) {
                      grafo.listaAdy[(listaVisitado[z].xProc*tamFila)+listaVisitado[z].yProc].connections[a].pond[i] += ajuste;
                    }
                  }
                }
              }
            }
            jugadores[i].updateEsfuerzo(sumaRecorrido);
          }
        }
      }
    }
    document.getElementById('botonMombo').hidden = false;
    document.getElementById('botonLucas').hidden = false;
    document.getElementById('botonPirolo').hidden = false;
    entrenador.trained = true;
  }
  enableInput();
}

function entrenarVisual(){
  if (jugadores[3].state == 'set' && casa.state == 'set') {
    document.getElementById('botonJugador').hidden = true;
    document.getElementById('botonCasa').hidden = true;
    document.getElementById('training').hidden = true;
    document.getElementById('trainTextContext').hidden = true;
    document.getElementById('trainText').hidden = true;
    document.getElementById('botonEntrenar').hidden = true;
    document.getElementById('botonEntrenarVisual').hidden = true;
    entrenador.startTraining(Number(cantTrain.value), jugadores[3].pos_x, jugadores[3].pos_y);
  }
}

//Inicializaciones
createMap();
grafo = new Grafo(mapa);
updateMap();
