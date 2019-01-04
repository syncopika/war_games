/*****

	enemy movement AI sample 1
	
	@enemyMovement = DOM element of an enemy unit 
	@enemyUnits = list of enemy units 
	@playerUnits = list of player's units
	
	this function should be passed to Game.enemyTurn()
	
******/
import { getPathsDefault } from './Utils.js';

function enemyMovement(enemyElement, enemyUnits, playerUnits){

	let player = playerUnits;

	// get left, right, top, bottom cells 
	let paths = getPathsDefault(enemyElement);
	
	// attack if one of those cells contains one of the player's units
	for(let path in paths){
	
		if(paths[path] === null){
			continue;
		}
		if(player.includes(paths[path])){
			// do attack 
			let opponentHealth = paths[path].getAttribute('health');
			let newOpponentHealth = opponentHealth - enemyElement.getAttribute('attack');
			// what if kill opponent?
			if(newOpponentHealth <= 0){
				// obliterate opponent from map
				document.getElementById('playerHealth').textContent = "0";
				paths[path].style.backgroundImage = "";
				paths[path].setAttribute('health', null);
				paths[path].setAttribute('attack', null);
				// remove from player array
				player.splice(player.indexOf(paths[path]), 1);
			}else{
				// otherwise decrement health 
				paths[path].style.border = "1px solid #FF1919"; // red border to indicate damage
				
				paths[path].setAttribute('health', opponentHealth - enemyElement.getAttribute('attack'));
				
				// only show current health for boss nyasu for now 
				if(paths[path].style.backgroundImage.match(/(nyasu7)/g)){
					document.getElementById('playerHealth').textContent = "" + opponentHealth - enemyElement.getAttribute('attack');
				}
				
				// do some animation to indicate attack 
				setTimeout(function(){ $('#grid').effect("shake") }, 200);
				
				let enemyCell = paths[path]; // assign a letiable paths[path]. can't just change paths[path] border because then only the last one in the loop will be referenced
				setTimeout(function(){ enemyCell.style.border = "1px solid #000"; console.log(paths[path]) }, 1000);
			}
			return;
		}
		
		// but what if there is a fellow enemy in an adjacent square?
		if(enemyUnits.includes(paths[path])){
			// don't do anything
			return;
		}
	}
		
	// if no enemy, randomly move in a direction 
	let direction = Math.floor(Math.random() * 10);
	let newCell;
	
	if(direction < 10){
		// move right
		newCell = enemyElement.nextSibling;
	}else{
		// move left 
		newCell = enemyElement.previousSibling;
	}
	
	if(newCell === null){
		return;
	}
	
	newCell.setAttribute('health', enemyElement.getAttribute('health'));
	newCell.setAttribute('attack', enemyElement.getAttribute('attack'));
	newCell.className = "enemy";
	newCell.style.backgroundImage = enemyElement.style.backgroundImage;
	
	for(let i = 0; i < enemyUnits.length; i++){
		if(enemyUnits[i] === enemyElement){
			enemyUnits[i] = newCell;
			break;
		}
	}
	
	enemyElement.classList.remove("enemy");
	enemyElement.style.backgroundImage = "";
}

export { enemyMovement };