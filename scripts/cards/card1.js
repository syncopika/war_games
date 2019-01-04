// card name: completeDomination
import { Card } from '../Card.js';

const CompleteDomination = new Card();

CompleteDomination.name = "complete domination";
CompleteDomination.image = "../../mikudayo.png";
CompleteDomination.ability = function(gameInstance){
	// wipe out all enemies 
	let enemyUnits = gameInstance.enemyUnits();
	for(let i = 0; i < enemyUnits.length; i++){
		$('#grid').effect("shake");
		enemyUnits[i].style.backgroundImage = "";
		enemyUnits[i].classList.remove("enemy");
		enemyUnits[i].setAttribute('health', null);
		enemyUnits[i].setAttribute('attack', null);
	}
	gameInstance.clearEnemyUnits();
};
CompleteDomination.description = "mikudayo wipes out all enemies. yay";

export { CompleteDomination };