//coordinates of tiles on the chess board image
const figurePositionsOnSourceImage = {
  black: {
    pawn: {
      x: 240,
      y: 223
    },
    rook: {
      x: 242,
      y: 96
    },
    knight: {
      x: 371,
      y: 100
    },
    bishop: {
      x: 497,
      y: 97
    },
    queen: {
      x: 623,
      y: 96
    },
    king : {
      x: 751,
      y: 96
    }
  },
  white: {
    pawn: {
      x: 237,
      y: 1569
    },
    rook: {
      x: 243,
      y: 1691
    },
    knight: {
      x: 371,
      y: 1695
    },
    bishop: {
      x: 496,
      y: 1694
    },
    queen: {
      x: 620,
      y: 1699
    },
    king: {
      x: 749,
      y:1698
    }
  }
};
const widthOfTile = 125;
const chessBoardWidthInPixels = 1180;
// x 246 старт black pawn x 240 y 223 black rook x 242 y 96 black night x 371 y 100 black bishop x 497 y 97 black queen x - 623 y - 96 black king - x 751 y 96
//white pawn x - 237 y - 1569 white rook x - 243, y - 1691, white knight x - 371, y - 1695, white bishop x - 496, y - 1694, white queen x - 620, y - 1699 white king x - 749 y 1698
const chessBoard = [];
let selectedSqare = null;
function canvasAnimation(){
  //drawing the chess board
  const canvasWidth = parseInt(canvasEl.offsetWidth);
  //ctx.scale(scaleRatio, scaleRatio);
  ctx.drawImage(chessBoardImage, 160, 360, chessBoardWidthInPixels, chessBoardWidthInPixels, 0, 0, chessBoardWidthInPixels, chessBoardWidthInPixels);
  if (selectedSqare != null){
    ctx.fillStyle = "#7FFFD4";
    ctx.fillRect(87 + selectedSqare[1] * 125.7, 88.5 + (7 - selectedSqare[0]) * 125.7, widthOfTile, widthOfTile);
  };
  for (let i in chessBoard){
    const row = chessBoard[i];
    for (let j in row){
      const square = row[j]; 
      if (square != null){
        const x_crop = figurePositionsOnSourceImage[square.color][square.kind]["x"];
        const y_crop = figurePositionsOnSourceImage[square.color][square.kind]["y"];
        ctx.drawImage(chessBoardImage, x_crop, y_crop, widthOfTile, widthOfTile, 
                      87 + square.col_pos * 125.7, 
                      88.5 + (7 - square.row_pos) * 125.7, widthOfTile, widthOfTile);
      };
    };
  };
};

function resize(){
  let canvasWidth;
  if (screen.availWidth > screen.availHeight){
    canvasWidth = screen.availHeight * 0.8;
  }else{
    canvasWidth = screen.availWidth * 0.8;
  };
  const devicePixelRatio = window.devicePixelRatio;
  //adjusting width and height of the canvas with user device's scale of the page
  canvasWidth /= window.visualViewport.scale;
  canvasScaleRatio = canvasWidth/chessBoardWidthInPixels;
  canvasEl.setAttribute("width",`${canvasWidth}`);
  canvasEl.setAttribute("height",`${canvasWidth}`);
  ctx.scale(canvasScaleRatio,canvasScaleRatio);
  canvasAnimation();
};

function touchSquare(event){
  const canvasEl = document.getElementById("gameCanvas");
  const ctx = canvasEl.getContext("2d");
  const startOfCanvasX = canvasEl.offsetLeft + canvasEl.clientLeft;
  const startOfCanvasY = canvasEl.offsetTop + canvasEl.clientTop;
  const endOfCanvasX = startOfCanvasX + canvasEl.offsetWidth;
  const endOfCanvasY = startOfCanvasY + canvasEl.offsetHeight;
  const chessAsideWidth = (canvasEl.offsetWidth/chessBoardWidthInPixels) * 90;
  const chessAsideHeight = (canvasEl.offsetHeight/chessBoardWidthInPixels) * 90;
  const chessTileWidth = (canvasEl.offsetWidth/chessBoardWidthInPixels) * widthOfTile;
  const startOfBoardX = chessAsideWidth + startOfCanvasX;
  const startOfBoardY = chessAsideHeight + startOfCanvasY;
  const endOfBoardX = endOfCanvasX - chessAsideWidth;
  const endOfBoardY = endOfCanvasY - chessAsideHeight;
  if (event.pageX > startOfBoardX && event.pageX < endOfBoardX && event.pageY > startOfBoardY && event.pageY < endOfBoardY)
  {
      const clickedCol = Math.floor(((event.pageX - startOfBoardX)/chessTileWidth));
      const clickedRow = Math.floor(((endOfBoardY - event.pageY)/chessTileWidth));
      selectedSqare = [clickedRow, clickedCol];
      canvasAnimation();
  };
};

