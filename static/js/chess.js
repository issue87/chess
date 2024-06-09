const figurePositionsOnSourceImage = [
    { color:"white",
      rank:"queen"
    }

];
function game(){
  //drawing the chess board
  const canvasWidth = parseInt(canvasEl.offsetWidth);
  ctx.scale(canvasWidth/imageWidthInPixels); 
  ctx.drawImage(chessBoardImage, 160, 360, imageWidthInPixels, imageWidthInPixels, 0, 0, imageWidthInPixels, imageWidthInPixels);
}
const canvasEl = document.getElementById("gameCanvas");
const ctx = canvasEl.getContext("2d");
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "../static/images/chessBoard.jpg";
const chessBoardWidthInPixels = 1180;
chessBoardImage.onload = game;
