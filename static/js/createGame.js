const radioButtons = document.getElementsByClassName("inputTypeOfGame");
let typeOfGame = "userVSCPU";
let cpuStrategy1 = null;
let cpuStrategy2 = null;

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
  