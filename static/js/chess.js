const figurePositionsOnSourceImage = [
    { color:"white",
      rank:"queen"
    }

];
function canvasAnimation(){
  //drawing the chess board
  const canvasWidth = parseInt(canvasEl.offsetWidth);
  //ctx.scale(scaleRatio, scaleRatio);
  ctx.drawImage(chessBoardImage, 160, 360, chessBoardWidthInPixels, chessBoardWidthInPixels, 0, 0, chessBoardWidthInPixels, chessBoardWidthInPixels/2);
}
function resize(){
  let canvasWidth;
  if (screen.availWidth > screen.availHeight){
    canvasWidth = screen.availHeight * 0.9;;
  }else{
    //canvasHeight = window.innerHeight;
    canvasWidth = screen.availWidth * 0.8;
  };
  const devicePixelRatio = window.devicePixelRatio;
  //adjusting width and height of the canvas with user device's scale of the page
  canvasWidth /= window.visualViewport.scale;
  const canvasScaleRatio = const scaleRatio = canvasWidth/chessBoardWidthInPixels;
  ctx.scale(canvasScaleRatio,canvasScaleRatio);
  canvasAnimation();
}
const canvasEl = document.getElementById("gameCanvas");
const ctx = canvasEl.getContext("2d");
const chessBoardImage = document.createElement("img");
chessBoardImage.src = "../static/images/chessBoard.jpg";
const chessBoardWidthInPixels = 1180;
const chessBoardWidthInHTML = 3000;
chessBoardImage.onload = resize;
