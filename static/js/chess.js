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
}
const widthOfTile = 125
// x 246 старт black pawn x 240 y 223 black rook x 242 y 96 black night x 371 y 100 black bishop x 497 y 97 black queen x - 623 y - 96 black king - x 751 y 96
//white pawn x - 237 y - 1569 white rook x - 243, y - 1691, white knight x - 371, y - 1695, white bishop x - 496, y - 1694, white queen x - 620, y - 1699 white king x - 749 y 1698
function canvasAnimation(){
  //drawing the chess board
  const canvasWidth = parseInt(canvasEl.offsetWidth);
  //ctx.scale(scaleRatio, scaleRatio);
  console.log(ctx);
  ctx.drawImage(chessBoardImage, 160, 360, chessBoardWidthInPixels, chessBoardWidthInPixels, 0, 0, chessBoardWidthInPixels, chessBoardWidthInPixels);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["black"]["king"]["x"], 
                                  figurePositionsOnSourceImage["black"]["king"]["y"], widthOfTile, widthOfTile, 0, 0, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["black"]["queen"]["x"], 
                                  figurePositionsOnSourceImage["black"]["queen"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 1, 0, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["black"]["rook"]["x"], 
                                  figurePositionsOnSourceImage["black"]["rook"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 2, 0, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["black"]["bishop"]["x"], 
                                  figurePositionsOnSourceImage["black"]["bishop"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 3, 0, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["black"]["knight"]["x"], 
                                  figurePositionsOnSourceImage["black"]["knight"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 4, 0, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["black"]["pawn"]["x"], 
                                  figurePositionsOnSourceImage["black"]["pawn"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 5, 0, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["white"]["king"]["x"], 
                                  figurePositionsOnSourceImage["white"]["king"]["y"], widthOfTile, widthOfTile, 0, 600, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["white"]["queen"]["x"], 
                                  figurePositionsOnSourceImage["white"]["queen"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 1, 600, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["white"]["rook"]["x"], 
                                  figurePositionsOnSourceImage["white"]["rook"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 2, 600, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["white"]["bishop"]["x"], 
                                  figurePositionsOnSourceImage["white"]["bishop"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 3, 600, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["white"]["knight"]["x"], 
                                  figurePositionsOnSourceImage["white"]["knight"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 4, 600, widthOfTile, widthOfTile);
  ctx.drawImage(chessBoardImage, figurePositionsOnSourceImage["white"]["pawn"]["x"], 
                                  figurePositionsOnSourceImage["white"]["pawn"]["y"], widthOfTile, widthOfTile, (chessBoardWidthInPixels/8) * 5, 600, widthOfTile, widthOfTile);
}
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
}
const canvasEl = document.getElementById("gameCanvas");
const ctx = canvasEl.getContext("2d");
let canvasScaleRatio;
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "../static/images/chessBoard.jpg";
const chessBoardWidthInPixels = 1180;
chessBoardImage.onload = resize;
