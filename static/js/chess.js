const figurePositionsOnSourceImage = [
    { color:"white",
      rank:"queen"
    }

];
function game(){
  ctx.drawImage(chessBoardImage, 0, 0, 200, 200, 10, 10, 50, 50);
}
const ctx = document.getElementById("gameCanvas").getContext("2d");
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "../static/images/chessBoard.jpg";
chessBoardImage.onload = game;
