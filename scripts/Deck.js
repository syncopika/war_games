
class Deck {

	constructor(){
		this.theDeck = [];
	}
	
	// add card to deck 
	add(card){
		this.theDeck.push(card);
	}
	
	// get deck size 
	size(){
		return this.theDeck.length;
	}
	
	// get a card
	remove(){
		if(this.theDeck.length === 0){
			return null;
		}else{
			return this.theDeck.pop();
		}
	}
	
}

export { Deck };