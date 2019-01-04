function Deck(){

	let theDeck = [];
	
	// constructor 
	
	// add card to deck 
	this.add = function(card){
		theDeck.push(card);
	}
	
	// get deck size 
	this.size = function(){
		return theDeck.length;
	}
	
	// get a card
	this.remove = function(){
		if(theDeck.length === 0){
			return null;
		}else{
			return theDeck.pop();
		}
	}
	
	// draw a new hand (pull 3 cards) for the player 
	// @gameInstance = instance of Game object 
	this.drawCards = function(gameInstance){
		
		let deck = gameInstance.playerDeck();
		
		if(deck.length === 0){
			return;
		}
		
		// shuffle deck first?
		
		let max = 4;
		if(deck.length <= 2 && deck.length >= 1){
			max = deck.length;
		}
		
		for(let i = 1; i < max; i++){
			let randIndex = Math.floor(Math.random() * deck.length);
			let selectedCard = deck.remove();
		
			let cardDisplay = document.getElementById('card' + i);
			
			document.getElementById('card' + i + 'title').textContent = selectedCard.name;
			document.getElementById('card' + i + 'title').style.fontWeight = "bold";
			
			document.getElementById('card' + i + 'pic').setAttribute('src', selectedCard.image);
			document.getElementById('card' + i + 'pic').setAttribute('width', '200px');
			document.getElementById('card' + i + 'pic').setAttribute('height', '150px');
			document.getElementById('card' + i + 'pic').style.marginTop = "10px";
			
			document.getElementById('card' + i + 'description').textContent = selectedCard.description;
			
			let newButton = document.createElement('button');
			newButton.style.marginTop = '10px';
			newButton.textContent = 'activate';
			newButton.id = 'card' + i + 'button';
			
			// not really relevant, but good reminder -  i thought i might've needed it somewhere 
			// https://stackoverflow.com/questions/8909652/adding-click-event-listeners-in-loop
			// https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example?noredirect=1&lq=1
			newButton.onclick = function(){ selectedCard.ability(gameInstance) };
			
			cardDisplay.appendChild(newButton);
		}
		
	}
}

export { Deck };