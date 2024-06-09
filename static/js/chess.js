const figurePositionsOnSourceImage = [
    { color:"white",
      rank:"queen"
    }

];
function canvasAnimation(){
  //drawing the chess board
  const canvasWidth = parseInt(canvasEl.offsetWidth);
  //ctx.scale(scaleRatio, scaleRatio);
  console.log(ctx);
  ctx.drawImage(chessBoardImage, 160, 360, chessBoardWidthInPixels, chessBoardWidthInPixels, 0, 0, chessBoardWidthInPixels, chessBoardWidthInPixels/2);
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
  console.log(canvasScaleRatio);
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
const chessBoardWidthInHTML = 3000;
chessBoardImage.onload = resize;