const canvasEl = document.getElementById("gameCanvas");
canvasEl.addEventListener("click",touchSquare);
const ctx = canvasEl.getContext("2d");
let canvasScaleRatio;
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "../static/images/chessBoard.png";
chessBoardImage.onload = resize;
const radioButtons = document.getElementsByClassName("inputTypeOfGame");
let typeOfGame = "userVSCPU";
for (let i = 0; i < 8; i++){
  const row = [];
  for (let j = 0; j < 8; j++){
    row.push(null);
  };
  chessBoard.push(row);
}
for(let button of radioButtons){
  button.addEventListener("change",selectTypeOfGame);
}

function selectTypeOfGame(){
  if(this.value == "CPUVSCPU"){
    typeOfGame = this.value;
    document.getElementById("choose1Computer").style.visibility = "visible";
    document.getElementById("choose2Computer").style.visibility = "visible";
    document.querySelector("label[for='choose1Computer']").style.visibility  = "visible";
    document.querySelector("label[for='choose2Computer']").style.visibility  = "visible";
  }else if(this.value == "HotSeat")
  {
    typeOfGame = this.value;
    document.getElementById("choose1Computer").style.visibility = "hidden";
    document.getElementById("choose2Computer").style.visibility = "hidden";
    document.querySelector("label[for='choose1Computer']").style.visibility  = "hidden";
    document.querySelector("label[for='choose2Computer']").style.visibility  = "hidden";
  }else if(this.value == "userVSCPU"){
    typeOfGame = this.value;
    document.getElementById("choose1Computer").style.visibility = "visible";
    document.getElementById("choose2Computer").style.visibility = "hidden";
    document.querySelector("label[for='choose1Computer']").style.visibility  = "visible";
    document.querySelector("label[for='choose2Computer']").style.visibility  = "hidden";
  };
};

const buttonStartGame = document.getElementById("startGame");
buttonStartGame.addEventListener("click",startGame);

function startGame(){
  dataForRequest = new Object();
  dataForRequest.typeOfRequest = "formData";
  dataForRequest.typeOfGame = typeOfGame;
  const radioButtons = document.getElementsByClassName("hiddenRadioButton");
  let chosenColor;
  for(let button of radioButtons){
    if (button.checked){
      chosenColor = button.value;
    };
  };
  dataForRequest.color = chosenColor
  if (typeOfGame == "CPUVSCPU"){
    const CPU1 = document.getElementById("choose1Computer").value;
    const CPU2 = document.getElementById("choose2Computer").value;
    dataForRequest.CPU1 = CPU1;
    dataForRequest.CPU2 = CPU2;
  }else if (typeOfGame == "userVSCPU"){
    const CPU1 = document.getElementById("choose1Computer").value;
    dataForRequest.CPU1 = CPU1;
  }
  $ajaxUtils.sendGetRequest('/start_game',gameLoad,dataForRequest);
}

function gameLoad(response){
  result_obj = JSON.parse(response.responseText);
  for (let i in result_obj){
    const rowPos = result_obj[i].row_pos;
    const colPos = result_obj[i].col_pos;
    chessBoard[rowPos][colPos] = result_obj[i];
  };
  canvasAnimation();
  const canvas = document.getElementById("gameCanvas");
  const initialPage = document.getElementById("initialPage");
  canvas.style.visibility = "visible";
  initialPage.style.visibility = "hidden";
};