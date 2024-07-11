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
const colors = ["white", "black"]
const colorNumberSign = {"white": 0, "black": 1};
const figures_representation = ["king", "queen", "rook", "bishop", "knight", "pawn"]

//number constants 
const humanPlayer = 0;
const computerPlayer = 1;
const whiteChessColor = 0;
const blackChessColor = 1;

const widthOfTile = 125;
const chessBoardWidthInPixels = 1180;

// x 246 старт black pawn x 240 y 223 black rook x 242 y 96 black night x 371 y 100 black bishop x 497 y 97 black queen x - 623 y - 96 black king - x 751 y 96
//white pawn x - 237 y - 1569 white rook x - 243, y - 1691, white knight x - 371, y - 1695, white bishop x - 496, y - 1694, white queen x - 620, y - 1699 white king x - 749 y 1698

let selectedSqare = null;
let promotedSquare = null;
let moveFrom = null;
let gameObject = null;

class Player{
  constructor(typeOfPlayer, color){
    this._typeOfPlayer = typeOfPlayer;
    this._color = color;
  }

  get typeOfPlayer(){
    return this._typeOfPlayer;
  }

  get color(){
    return this._color;
  }
};

class Game{
  /*keeps the game track. 
  Canvas animation class uses its board for rendering figures on the canvas. 
  There is a similar class on the server side*/

  constructor(whitePlayer, blackPlayer, chessboard){
    this._currentPlayer = whitePlayer;
    this._otherPlayer = blackPlayer;
    this._chessBoard = chessboard;
    this._eatenWhiteFigures = []
    this._eatenBlackFigures = []
    this._draw = false
    this._drawReason = null
    this._mate = false
  }

  get currentPlayer(){
    return this._currentPlayer;
  }

  get otherPlayer(){
    return this._otherPlayer;
  }
  
  get chessBoard(){
    return this._chessBoard;
  }

  set currentPlayer(player){
    this._currentPlayer = player;
  }

  set otherPlayer(player){
    this._otherPlayer = player;
  }

  isDraw(){
    return this._draw;
  }

  isMate(){
    return this._mate;;
  }

  setDraw(drawReason){
    this._drawReason = drawReason;
    this._draw = true;
  }

  setMate(){
    this._mate = true;
  }

  switchPlayer(){
    [this.currentPlayer, this.otherPlayer] = [this.otherPlayer, this.currentPlayer];
  }

  getSquare(row, col){
    return this._chessBoard[row][col];
  }

  moveFigure(fromRow, fromCol, toRow, toCol){
    if (this.getSquare(toRow, toCol) != null){
      if(colorNumberSign[this.getSquare(toRow, toCol).color] == whiteChessColor){
        this._eatenWhiteFigures.push(this.getSquare(toRow, toCol));
      }else{
        this._eatenBlackFigures.push(this.getSquare(toRow, toCol));
      }
    };
    this._chessBoard[toRow][toCol] = this.getSquare(fromRow, fromCol);
    this._chessBoard[fromRow][fromCol] = null;
  }

  eatFigureEnPassant(fromRow, toCol){
    this._eatenBlackFigures.push(this.getSquare(fromRow, toCol));
    this._chessBoard[fromRow][toCol] = null;
  }

  promote(figure){
    this._chessBoard[figure.row_pos][figure.col_pos] = figure;
  }
};

