/****

	card 'class' 
	
****/

/*
function Card(){
	
	this.name = "";
	this.image = ""; // img src goes here
	this.ability = function(){}; // the ability function generally needs a reference to the game instance to access enemy or player units 
	this.description = "";
	
}*/

class Card {
	constructor(name,  image, func, description){
		this.name = name;
		this.image = image;
		this.ability = func;
		this.description = description;
	}
}

export default Card;
//export { Card };

