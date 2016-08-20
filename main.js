//Ready Document function
$(function(){

	//Variables to easily utilize DOM elements
	var getNode = function(s){
		return document.querySelector(s);
	}
	var textarea = getNode('.chat-textarea');
	var chatName = getNode('.chat-name');
	var status = getNode('.chat-status span');
	var messages = getNode('.chat-messages');
	var statusDefault = status.textContent;
	var clear = getNode('#clear');

	//Function to set the alert of the status 'bar'
	var setStatus = function(s){
		status.textContent = s;

		if (s !== statusDefault){
			var delay=setTimeout(function(){
				setStatus(statusDefault);
				clearInterval();
			},3000);
		}
	};

	//Tries to establish a Web Socket connection to the server and throw otherwise
	try{
		var socket = io.connect('http://127.0.0.1:8083');
	} catch(e){

	}

	//If there is a connection, do everything
	if (socket !== undefined){
		console.log('socket connected');																		//test to see if the connection to the server is good

		//listens for 'output' event 
		socket.addEventListener('output', function(data){	
			console.log("message sent");		
			if(data.length){																					//↑ if an 'output' event is received, 
				for(var x=0;x<data.length;x++){																	//| this code basically prints the new message onto 
					var message=document.createElement('div');													//| the client's chat
					message.setAttribute('class','chat-message');												//|
					message.innerHTML="<span class=\"cnames\">"+data[x].name+"</span>"+": "+data[x].message;	//|
					messages.appendChild(message);																//|
					messages.scrollTop=messages.scrollHeight;													//↓
				}
			}
		});

		//listens for enter key
		textarea.addEventListener('keydown',function(event){
			var self = this;																					//assigns the values of the DOM elements to variables
			var name = chatName.value;

			if(event.which===13 && event.shiftKey===false){														//Pressing enter with the shift key doesn't send the message to the server
				socket.emit('input',{																			//Pressing the enter without the shift key sends the an 'input' event to the server with the name and message data
						name:name,
						message:self.value
				});
				event.preventDefault();
			}
		});

		clear.addEventListener('click',function(){																//listens for if the 'Clear' button was clicked
			console.log("Clicked");			
			socket.emit('clear');																				//sends a 'clear' event to the server that will wipe the database
			
		});

		socket.on('clearspace',function(){																		//listens for the 'clearspace' event
			console.log("Clear Space Init");
			messages.innerHTML='';																				//clears the chat
			setStatus("Cleared Chat");																			//set the status to let you know chat was cleared
		});

		//listens for the status of a message
		socket.addEventListener('status',function(data){														//Listens for a 'status' event
			setStatus((typeof data==="object") ? data.message : data);
			if(data.clear ===true){																				//receives data with a 'clear' datatype. If 'clear' happens to be true, clear the textfield where you type
				textarea.value='';
			}
		});
	}

})();