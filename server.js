//requirements for node.js modules
var mongo = require("mongodb").MongoClient;
var client = require("socket.io").listen(8083).sockets;

//connecting the application to the database
mongo.connect('mongodb://127.0.0.1/chat',function(err,db){
	if (err)
		throw err;

	//If a client is connected to the server, do the following code
	client.on('connection',function(socket){
		console.log('Someone has connected');							//testing on the server to see if someone is connected

	
		var col = db.collection('messages');							//sets a variable to access the 'messages' database
		var sendStatus = function(status){								//sends an event 'status' to update the status bar on the client side
			socket.emit('status', status);								
		};


		//Collects data from the database and sends the results to the client with the event 'output'
		col.find().limit(100).sort({_id:1}).toArray(function(err,res){
			if (err)
				throw err;
			socket.emit('output',res);
		});

		//Listens for an 'input' event from the client and stores it in the database where it is immediately read back out onto the client
		socket.on('input',function(data){
			console.log(data);
			var name= data.name;
			var message= data.message;
			var whitespacePattern = /^\s*$/;

			//Requires a name be put down in order for a message to be saved
			if(whitespacePattern.test(name)){
				console.log('Invalid');
				sendStatus('Name required');
			} 
			else {
				col.insert({name:name,message:message},function(){		//insert a name and a message onto the database

					client.emit('output',[data]);						//sends out the 'output' data to the client where an Event Listener should pick it up
					sendStatus({message:"Message sent",clear:true});	//changes the status on the client and clears the text area on the client
					console.log("Inserted");
				});	
			}

		});

		//Listens for a 'clear' event and wipes the database if one is heard
		socket.on('clear',function(){
			console.log("Clear");										//test to see if 'clear' was initiated
			db.collection('messages',function(err,collection){			//used to remove all items from the database
				collection.remove({},function(err,removed){
					
				});
				client.emit('clearspace');								//sends a 'clearspace' event to the client to clear the messages on the client-side
			});	
		});


	});
});