/*****

	enemy movement 'AI'
	
	@enemyMovement = DOM element of an enemy unit 
	@enemyUnits = list of enemy units 
	@playerUnits = list of player's units
	
	this function should be passed to Game.enemyTurn()
	
******/
import { getPathsDefault, 
		 getAttackRange,
         move, 
		 convert2dCoordsTo3d,
		 getMoveDirection,
		 rotate,
		 getMoveRotation,
		 checkRotation,
		 moveToDestination
	   } from './Utils.js';
	   
import {
		dfs, 
		bfs, 
		aStar
	   } from './AI_Utils.js';
	   
import * as THREE from 'three';


// another kind of enemy movement
// https://www.redblobgames.com/pathfinding/grids/algorithms.html
// https://stackoverflow.com/questions/12864004/tracing-and-returning-a-path-in-depth-first-search
// @enemyElement - an element holding an enemy unit (a DOM element) 
// @gameState - the game's state (an object)
// @selectEnemyUnit - a function to set the currently selected enemy unit to display in the header 
// @searchMethod - a function representing the pathfinding algorithm, i.e. dfs, A* - returns a list of grid cell ids representing the path 
function enemyMovement2(enemyElement, gameState, selectEnemyUnit, searchMethod){
	
	let enemyUnits = gameState.enemyUnits;
	let playerUnits = gameState.playerUnits;
	let currEnemyUnit = gameState.currentEnemyUnit;
	
	let paths = getPathsDefault(enemyElement);
	
	// see if enemy in range and can attack 
	let attackPaths = getAttackRange(enemyElement, 2);

	
	// attack if one of those cells contains one of the player's units
	//console.log(attackPaths);
	for(let path in attackPaths){
		if(playerUnits[attackPaths[path].id]){
			console.log("attack player!");
			// do attack 
			let opponent = attackPaths[path];
			console.log(opponent);
			let opponentHealth = opponent.getAttribute('health');
			let currAttack = enemyElement.getAttribute('attack');
			let newOpponentHealth = opponentHealth - enemyElement.getAttribute('attack');
			// what if kill opponent?
			if(newOpponentHealth <= 0){
				// obliterate opponent from map
				document.getElementById('playerHealth').textContent = "0";
				opponent.removeAttribute('health');
				opponent.removeAttribute('attack');
				opponent.removeAttribute('unittype');
				opponent.removeAttribute('direction');
				opponent.removeAttribute('span');
				opponent.removeAttribute("bgImage");
				opponent.classList.remove('player');
				
			}else{
				console.log("player was attacked!");
				// otherwise decrement health 
				opponent.style.border = "1px solid #FF1919"; // red border to indicate damage
				opponent.setAttribute('health', opponentHealth - enemyElement.getAttribute('attack'));
				
				// do some animation to indicate attack 
				$('#grid').effect("shake");
				
				let enemyCell = opponent; // assign a letiable paths[path]. can't just change paths[path] border because then only the last one in the loop will be referenced
				setTimeout(function(){ enemyCell.style.border = "1px solid #000" }, 1000);
			}
			return;
		}
	}
	for(let path in paths){
		if(playerUnits[paths[path].id]){
			console.log("attack player!");
			// do attack 
			let opponent = paths[path];
			console.log(opponent);
			let opponentHealth = opponent.getAttribute('health');
			let currAttack = enemyElement.getAttribute('attack');
			let newOpponentHealth = opponentHealth - enemyElement.getAttribute('attack');
			// what if kill opponent?
			if(newOpponentHealth <= 0){
				// obliterate opponent from map
				document.getElementById('playerHealth').textContent = "0";
				opponent.removeAttribute('health');
				opponent.removeAttribute('attack');
				opponent.removeAttribute('unittype');
				opponent.removeAttribute('direction');
				opponent.removeAttribute('span');
				opponent.removeAttribute("bgImage");
				opponent.classList.remove('player');
				// remove from player array
			}else{
				// otherwise decrement health 
				opponent.style.border = "1px solid #FF1919"; // red border to indicate damage
				opponent.setAttribute('health', opponentHealth - enemyElement.getAttribute('attack'));
				
				// do some animation to indicate attack 
				$('#grid').effect("shake");
				
				let enemyCell = opponent; // assign a letiable paths[path]. can't just change paths[path] border because then only the last one in the loop will be referenced
				setTimeout(function(){ enemyCell.style.border = "1px solid #000" }, 1000);
			}
			return;
		}
	}
	
	// otherwise, find a path to the enemy 
	let enemies = new Set(Object.keys(enemyUnits).map((elementId) => document.getElementById(elementId)));
	
	// pick a random playerUnit to focus on 
	let randIndex =  Math.floor(Math.random() * Object.keys(playerUnits).length);
	let unitToFind = document.getElementById(Object.keys(playerUnits)[randIndex]);
	
	// calculate a path to that target 
	let path;
	let color;
	if(searchMethod === "A*"){
		path = aStar(enemyElement, unitToFind, enemies);
		color = '#53cc2a';
	}else if(searchMethod === "breadth-first search"){
		path = bfs(enemyElement, unitToFind, enemies);
		color = '#f00fff';
	}else{
		path = dfs(enemyElement, unitToFind, enemies);
		color = '#f794ed';
	}
	
	if(path.length === 0){
		// enemy can't move 
		return;
	}

	// checking out paths generated...probably should slow it down a bit...
	let prevPathElement = path[0];
	document.getElementById(prevPathElement).style.backgroundColor = color; //'#53cc2a';
	
	let promise = new Promise((resolve, reject) => {
		window.requestAnimationFrame((timestamp)=>{highlightPath(timestamp, prevPathElement, 0, path, color, resolve)});
	});

	
	// move the current enemy unit to the first element from the path 
	let newCell = document.getElementById(path[0]);
	//newCell.className = "enemy";
	
	let currCellDirection = enemyElement.getAttribute("direction");
	let cellDirectionToGo = getMoveDirection(enemyElement, newCell);
	let v = convert2dCoordsTo3d(newCell, gameState.renderer, gameState.camera, gameState.width, gameState.height); 
	let obj = enemyUnits[enemyElement.id];

	if(moveToDestination(enemyElement, newCell, v, obj, paths)){
		newCell.className = "enemy";
		enemyUnits[newCell.id] = obj;
		delete enemyUnits[enemyElement.id];
	}
	
	// if the player had selected an enemy unit to view, and that unit moves over to a new cell,
	// make sure that's updated
	if(currEnemyUnit !== null && currEnemyUnit.id === enemyElement.id){
		selectEnemyUnit(newCell);
	}
	
	return promise;
}

// show the path from a unit to the target 
function highlightPath(timestamp, lastElement, index, path, color, resolve){
	document.getElementById(lastElement).style.backgroundColor = "";
	if(index === path.length){
		return resolve("success!");
	}
	document.getElementById(path[index]).style.backgroundColor = color;//'#53cc2a'; #f794ed
	setTimeout(() => window.requestAnimationFrame((timestamp) => highlightPath(timestamp, path[index], index+1, path, color, resolve)), 50);
}

export { enemyMovement2 };