const figurePositionsOnSourceImage = [
    { color:"white",
      rank:"queen"
    }

];
function game(){
  //drawing the chess board
  const canvasWidth = parseInt(canvasEl.offsetWidth);
  const scaleRatio = canvasWidth/chessBoardWidthInHTML;
  ctx.scale(scaleRatio, scaleRatio);
  console.log("some");
  ctx.drawImage(chessBoardImage, 160, 360, chessBoardWidthInPixels, chessBoardWidthInPixels, 0, 0, chessBoardWidthInHTML, chessBoardWidthInHTML/2);
}
const canvasEl = document.getElementById("gameCanvas");
const ctx = canvasEl.getContext("2d");
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "../static/images/chessBoard.jpg";
const chessBoardWidthInPixels = 1180;
const chessBoardWidthInHTML = 3000;
chessBoardImage.onload = game;
