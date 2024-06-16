(function (global) {

// Set up a namespace for our utility
const ajaxUtils = {};


// Returns an HTTP request object
function getRequestObject() {
  if (global.XMLHttpRequest) {
    return (new XMLHttpRequest());
  }
  else if (global.ActiveXObject) {
    // For very old IE browsers (optional)
    return (new ActiveXObject("Microsoft.XMLHTTP"));
  }
  else {
    global.alert("Ajax is not supported!");
    return(null);
  }
}


// Makes an Ajax GET request to 'requestUrl'
ajaxUtils.sendGetRequest =
  function(requestUrl, responseHandler,data) {
    var request = getRequestObject();
    request.onreadystatechange =
      function() {
          if (responseHandler!==""){
              handleResponse(request, responseHandler);
          };
      };
    if (data.typeOfRequest=="fileData"){
         request.open("POST", requestUrl, true);
    };
    if (data.typeOfRequest=="GET"){
         request.open("GET", requestUrl, true);
         request.send();
    };
    if (data.typeOfRequest=="formData"){
         request.open("POST", requestUrl, true);
         request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
         dataString="";
         let counter = 0;
         for (key in data){
         if (counter!=0){
             dataString+="&";
         };
         dataString += key+"="+data[key];
             counter++;
         };
         request.send(dataString);
    };

  };


// Only calls user provided 'responseHandler'
// function if response is ready
// and not an error
function handleResponse(request,
                        responseHandler) {
  if ((request.readyState == 4) &&
     (request.status == 200)) {
    responseHandler(request)
  };
}


// Expose utility to the global object
global.$ajaxUtils = ajaxUtils;


})(window);