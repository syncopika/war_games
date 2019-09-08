/*****

	enemy movement 'AI'
	
	@enemyMovement = DOM element of an enemy unit 
	@enemyUnits = list of enemy units 
	@playerUnits = list of player's units
	
	this function should be passed to Game.enemyTurn()
	
******/
import { getPathsDefault, 
         move, 
		 convert2dCoordsTo3d,
		 getMoveDirection
	   } from './Utils.js';



// regular depth first search using a stack 
function dfs(element, elementToFind, enemySet){
	if(element === elementToFind){
		return [];
	}
	if(elementToFind === undefined){
		return [];
	}
	
	// I think we can optimize this slightly(?) by reducing the number of possible nodes to be considered.
	// since we know the row and column of our current node as well as of the target node,
	// we can form a box (with the current and target nodes being corners) 
	// that defines row and column boundaries. so before we add a new potential node to visit 
	// to the stack, we check if its row and column falls within the row/col boundaries.
	//
	// however, you could introduce some interesting bugs here:
	// what about the scenario when the current and target node are in the same column, but 
	// there's another enemy in the way? the min and max columns would be the same, which would 
	// inhibit any horizontal movement! (so there would never be a path between the 2 nodes, and we get an infinite loop)
	//
	// similarly, what if they're in the same row and there's an obstacle? 
	// to remedy these situations, ensure that there is some extra room to move around if
	// columns or rows are the same between current and target nodes. 
	//
	// and here's another scenario: what if a unit is blocked off in a corner? i.e. there's another 
	// enemy blocking the only possible path, and is surrounded by obstacles in the other directions
	// in this case, make sure that the node to find is in fact in the map of nodes and their predecessors as a key.
	// this ensures there is a path from the current to target. 
	
	let selfNums = element.id.match(/\d+/g);
	let selfRow = parseInt(selfNums[0]);
	let selfCol = parseInt(selfNums[1]);
	
	let targetNums = elementToFind.id.match(/\d+/g);
	let targetRow = parseInt(targetNums[0]);
	let targetCol = parseInt(targetNums[1]);
	
	let rowBoundaryMin = Math.min(targetRow, selfRow);
	let rowBoundaryMax = Math.max(targetRow, selfRow);
	
	if(rowBoundaryMin === rowBoundaryMax){
		rowBoundaryMin--;
		rowBoundaryMax++;
	}
	
	let colBoundaryMin = Math.min(targetCol, selfCol);
	let colBoundaryMax = Math.max(targetCol, selfCol);
	
	if(colBoundaryMin === colBoundaryMax){
		colBoundaryMin--;
		colBoundaryMax++;
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
				let rowCol = paths[dir].id.match(/\d+/g);
				let row = parseInt(rowCol[0]);
				let col = parseInt(rowCol[1]);
				if(row >= rowBoundaryMin && row <= rowBoundaryMax && col <= colBoundaryMax && col >= colBoundaryMin){
					map[paths[dir].id] = curr.id; // curr is the node that led to paths[dir]
					stack.push(paths[dir]);
				}
			}
		}
	}
	// quick question: if instead of id's we use DOM elements as keys and values, 
	// why does that cause an infinite loop? is there anything different in hashing a string compared to a DOM element? 
	
	// return path to elementToFind
	if(!map[elementToFind.id]){
		return [];
	}
	
	let pathToFollow = [];
	let node = elementToFind.id;
	while(node !== null){
		pathToFollow.push(node);
		node = map[node];
	}

	// pop off the first node since that's the one we're on 
	pathToFollow.pop();
	
	// list of ids!
	return pathToFollow.reverse();
}

