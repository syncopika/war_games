import Card  from '../Card.js';
import { getPathsDefault } from './../Utils.js';

const PancakeSniper = new Card(
"pancake sniper", 
"./../../assets/alolanRaichu.png",
 function(gameInstance){
	// place a pancake sniper aka alolan raichu on the field 
	// https://stackoverflow.com/questions/4402287/javascript-remove-event-listener
	
	let currentUnit = gameInstance.currentUnit;
	let player = gameInstance.playerUnits;
	
	// after picking this ability, the unit needs to be placed immediately
	// therefore, if there was a unit selected right before clicking this ability,
	// it needs to be unselected
	if(currentUnit){
		let elementPaths = getPathsDefault(currentUnit);
		for(let key in elementPaths){
			if(elementPaths[key]){
				//elementPaths[key].style.border = "none";
				elementPaths[key].style.border = "1px solid #000";
			}
		}
		currentUnit.setAttribute('pathLight', 0);
		gameInstance.currentUnit = null;
	}
	
	function validSpace(e){

		let findDigit = e.target.id.match(/\d+/);
		
		if(findDigit !== null){
			let col = parseInt( e.target.id.match(/\d+/)[0] );
		
			// come up with a separate function to determine whether a square is within player territory
			if(col > 32){
				// highlight spot because this is a valid place to place unit
				e.target.style.border = "1px solid rgb(221, 223, 255)";
			}
		}
		
	}
	
	function leaveSpace(e){
		let findDigit = e.target.id.match(/\d+/);
		if(findDigit !== null){
			let col = parseInt( e.target.id.match(/\d+/)[0] );
			// come up with a separate function to determine whether a square is within player territory
			if(col > 32){
				e.target.style.border = "1px solid #000";
				
			}
		}
	}
	
	// update header to show unit 
	//let imgUrl = currElement.style.backgroundImage; // need to eliminate the 'url()' part from the string 
	//imgUrl = imgUrl.substring(imgUrl.indexOf('"')+1, imgUrl.indexOf(')')-1);  // note that this means the actual file path should not have quotes or parentheses!
	//document.getElementById('player').setAttribute('src', imgUrl);
	//document.getElementById('playerHealth').textContent = currElement.getAttribute("health");
	
	// need to disable clicking anything else other than a valid space after this card has been selected 
	document.getElementById('grid').addEventListener('mouseover', validSpace);
	document.getElementById('grid').addEventListener('mouseout', leaveSpace);
	document.getElementById('grid').addEventListener('click', function placeUnit(e){
	
		let col = parseInt( e.target.id.match(/\d+/)[0] );
		
		if(col > 32 && e.target.style.backgroundImage === ""){
		
			// place the unit 
			e.target.style.backgroundImage = "url('" + "../../assets/alolanRaichu.png" + "')";
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
			document.getElementById('grid').removeEventListener('click', placeUnit); 
		}
	});
},
"a floating electric mouse that has pancakes. after clicking 'activate', select a cell from any of the first three columns from the right to place a new unit. red highlighted squares indicate its attack range"
);

export { PancakeSniper };