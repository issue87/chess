const figurePositionsOnSourceImage = [
    { color:"white",
      rank:"queen"
    }

];
const ctx = document.getElementById("gameCanvas").getContext("2d");
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "../static/images/chessBoard.jpg";
console.log(ctx);
console.log(chessBoardImage);
ctx.drawImage(chessBoardImage, 0, 0);