// regular bfs search (use shift and unshift instead of pop and push to act like a queue)
function bfs(element, elementToFind, enemySet){
	if(element === elementToFind){
		return [];
	}
	if(elementToFind === undefined){
		return [];
	}
	
	let selfNums = element.id.match(/\d+/g);
	let selfRow = parseInt(selfNums[0]);
	let selfCol = parseInt(selfNums[1]);
	
	let targetNums = elementToFind.id.match(/\d+/g);
	let targetRow = parseInt(targetNums[0]);
	let targetCol = parseInt(targetNums[1]);
	
	let rowBoundaryMin = Math.min(targetRow, selfRow);
	let rowBoundaryMax = Math.max(targetRow, selfRow);
	
	if(rowBoundaryMin === rowBoundaryMax){
		rowBoundaryMin--;
		rowBoundaryMax++;
	}
	
	let colBoundaryMin = Math.min(targetCol, selfCol);
	let colBoundaryMax = Math.max(targetCol, selfCol);
	
	if(colBoundaryMin === colBoundaryMax){
		colBoundaryMin--;
		colBoundaryMax++;
	}
	
	// do bfs 
	let queue = [element];
	let seen = new Set();
	let map = {}; // record path to get to elementToFind 
	map[element.id] = null;
	
	while(queue.length > 0){
		let curr = queue.shift();
		
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
				let rowCol = paths[dir].id.match(/\d+/g);
				let row = parseInt(rowCol[0]);
				let col = parseInt(rowCol[1]);
				if(row >= rowBoundaryMin && row <= rowBoundaryMax && col <= colBoundaryMax && col >= colBoundaryMin){
					map[paths[dir].id] = curr.id; // curr is the node that led to paths[dir]
					queue.unshift(paths[dir]);
				}
			}
		}
	}
	
	// return path to elementToFind
	if(!map[elementToFind.id]){
		return [];
	}
	
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
	return pathToFollow.reverse();
}


// Manhattan distance 
function manhattan(sourceX, sourceY, goalX, goalY){
	let xDiff = Math.abs(sourceX - goalX);
	let yDiff = Math.abs(sourceY - goalY);
	return xDiff + yDiff;
}

