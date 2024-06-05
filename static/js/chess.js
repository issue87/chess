const figurePositionsOnSourceImage = [
    { color:"white",
      rank:"queen"
    }

];
const ctx = document.getElementById("gameCanvas").getContext("2d");
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "static/images/chessBoard.jpg";
ctx.drawImage(chessBoardImage, 0, 0);
