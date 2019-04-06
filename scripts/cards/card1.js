// card name: completeDomination
import Card from '../Card.js';

const CompleteDomination = new Card( "complete domination", "./assets/mikudayo.png", function(gameInstance, name){
	// wipe out all enemies 
	gameInstance.refreshConsole("Player invoked " + name + "!");
	
	let enemyUnits = gameInstance.enemyUnits;
	for(let i = 0; i < enemyUnits.length; i++){
		$('#grid').effect("shake");
		enemyUnits[i].style.backgroundImage = "";
		enemyUnits[i].classList.remove("enemy");
		enemyUnits[i].setAttribute('health', null);
		enemyUnits[i].setAttribute('attack', null);
	}
	gameInstance.clearEnemyUnits();
},
"mikudayo wipes out all enemies. yay"
);

export { CompleteDomination };