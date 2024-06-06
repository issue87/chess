const figurePositionsOnSourceImage = [
    { color:"white",
      rank:"queen"
    }

];
function game(){
  //drawing the chess board
  ctx.drawImage(chessBoardImage, 160, 360, 1180, 1180, 10, 10, 50, 50);
}
const ctx = document.getElementById("gameCanvas").getContext("2d");
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "../static/images/chessBoard.jpg";
chessBoardImage.onload = game;
