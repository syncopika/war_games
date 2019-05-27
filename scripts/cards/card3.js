import Card  from '../Card.js';
import { getPathsDefault, selectEnemyOn, selectEnemyOut, getAttackRange } from './../Utils.js';

const BearAttack = new Card(
"shark attack",
"./assets/sharkattack.png",
function(gameState, name, gameMethods){
	
	let currentUnit = gameState.currentPlayerUnit;
	let enemies = gameState.enemyUnits;
	
	// MAKE SURE TO CLEAR THE CARD AFTER USING IT! CLEAR CHILD NODES FROM PARENT
	//console.log(this);
	// launch a bear attack on a specified enemy unit 
	// does 10 damage 
	// make sure to show damage done and which unit
	// NEED TO DISABLE MOVEUNIT() EXECUTION WHEN DOING THIS!
	
	gameMethods.updateConsole("Player activated " + name + "!");

	// clear the currentUnit in case some unit is selected while trying to implement attack
	// don't forget possible ranged attack 
	if(currentUnit){
		let paths = getPathsDefault(currentUnit);
		for(let path in paths){
			if(paths[path]){
				paths[path].style.border = "1px solid #000";
			}
		}
		
		let attackRange = getAttackRange(currentUnit, 2);
		for(let path in attackRange){
			if(attackRange[path]){
				attackRange[path].style.border = "1px solid #000";
			}
		}
		
		// change pathLight so it will highlight when clicked on again 
		currentUnit.setAttribute("pathLight", 0);
		gameMethods.selectPlayerUnit(null);
	}
	
	document.getElementById('grid').addEventListener('mouseover', selectEnemyOn);
	document.getElementById('grid').addEventListener('mouseout', selectEnemyOut);
	document.getElementById('grid').addEventListener('click', function attack(e){
		
		// note that this event can only happen once! it's a one-time event 
		if(e.target.className === "enemy"){
			// apply damage 
			$('#grid').effect("shake");
			
			let newHealth = e.target.getAttribute("health") - 10;
			
			if(newHealth <= 0){
				//enemies.splice(enemies.indexOf(e.target), 1);
				gameMethods.removeFromEnemyUnits(e.target);
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
			document.getElementById('grid').removeEventListener('click', attack); 
		}
	});
},
"launch a shark attack on your favorite enemy.  after clicking 'activate', select one enemy unit to inflict 10 damage."
);

export { BearAttack };