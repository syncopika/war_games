// global deck variable 
var deck = [];
// variable to hold dealt/drawn cards
var dealtCards = [];

/****
	card 'class' 
****/
function Card(){
	this.name = "";
	this.image = ""; // img src goes here
	this.ability = function(){};
	this.description = "";
}

/*****

	create some cards 
	
******/
var card1 = new Card();
card1.name = "complete domination";
card1.image = "mikudayo.png";
card1.ability = function(){
	// wipe out all enemies 
	for(var i = 0; i < enemies.length; i++){
		$('#grid').effect("shake");
		enemies[i].style.backgroundImage = "";
		enemies[i].classList.remove("enemy");
		enemies[i].setAttribute('health', null);
		enemies[i].setAttribute('attack', null);
	}
	enemies = [];
}
card1.description = "mikudayo wipes out all enemies. yay";

var card2 = new Card();
card2.name = "pancake sniper";
card2.image = "alolanRaichu.png";
card2.ability = function(){
	// place a pancake sniper aka alolan raichu on the field 
	// https://stackoverflow.com/questions/4402287/javascript-remove-event-listener
	
	// after picking this ability, the unit needs to be placed immediately
	// therefore, if there was a unit selected right before clicking this ability,
	// it needs to be unselected
	if(currentUnit){
		var elementPaths = getPathsDefault(currentUnit);
		for(key in elementPaths){
			if(elementPaths[key]){
				//elementPaths[key].style.border = "none";
				elementPaths[key].style.border = "1px solid #000";
			}
		}
		currentUnit.setAttribute('pathLight', 0);
		currentUnit = null;
	}
	
	function validSpace(e){

		var findDigit = e.target.id.match(/\d+/);
		
		if(findDigit !== null){
			var col = parseInt( e.target.id.match(/\d+/)[0] );
		
			// come up with a separate function to determine whether a square is within player territory
			if(col > 32){
				// highlight spot because this is a valid place to place unit
				e.target.style.border = "1px solid rgb(221, 223, 255)";
			}
		}
		
	}
	
	function leaveSpace(e){
		var findDigit = e.target.id.match(/\d+/);
		if(findDigit !== null){
			var col = parseInt( e.target.id.match(/\d+/)[0] );
			// come up with a separate function to determine whether a square is within player territory
			if(col > 32){
				e.target.style.border = "1px solid #000";
				
			}
		}
	}
	
	// update header to show unit 
	//var imgUrl = currElement.style.backgroundImage; // need to eliminate the 'url()' part from the string 
	//imgUrl = imgUrl.substring(imgUrl.indexOf('"')+1, imgUrl.indexOf(')')-1);  // note that this means the actual file path should not have quotes or parentheses!
	//document.getElementById('player').setAttribute('src', imgUrl);
	//document.getElementById('playerHealth').textContent = currElement.getAttribute("health");
	
	// need to disable clicking anything else other than a valid space after this card has been selected 
	document.getElementById('grid').addEventListener('mouseover', validSpace);
	document.getElementById('grid').addEventListener('mouseout', leaveSpace);
	document.getElementById('grid').addEventListener('click', function placeUnit(e){
	
		var col = parseInt( e.target.id.match(/\d+/)[0] );
		
		if(col > 32 && e.target.style.backgroundImage === ""){
		
			// place the unit 
			e.target.style.backgroundImage = "url('" + "alolanRaichu.png" + "')";
			e.target.setAttribute("health", 120);
			e.target.setAttribute("attack", 70);
			e.target.setAttribute("unitType", 'range2');
			player.push(e.target);	// add new unit to player's units array
			currentUnit = e.target;  // set as current unit 
			
			// remove highlighted border
			e.target.style.border = "1px solid #000";
			
			// remove the event listeners associated with this card
			document.getElementById('grid').removeEventListener('mouseout', leaveSpace);
			document.getElementById('grid').removeEventListener('mouseover', validSpace);
			document.getElementById('grid').removeEventListener('click', arguments.callee);
		}
	});
}
card2.description = "a floating electric mouse that has pancakes. after clicking 'activate', select a cell from any of the first three columns from the right to place a new unit. red highlighted squares indicate its attack range";