function canvasAnimation(){
  //drawing the chess board
  const canvasWidth = parseInt(canvasEl.offsetWidth);
  //ctx.scale(scaleRatio, scaleRatio);
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.drawImage(chessBoardImage, 160, 360, chessBoardWidthInPixels, chessBoardWidthInPixels, 0, 0, chessBoardWidthInPixels, chessBoardWidthInPixels);
  if (selectedSqare != null){
    ctx.fillStyle = "#7FFFD4";
    ctx.fillRect(87 + selectedSqare[1] * 125.7, 88.5 + (7 - selectedSqare[0]) * 125.7, widthOfTile, widthOfTile);
  };
  for (let i = 0; i <= 7; i++){
    for (let j = 0; j <= 7; j++){
      const square = gameObject.getSquare(i, j);
      if (square != null){
        const x_crop = figurePositionsOnSourceImage[square.color][square.kind]["x"];
        const y_crop = figurePositionsOnSourceImage[square.color][square.kind]["y"];
        ctx.drawImage(chessBoardImage, x_crop, y_crop, widthOfTile, widthOfTile, 
                      87 + j * 125.7, 
                      88.5 + (7 - i) * 125.7, widthOfTile, widthOfTile);
      };
    };
  };
  if (promotedSquare){
    const color = gameObject.getSquare(promotedSquare[0], promotedSquare[1]).color;
    if (promotedSquare[0] == 0){
      for(let i = 1; i < 5; i++){
        ctx.fillStyle = "#8A2BE2";
        ctx.fillRect(87 + promotedSquare[1] * 125.7, 88.5 + (7 - i) * 125.7, widthOfTile, widthOfTile);
        const x_crop = figurePositionsOnSourceImage[color][figures_representation[i]]["x"];
        const y_crop = figurePositionsOnSourceImage[color][figures_representation[i]]["y"];
        ctx.drawImage(chessBoardImage, x_crop, y_crop, widthOfTile, widthOfTile, 
                      87 + promotedSquare[1] * 125.7, 
                      88.5 + (7 - i) * 125.7, widthOfTile, widthOfTile);
      }
    }
    else{
      for(let i = 6; i > 2; i--){
        ctx.fillStyle = "#8A2BE2";
        ctx.fillRect(87 + promotedSquare[1] * 125.7, 88.5 + (7 - i) * 125.7, widthOfTile, widthOfTile);
        const x_crop = figurePositionsOnSourceImage[color][figures_representation[7 - i]]["x"];
        const y_crop = figurePositionsOnSourceImage[color][figures_representation[7 - i]]["y"];
        ctx.drawImage(chessBoardImage, x_crop, y_crop, widthOfTile, widthOfTile, 
                      87 + promotedSquare[1] * 125.7, 
                      88.5 + (7 - i) * 125.7, widthOfTile, widthOfTile);
      }
    }
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
  //ctx.scale(canvasScaleRatio,canvasScaleRatio);
  if (gameObject != null){
    canvasAnimation();
  };
};

function touchSquare(event){
  /*handles user's click event on canvas. 
  If there weren't selected any figures before and an user clicked on the square where figure is located, it selects figure.
   When there is a selected figure, it moves that figure to the square is being clicking on.*/
  const startOfCanvasX = canvasEl.offsetLeft + canvasEl.clientLeft;
  const startOfCanvasY = canvasEl.offsetTop + canvasEl.clientTop;
  const endOfCanvasX = startOfCanvasX + canvasEl.offsetWidth;
  const endOfCanvasY = startOfCanvasY + canvasEl.offsetHeight;
  const chessAsideWidth = (canvasEl.offsetWidth/chessBoardWidthInPixels) * 87;
  const chessAsideHeight = (canvasEl.offsetHeight/chessBoardWidthInPixels) * 88.5;
  const chessTileWidth = (canvasEl.offsetWidth/chessBoardWidthInPixels) * 125.7;
  const startOfBoardX = chessAsideWidth + startOfCanvasX;
  const startOfBoardY = chessAsideHeight + startOfCanvasY;
  const endOfBoardX = endOfCanvasX - chessAsideWidth;
  const endOfBoardY = endOfCanvasY - chessAsideHeight;
  //checking if game is finished
  if (gameObject.isDraw()||gameObject.isMate()){
    return;
  }
  if (event.pageX > startOfBoardX && event.pageX < endOfBoardX && event.pageY > startOfBoardY && event.pageY < endOfBoardY)
  {
      const clickedCol = Math.floor(((event.pageX - startOfBoardX)/chessTileWidth));
      const clickedRow = Math.floor(((endOfBoardY - event.pageY)/chessTileWidth));
      if(promotedSquare){
        //check if user clicked on the figures that were drawn for choosing
        if (Math.abs(promotedSquare[0] - clickedRow) < 5 && promotedSquare[1] == clickedCol){
          const chosenFigureIndex = Math.abs(promotedSquare[0] - clickedRow);
          dataForRequest = new Object();
          dataForRequest.typeOfRequest = "formData";
          dataForRequest.fromRow = moveFrom[0];
          dataForRequest.fromCol = moveFrom[1];
          dataForRequest.toRow = promotedSquare[0];
          dataForRequest.toCol = promotedSquare[1];
          dataForRequest.chosenFigureIndex = chosenFigureIndex; 
          $ajaxUtils.sendGetRequest('/register_promotion', handleChooseFigureForPromotion, dataForRequest);
          promotedSquare = null;
          moveFrom = null;
        }
      
      }
      if(selectedSqare){
        if(gameObject.getSquare(clickedRow, clickedCol) != null){
          if(gameObject.getSquare(selectedSqare[0], selectedSqare[1]).color == gameObject.getSquare(clickedRow, clickedCol).color){
            selectedSqare = [clickedRow, clickedCol];
            canvasAnimation();
            return;
          }

        };
        dataForRequest = new Object();
        dataForRequest.typeOfRequest = "formData";
        dataForRequest.fromRow = selectedSqare[0];
        dataForRequest.fromCol = selectedSqare[1];
        dataForRequest.toRow = clickedRow;
        dataForRequest.toCol = clickedCol;
        $ajaxUtils.sendGetRequest('/player_move', handlePlayerMove, dataForRequest);
        selectedSqare = null;
        return;
      };
      if (gameObject.getSquare(clickedRow, clickedCol) != null){
        /*checking figure was touched belongs to player who must move now, because figure color is a string and player color is a number it uses colorNumberSign to translate string 
        into its number representation*/
        if (colorNumberSign[gameObject.getSquare(clickedRow, clickedCol).color] == gameObject.currentPlayer.color && gameObject.currentPlayer.typeOfPlayer == humanPlayer){
          selectedSqare = [clickedRow, clickedCol];
          canvasAnimation();
        };
      };
  };
};

function acceptDrawFiftyMoves(){
  dataForRequest = new Object();
  dataForRequest.typeOfRequest = "GET";
  $ajaxUtils.sendGetRequest('/accept_draw_50_moves', acceptDrawFiftyMovesFinish, dataForRequest);
};

function acceptDrawFiftyMovesFinish(response){
  const result_obj = JSON.parse(response.responseText);
  if (result_obj.approved){
    gameObject.setDraw(result_obj.drawReason);
    const gameMessage = document.getElementById("gameMessage");
    gameMessage.innerText = result_obj.drawReason;
  }
}

const canvasEl = document.getElementById("gameCanvas");
canvasEl.addEventListener("click",touchSquare);
const ctx = canvasEl.getContext("2d");
canvasEl.setAttribute("width", chessBoardWidthInPixels);
canvasEl.setAttribute("height", chessBoardWidthInPixels);
//ctx.imageSmoothingEnabled = false;
// For Gecko (Firefox)
//ctx.mozImageSmoothingEnabled = false;
// For Webkit (Chrome, Safari)
//ctx.webkitImageSmoothingEnabled = false;
let canvasScaleRatio;
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "../static/images/chessBoard.png";
chessBoardImage.onload = resize;
const radioButtons = document.getElementsByClassName("inputTypeOfGame");
let typeOfGame = "userVSCPU";
let cpuStrategy1 = null;
let cpuStrategy2 = null;
const fiftyMovesBtn =document.getElementById("draw50Moves");
fiftyMovesBtn.addEventListener("click", acceptDrawFiftyMoves);
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

function requestforCPUMove(){
  dataForRequest = new Object();
  dataForRequest.typeOfRequest = "GET";
  $ajaxUtils.sendGetRequest('/cpu_move', handleCPUMove, dataForRequest);
}

function handlePlayerMove(response){
  const result_obj = JSON.parse(response.responseText);
  if (!result_obj.approved){
    const gameMessage = document.getElementById("gameMessage");
    gameMessage.innerText = result_obj.message;
  }else if (result_obj.choosePromotedFigure){
    gameObject.moveFigure(result_obj.moveFrom[0], result_obj.moveFrom[1], result_obj.moveTo[0], result_obj.moveTo[1]);
    canvasAnimation();
    promotedSquare = result_obj.moveTo;
    moveFrom = result_obj.moveFrom;
    canvasAnimation();
  }
  else{
    handleCPUMove(response);
  };
}

function handleChooseFigureForPromotion(response){
  const result_obj = JSON.parse(response.responseText);
  gameObject.promote(result_obj.promotedFigure); 
  canvasAnimation();
  if (!result_obj.mate && !result_obj.draw){
    gameObject.switchPlayer();
    if (gameObject.currentPlayer.typeOfPlayer == computerPlayer){
      requestforCPUMove();
    }
  }else{
    let message;
    if (result_obj.mate){
      gameObject.setMate();
      message = colors[gameObject.otherPlayer.color] + " is checkmated";
    }else{
      gameObject.setDraw(result_obj.drawReason);
      message = "draw: " + result_obj.drawReason;
    }
    const gameMessage = document.getElementById("gameMessage");
    gameMessage.innerText = message;
  }
}

function handleCPUMove(response){
  const result_obj = JSON.parse(response.responseText);
  gameObject.moveFigure(result_obj.moveFrom[0], result_obj.moveFrom[1], result_obj.moveTo[0], result_obj.moveTo[1]);
  if (result_obj.promotion){
    gameObject.promote(result_obj.promotedFigure);  
  }else if(result_obj.castling){
    if(result_obj.moveFrom[1] > result_obj.moveTo[1]){
      gameObject.moveFigure(result_obj.moveFrom[0], 0, result_obj.moveTo[0], 3);
    }else{
      gameObject.moveFigure(result_obj.moveFrom[0], 7, result_obj.moveTo[0], 5)
    }

  }else if(result_obj.enPassant){
    gameObject.eatFigureEnPassant(result_obj.moveFrom[0], result_obj.moveTo[1]);
  }
  canvasAnimation();
  if (!result_obj.mate && !result_obj.draw){
    gameObject.switchPlayer();
    if (gameObject.currentPlayer.typeOfPlayer == computerPlayer){
      requestforCPUMove();
    }else{
      if (result_obj.request_for_draw_50_moves){
        const fiftyMovesBtn =document.getElementById("draw50Moves");
        console.log("50moves");
        if (!(fiftyMovesBtn.style.visibility == "visible")){
          fiftyMovesBtn.style.visibility = "visible";
        }
      }
    }
    if (!result_obj.request_for_draw_50_moves && document.getElementById("draw50Moves").style.visibility == "visible"){
      document.getElementById("draw50Moves").style.visibility = "hidden";
    }
  }else{
    let message;
    if (result_obj.mate){
      gameObject.setMate();
      message = colors[gameObject.otherPlayer.color] + " is checkmated";
    }else{
      gameObject.setDraw(result_obj.drawReason);
      message = "draw: " + result_obj.drawReason;
    }
    const gameMessage = document.getElementById("gameMessage");
    gameMessage.innerText = message;
  }
}

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
  dataForRequest.color = chosenColor;
  if (typeOfGame == "CPUVSCPU"){
    cpuStrategy1 = document.getElementById("choose1Computer").value;
    cpuStrategy2 = document.getElementById("choose2Computer").value;
    dataForRequest.CPU1 = cpuStrategy1;
    dataForRequest.CPU2 = cpuStrategy2;
  }else if (typeOfGame == "userVSCPU"){
    cpuStrategy1 = document.getElementById("choose1Computer").value;
    dataForRequest.CPU1 = cpuStrategy1;
  }
  $ajaxUtils.sendGetRequest('/start_game', gameLoad, dataForRequest);
}

