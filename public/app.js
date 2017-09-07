document.addEventListener('DOMContentLoaded', getRows);

// Get table data and display
function getRows() {
	if (window.location.pathname == '/') {
        var req = new XMLHttpRequest(); 
        var url = "/getrows";
        req.open("GET", url, true);
        req.addEventListener('load', function() {
          if(req.status >= 200 && req.status < 400){
            var response = JSON.parse(req.responseText);
            displayRows(response);
          } else {
              console.log("Error in network request: " + req.statusText);
          }
        });
        req.send(null);
	} 
}

// Construct table
function displayRows(object) {
	var rowsArray = JSON.parse(object.results)
	var table = document.getElementById("table");
	for (var i = 0; i < rowsArray.length; i++) {
      var row = document.createElement("tr");
      row.id = rowsArray[i].id;
      var name = document.createElement("td");
      name.innerHTML = rowsArray[i].name;
      row.appendChild(name);
      var weight = document.createElement("td");
      weight.innerHTML = rowsArray[i].weight;
      row.appendChild(weight);
      var unit = document.createElement("td");
      unit.innerHTML = rowsArray[i].lbs;
      row.appendChild(unit);
      var reps = document.createElement("td");
      reps.innerHTML = rowsArray[i].reps;
      row.appendChild(reps);
      var date = document.createElement("td");
      date.innerHTML = rowsArray[i].date;
      row.appendChild(date);
      var change = document.createElement("td");
      change.innerHTML = '<form action="/getId" method="post"><input type="hidden" name="id" value="' + row.id + '"/><input type="submit" class="btn-block" value="Edit"/>' + '<input type="button"  class="btn-block" value="Delete" onclick="deleteRow(this)"/></form>';
      row.appendChild(change);
	    table.appendChild(row);
	}
}

// Retrieve form values and submit insertion request
function insertRow(element) {
	var query = '';
	for( var i = 0; i < element.form.elements.length-1; i++)
	{
        if (element.form.elements[i].value === "") {
    		alert("Please complete all fields!");
    		return
    	}
        var name = element.form.elements[i].name;
        var value = element.form.elements[i].value;
        query += name + '=' + value + '&';
	}
	var url = "/insert?" + query;
    var req = new XMLHttpRequest(); 
     req.open("GET", url, true);
     req.addEventListener('load', function() {
       if(req.status >= 200 && req.status < 400){
         var response = JSON.parse(req.responseText);
         displayRows(response);
       } else {
           console.log("Error in network request: " + req.statusText);
       }
     }); 
     req.send(null);
}

// Delete row and if successfull remove from table.
function deleteRow(element) {
     var rowId = element.form.elements[0].value;
     console.log(rowId);
     var req = new XMLHttpRequest(); 
     var url = "/delete?id=" + rowId;
     req.open("GET", url, true);
     req.addEventListener('load', function() {
       if(req.status >= 200 && req.status < 400){
            var table = document.getElementById("table");
            var row = document.getElementById(rowId);
            table.removeChild(row);
       } else {
           console.log("Error in network request: " + req.statusText);
       }
     }); 
     req.send(null);
}

// Update row  and return to main page
function updateRow(element) {
	var query = '';
	for( var i = 0; i < element.form.elements.length-1; i++ )
	{
	   var name = element.form.elements[i].name;
	   var value = element.form.elements[i].value;
	   query += name + '=' + value + '&';
	}
  var url = "/safe-update?" + query; 
  var req = new XMLHttpRequest(); 
  req.open("GET", url, true);
  req.addEventListener('load', function() {
      if(req.status >= 200 && req.status < 400){
          window.location = "/";
      } else {
          console.log("Error in network request: " + req.statusText);
      }
  });    
  req.send(null);
}

