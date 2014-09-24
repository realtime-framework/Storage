


// Create a storage reference
var storageRef = Realtime.Storage.create({
	applicationKey: "2Ze1dz",
	authenticationToken: "TodoRealtimeStorage"
});

// Create a table reference
var tableRef = storageRef.table("todoTable");


tableRef.on("update", function(itemSnapshot) {
    var item = itemSnapshot.val();
    var row = document.getElementById(item.timestamp);
	var state = document.getElementById('check_'+item.timestamp);

	if (row) {
		setState(state, row, item);  
	}else{
		var table = document.getElementById('todo-list');
		table.innerHTML += "<tr class='' id='"+item.timestamp+"'><td>"+item.task+"</td><td id='check_"+item.timestamp+"'></td><td><a href='index.php?delete="+item.timestamp+"' class=\"btn btn-danger\">Delete</a></td></tr>"; 
		var row = document.getElementById(item.timestamp);
		var state = document.getElementById('check_'+item.timestamp);
		setState(state, row, item);  
	}
}); 

tableRef.on("delete", function(itemSnapshot) {
	var item = itemSnapshot.val();
    var row = document.getElementById(item.timestamp);
    if (row) {
  	  row.parentNode.removeChild(row);
	};
});

function setState(state, row, item){
	if (item.state == 0) 
	{
    	row.className = 'danger';
    	state.innerHTML = "<a href='index.php?update="+item.timestamp+"&val=0' class=\"btn btn-warning\">To-do</a>";
    }else
    {
    	row.className = 'success';
    	state.innerHTML = "<a href='index.php?update="+item.timestamp+"&val=0' class=\"btn btn-success\">Done</a>";
    }
}
