/****

	card 'class' 
	
****/

function Card(){
	
	this.name = "";
	this.image = ""; // img src goes here
	this.ability = function(){}; // the ability function generally needs a reference to the game instance to access enemy or player units 
	this.description = "";
	
}

export { Card };