var card3 = new Card();
card3.name = "bear attack";
card3.image = "aoba6.png";
card3.ability = function(){
	
	// MAKE SURE TO CLEAR THE CARD AFTER USING IT! CLEAR CHILD NODES FROM PARENT
	console.log(this);
	// launch a bear attack on a specified enemy unit 
	// does 10 damage 
	// make sure to show damage done and which unit
	// NEED TO DISABLE MOVEUNIT() EXECUTION WHEN DOING THIS!

	// clear the currentUnit in case some unit is selected while trying to implement attack
	// don't forget possible ranged attack 
	if(currentUnit){
		var paths = getPathsDefault(currentUnit);
		for(path in paths){
			if(paths[path]){
				paths[path].style.border = "1px solid #000";
			}
		}
		
		var attackRange = getAttackRange(currentUnit, 2);
		for(path in attackRange){
			if(attackRange[path]){
				attackRange[path].style.border = "1px solid #000";
			}
		}
		
		// change pathLight so it will highlight when clicked on again 
		currentUnit.setAttribute("pathLight", 0);
		currentUnit = null;
	}
	
	function selectEnemyOn(e){
		if(e.target.className === "enemy"){
			e.target.style.border = "1px solid rgb(221, 223, 255)";
		}
	}
	
	function selectEnemyOut(e){
		if(e.target.className === "enemy"){
			e.target.style.border = "1px solid #000";
		}
	}
	
	document.getElementById('grid').addEventListener('mouseover', selectEnemyOn);
	document.getElementById('grid').addEventListener('mouseout', selectEnemyOut);
	document.getElementById('grid').addEventListener('click', function attack(e){
		// note that this event can only happen once! it's a one-time event 
		if(e.target.className === "enemy"){
			// apply damage 
			$('#grid').effect("shake");
			
			var newHealth =  e.target.getAttribute("health") - 10;
			
			if(newHealth <= 0){
				enemies.splice(enemies.indexOf(e.target), 1);
				e.target.style.backgroundImage = "";
				e.target.setAttribute("health", null);
				e.target.setAttribute("attack", null);
				e.target.classList.remove("enemy");
			}else{
				e.target.setAttribute("health", newHealth);
			}
			
			e.target.style.border = "1px solid #000";
			
			// remove the event listeners associated with this card
			document.getElementById('grid').removeEventListener('mouseout', selectEnemyOut);
			document.getElementById('grid').removeEventListener('mouseover', selectEnemyOn);
			document.getElementById('grid').removeEventListener('click', arguments.callee);
		}
	});
}
card3.description = "launch a bear attack on your favorite enemy.  after clicking 'activate', select one enemy unit to inflict 10 damage.";

deck.push(card1);
deck.push(card2);
deck.push(card3);


/****

draw some cards from deck 

*****/
function drawCards(){
	
	for(var i = 1; i < 4; i++){
		var randIndex = Math.floor(Math.random() * deck.length);
		var selectedCard = deck[randIndex];
		//console.log(randIndex);
		// select a random card from deck, as long as not in dealtCards
		// this implementation allows for the current deck to not be changed (i.e. drawing a card doesn't change the deck here)
		// and assumes of 1 of each card
		// It won't work if there are duplicates of a card. you will need to alter the deck when drawing cards 
		
		while(dealtCards.includes(selectedCard)){
			selectedCard = deck[randIndex];
			randIndex = Math.floor(Math.random() * deck.length);
		}
		
		// new card found, add to dealtCards
		dealtCards.push(selectedCard);
		
		var cardDisplay = document.getElementById('card' + i);
		
		document.getElementById('card' + i + 'title').textContent = selectedCard.name;
		document.getElementById('card' + i + 'title').style.fontWeight = "bold";
		
		document.getElementById('card' + i + 'pic').setAttribute('src', selectedCard.image);
		document.getElementById('card' + i + 'pic').setAttribute('width', '200px');
		document.getElementById('card' + i + 'pic').setAttribute('height', '150px');
		document.getElementById('card' + i + 'pic').style.marginTop = "10px";
		
		document.getElementById('card' + i + 'description').textContent = selectedCard.description;
		
		var newButton = document.createElement('button');
		newButton.style.marginTop = '10px';
		newButton.textContent = 'activate';
		newButton.id = 'card' + i + 'button';
		
		// not really relevant, but good reminder -  i thought i might've needed it somewhere 
		// https://stackoverflow.com/questions/8909652/adding-click-event-listeners-in-loop
		// https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example?noredirect=1&lq=1
		newButton.onclick = selectedCard.ability;
		
		cardDisplay.appendChild(newButton);
	}
	
	// reset dealtCards
	dealtCards = [];
}

