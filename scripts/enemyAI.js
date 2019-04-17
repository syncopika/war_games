/*****

	enemy movement AI sample 1
	
	@enemyMovement = DOM element of an enemy unit 
	@enemyUnits = list of enemy units 
	@playerUnits = list of player's units
	
	this function should be passed to Game.enemyTurn()
	
******/
import { getPathsDefault } from './Utils.js';

// the most basic possible movement. if there's an empty space left, right, up or down, go to either one randomly. 
// if any of the player's units are adjacent, then they will be attacked. 
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
	}
		
	// if no enemy, randomly move in a direction 
	let direction = Math.floor(Math.random() * 12);
	let newCell;
	
	if(direction < 3){
		// move right
		newCell = enemyElement.nextSibling;
	}else if(direction >= 3 && direction <= 6){
		// move left 
		newCell = enemyElement.previousSibling;
	}else if(direction > 6 && direction <= 9){
		// move up 
		newCell = paths['top'];
	}else{
		// move down 
		newCell = paths['bottom'];
	}
	
	if(newCell === null){
		return;
	}
	
	// but what if there is a fellow enemy in an adjacent square?
	if(enemyUnits.includes(newCell)){
		return;
	}
	
	if(newCell.className === "obstacle"){
		return;
	}
	
	newCell.setAttribute('health', enemyElement.getAttribute('health'));
	newCell.setAttribute('attack', enemyElement.getAttribute('attack'));
	newCell.className = "enemy";
	newCell.style.backgroundImage = enemyElement.style.backgroundImage;
	
	// refactor this! probably can use a set for enemyUnits instead - remove old element, add new one 
	for(let i = 0; i < enemyUnits.length; i++){
		if(enemyUnits[i] === enemyElement){
			enemyUnits[i] = newCell;
			break;
		}
	}
	
	enemyElement.classList.remove("enemy");
	enemyElement.style.backgroundImage = "";
}

function dfs(element, elementToFind, enemySet){
	if(element === elementToFind){
		return;
	}
	let stack = [element];
	let seen = new Set();
	let map = {}; // record path to get to elementToFind 
	map[element.id] = null;
	
	while(stack.length > 0){
		let curr = stack.pop();
		
		if(curr === elementToFind){	
			break;
		}
		
		seen.add(curr);
		let paths = getPathsDefault(curr);
		for(let dir in paths){
			if(paths[dir] === null){
				continue;
			}
			if(paths[dir].className === "obstacle" || enemySet.has(paths[dir])){
				continue;
			}
			if(!seen.has(paths[dir])){
				map[paths[dir].id] = curr.id; // curr is the node that led to paths[dir]
				stack.push(paths[dir]);
			}
		}
	}
	// quick question: if instead of id's we use DOM elements as keys and values, 
	// why does that cause an infinite loop? is there anything different in hashing a string compared to a DOM element? 
	
	//console.log(map);
	// return path to elementToFind
	let pathToFollow = [];
	let node = elementToFind.id;
	while(node !== null){
		//console.log(node);
		pathToFollow.push(node);
		node = map[node];
	}
	// pop off the first node since that's the one we're on 
	pathToFollow.pop();
	
	// list of ids!
	pathToFollow.reverse();
	return pathToFollow;
}

// another kind of enemy movement - not very fast or precise
// https://www.redblobgames.com/pathfinding/grids/algorithms.html
// https://stackoverflow.com/questions/12864004/tracing-and-returning-a-path-in-depth-first-search
function enemyMovement2(enemyElement, enemyUnits, playerUnits){
	
	// if enemy is adjacent, attack 
	let paths = getPathsDefault(enemyElement);
	
	// attack if one of those cells contains one of the player's units
	for(let path in paths){
	
		if(paths[path] === null){
			continue;
		}
		
		if(playerUnits.includes(paths[path])){
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
	}
	
	// otherwise, find a path to the enemy 
	
	//let player = new Set(playerUnits);
	let enemies = new Set(enemyUnits);
	
	// pick a random playerUnit to focus on 
	let randIndex =  Math.floor(Math.random() * playerUnits.length);
	let unitToFind = playerUnits[randIndex];
	
	// calculate a path to that target 
	let path = dfs(enemyElement, unitToFind, enemies);
	
	/*
	// checking out paths generated...
	path.forEach((p) => {
		let colors = ['blue','red','pink','yellow','green','orange'];
		let rand = Math.floor(Math.random() * colors.length);
		document.getElementById(p).style.backgroundColor = colors[rand]; //'pink';
	});)*/
	
	// go to the first element from the path 
	let newCell = document.getElementById(path[0]);
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

export { enemyMovement, enemyMovement2, dfs };