// A* algorithm 
// it uses the Manhattan distance as a heuristic
// https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2
// https://www.geeksforgeeks.org/a-search-algorithm/
// https://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
function aStar(element, elementToFind, enemySet){
	
	if(element === elementToFind){
		return [];
	}
	
	if(elementToFind === undefined){
		return [];
	}
	
	// keep a table of parents and their distances 
	let parentTable = {};
	let closed = new Set();
	let open = new Set();
	let map = {}; // for backtracking the path 
	
	// initial setup
	parentTable[element.id] = 0;
	open.add(element);
	
	while(open.size !== 0){
		// find the element with the smallest f value
		// smallestF will be the id of a grid cell 
		let smallestF = null;
		let currSmallestF = null;
		open.forEach((el) => {
			let val = parentTable[el.id];
			if(smallestF === null || val < currSmallestF){
				smallestF = el;
				currSmallestF = val;
			}
		});
		
		// remove smallestF from open, add to closed 
		open.delete(smallestF);
		closed.add(smallestF.id);
		
		if(smallestF === elementToFind){
			break;
		}

		// get the adjacent nodes of smallestF 
		let paths = getPathsDefault(smallestF);
		for(let dir in paths){
			
			let neighbor = paths[dir];

			if(neighbor.className === "obstacle" || enemySet.has(neighbor)){
				continue;
			}
			if(closed.has(neighbor.id)){
				continue;
			}
			 
			closed.add(neighbor.id);
			
			// now calculate f(g+h), g(current total distance from source) and h(heuristic using current neighbor and goal positions)
			// add 1 since each neighbor is always just 1 away from smallestF, our current node 
			let g = parentTable[smallestF.id] + 1;
			let sourceX = parseInt(neighbor.id.match(/\d+/g)[1]); // column of neighbor
			let sourceY = parseInt(neighbor.id.match(/\d+/g)[0]); // row of neighbor 
			let goalX = parseInt(elementToFind.id.match(/\d+/g)[1]); 
			let goalY = parseInt(elementToFind.id.match(/\d+/g)[0]); 
			let h = manhattan(sourceX, sourceY, goalX, goalY);
			let f = g + h;
			
			// then check if this neighbor is already in the open set.
			// if so, then they already have an entry in parentTable and we should 
			// compare the currently stored g value of this neighbor with the g we just calculated 
			if(open.has(neighbor)){
				if(g > parentTable[neighbor.id]){
					// we're not interested in this neighbor since their cost is higher than what's already been stored 
					continue;
				}
			}else{
				parentTable[neighbor.id] = f; // set this neighbor's g value to be f in the parentTable for its neighbors 
				open.add(neighbor);
				
				// neighbor is mapped to current smallestF, or the 'parent'
				map[neighbor.id] = smallestF.id;
			}
		}
	}
	//console.log(parentTable);
	
	// backtrack to get the path to the target 
	let pathToFollow = [];
	let node = elementToFind.id;
	
	// keep iterating until we reach the node we started on, i.e. element
	while(node !== element.id){
		//console.log(node);
		pathToFollow.push(node);
		node = map[node];
	}
	
	return pathToFollow.reverse();
}


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
	
	// attack if one of those cells contains one of the player's units
	for(let path in paths){
		if(playerUnits[paths[path]]){
			// do attack 
			let opponent = paths[path];
			let opponentHealth = opponent.getAttribute('health');
			let currAttack = enemyElement.getAttribute('attack');
			let newOpponentHealth = opponentHealth - enemyElement.getAttribute('attack');
			// what if kill opponent?
			if(newOpponentHealth <= 0){
				// obliterate opponent from map
				document.getElementById('playerHealth').textContent = "0";
				//opponent.style.backgroundImage = "";
				opponent.removeAttribute('health');
				opponent.removeAttribute('attack');
				opponent.removeAttribute('unittype');
				opponent.removeAttribute('direction');
				opponent.removeAttribute('span');
				opponent.classList.remove('player');
				// remove from player array
			}else{
				// otherwise decrement health 
				opponent.style.border = "1px solid #FF1919"; // red border to indicate damage
				opponent.setAttribute('health', opponentHealth - enemyElement.getAttribute('attack'));
				
				// do some animation to indicate attack 
				setTimeout(function(){ $('#grid').effect("shake") }, 200);
				
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
	newCell.setAttribute('health', enemyElement.getAttribute('health'));
	newCell.setAttribute('attack', enemyElement.getAttribute('attack'));
	newCell.setAttribute('direction', enemyElement.getAttribute('direction'));
	newCell.setAttribute('span', enemyElement.getAttribute('span'));
	newCell.className = "enemy";
	//newCell.style.backgroundImage = enemyElement.style.backgroundImage;
	
	let cellDirection = getMoveDirection(newCell, enemyElement);
	let v = convert2dCoordsTo3d(newCell, gameState.renderer, gameState.camera, gameState.width, gameState.height); 
	let obj = enemyUnits[enemyElement.id];

	let moveFunc = setInterval(
		function(){
			move(cellDirection, obj, v, moveFunc);
		}, 50
	);

	enemyUnits[newCell.id] = enemyUnits[enemyElement.id];
	delete enemyUnits[enemyElement.id];
	
	/* rotate the unit depending on direction 
	// need to know current direction facing though
	let oldCoords = enemyElement.id.match(/\d+/g);
	let newCoords = newCell.id.match(/\d+/g);
	
	// if going up 
	if(oldCoords[0] > newCoords[0]){
	}else if(oldCoords[0] < newCoords[0]){
		// going down 
	}else if(oldCoords[1] < newCoords[1]){
		// going right 
	}else{
		// going left 
	}
	*/
	
	enemyElement.classList.remove("enemy");
	//enemyElement.style.backgroundImage = "";
	enemyElement.removeAttribute("health");
	enemyElement.removeAttribute("attack");
	enemyElement.removeAttribute("direction");
	enemyElement.removeAttribute("span");
	
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

export { enemyMovement2, dfs, bfs, aStar };