function gameLoad(response){
  /*This function gets initial data from server, where game class has been iniated.
   After that the function iniates game class object in js.
   At the end it starts canvas animation, hides setting game section*/
  const result_obj = JSON.parse(response.responseText);
  const board = result_obj.board;
  const chessBoard = []
  for (let i = 0; i < 8; i++){
    const row = [];
    for (let j = 0; j < 8; j++){
      row.push(null);
    };
    chessBoard.push(row);
  };
  for (let i in board){
    const rowPos = board[i].row_pos;
    const colPos = board[i].col_pos;
    chessBoard[rowPos][colPos] = board[i];
  };
  const player1JSON = result_obj.players[0];
  const player2JSON = result_obj.players[1];
  let player1 = new Player(player1JSON.playerType, player1JSON.color);
  let player2 = new Player(player2JSON.playerType, player2JSON.color);
  //Guaranteeing that first player's color is white 
  if (player1.color == blackChessColor){
    [player1, player2] = [player2, player1];
    if (player1.typeOfPlayer == computerPlayer && player2.typeOfPlayer == computerPlayer){
      [cpuStrategy1, cpuStrategy2] = [cpuStrategy2, cpuStrategy1];
    }
  };
  //
  const playerWhiteHeader = document.getElementById("whitePlayerName");
  const playerBlackHeader = document.getElementById("blackPlayerName");
  if (player1.typeOfPlayer == humanPlayer && player2.typeOfPlayer == humanPlayer){
    playerWhiteHeader.innerText = "Player 1";
    playerBlackHeader.innerText = "Player 2";
  } else if(player1.typeOfPlayer == computerPlayer && player2.typeOfPlayer == computerPlayer){
    playerWhiteHeader.innerText = "CPU: " + cpuStrategy1;
    playerBlackHeader.innerText = "CPU: " + cpuStrategy2;
  }else if (player1.typeOfPlayer == computerPlayer){
    playerWhiteHeader.innerText = "CPU: " + cpuStrategy1;
    playerBlackHeader.innerText = "Player";
  } else {
    playerBlackHeader.innerText = "CPU: " + cpuStrategy1;
    playerWhiteHeader.innerText = "Player";
  };
  gameObject = new Game(player1, player2, chessBoard);
  canvasAnimation();
  document.getElementById("choose1Computer").style.visibility = "hidden";
  document.getElementById("choose2Computer").style.visibility = "hidden";
  document.querySelector("label[for='choose1Computer']").style.visibility  = "hidden";
  document.querySelector("label[for='choose2Computer']").style.visibility  = "hidden";
  const gsmeCont = document.getElementById("gameContainer");
  const initialPage = document.getElementById("initialPage");
  gsmeCont.style.visibility = "visible";
  initialPage.style.visibility = "hidden";
  initialPage.style.height = 0;
  if (gameObject.currentPlayer.typeOfPlayer == computerPlayer){
    requestforCPUMove();
  }
};



