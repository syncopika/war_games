// utility functions that do general things
// since functions in my enemy AI file and my Game file need to use these functions, they're here 
import * as THREE from 'three';

function convert2dCoordsTo3d(elementClicked, rendererObj, camera, containerWidth, containerHeight){
	let target = rendererObj.domElement;
	let box = target.getBoundingClientRect();

	// this assumes elementClicked is a grid cell, whose parent is a row element, whose parent is the grid container (which is what we want)
	let x1 = elementClicked.getBoundingClientRect().left - elementClicked.parentNode.parentNode.getBoundingClientRect().left + elementClicked.offsetWidth/2;
	let y1 = elementClicked.getBoundingClientRect().top - elementClicked.parentNode.parentNode.getBoundingClientRect().top + elementClicked.offsetHeight/2;
	let posX = x1 * target.width  / target.clientWidth;
	let posY = y1 * target.height / target.clientHeight;

	let x = posX / containerWidth * 2 - 1;
	let y = posY / containerHeight * -2 + 1;
	let v = new THREE.Vector3( x, y, -450 ).unproject( camera );
	return v;
}

function getLeftCell(cell){
	try{
		let left = cell.previousSibling;
		return (left.className === "" ? left : null);
	}catch(error){
		return null;
	}
}

function getRightCell(cell){
	try{
		let right = cell.nextSibling;
		return (right.className === "" ? right : null);
	}catch(error){
		return null;
	}
}

function getTopCell(cell){
	let cellId = cell.id.match(/\d+/g); // get the row and column nums 
	let topCellId = "row" + (cellId[0] - 1) + "column" + cellId[1];
	try{
		let topCell = document.getElementById(topCellId);
		return (topCell.className === "" ? topCell : null);
	}catch(error){
		return null;
	}
}

function getBottomCell(cell){
	let cellId = cell.id.match(/\d+/g); // get the row and column nums 
	let bottomCellId = "row" + (parseInt(cellId[0]) + 1) + "column" + cellId[1];
	try{
		let bottomCell = document.getElementById(bottomCellId);
		return (bottomCell.className === "" ? bottomCell : null);
	}catch(error){
		return null;
	}
}

function checkRotation(currCell, direction){
	// if direction is clockwise or coounterclockwise
	// get topleft, topright, bottomleft, bottomright
	let topCell = getTopCell(currCell);
	let bottomCell = getBottomCell(currCell);
	
	if(direction === "clockwise"){
		let topRight = topCell.nextSibling;
		let bottomLeft = bottomCell.previousSibling;
		return topRight.className === "" && bottomLeft.className === "";
	}else{
		// counterclockwise
		let topLeft = topCell.previousSibling;
		let bottomRight = bottomCell(currCell).nextSibling;
		return topLeft.className === "" && bottomRight.className === "";
	}
}

// target = dom element of grid cell to go to 
// current = dom element currently in 
function getMoveDirection(target, current){
	let cellDirection;
	let currUnitsPaths = getPathsDefault(current);
	for(let path in currUnitsPaths){
		if(target.id === currUnitsPaths[path].id){
			cellDirection = path;
			break;
		}
	}
	return cellDirection;
}

function rotate(direction, object, targetAngle, setIntervalName){
	if(direction === "clockwise"){
		// only rotate 90 degrees
		// BUT WHAT ABOUT ROTATING LEFT TO RIGHT AT 180 DEGREES!!!??
		object.rotation.y += 0.03;
		if(THREE.Math.radToDeg(object.rotation.y) <= targetAngle){
			clearInterval(setIntervalName);
		}
	}else{
	}
}

// target = 3d vertex
function move(direction, object, target, setIntervalName){
	// stop movement if reach target		
	// remember that in 3d space, downward movement means increasing negative numbers (unlike in 2d where going down means increasing positive value)
	if(direction == "left"){
		object.position.x -= .2;
		if(object.position.x <= target.x){
			clearInterval(setIntervalName);
		}
	}else if(direction == "right"){
		object.position.x += .2;
		if(object.position.x >= target.x){
			clearInterval(setIntervalName);
		}
	}else if(direction == "top"){
		object.position.y += .2;
		if(object.position.y >= target.y){
			clearInterval(setIntervalName);
		}
	}else{
		object.position.y -= .2;
		if(object.position.y <= target.y){
			clearInterval(setIntervalName);
		}
	}
}

/*****
	default path option
	get the top, bottom, left, and right cells of clicked-on unit 
*******/
function getPathsDefault(element){
	
	// need to decide which cells are valid moves depending on the direction of the unit in this element
	// we also need to know how many cells this unit spans
	// if unit is facing in a vertical direction, left and right should be directly adjacent.
	// if in a horizontal direction, then the left and right is based on span.
	// note we're supporting units that span 3 cells or 1 cell right now.
	
	// this element will return the top, bottom, left and right blocks
	let paths = {};
	let span = element.getAttribute("span"); // how many cells does this unit span 
	let direction = element.getAttribute("direction");
	let column = parseInt(element.id.match(/\d+/g)[1]);
	let prevRowParent = element.parentNode.previousSibling;
	let nextRowParent = element.parentNode.nextSibling.childNodes;
	let nums = element.id.match(/\d+/g);
	
	if(span == 3){
		if(direction === "left" || direction === "right"){
			paths['top'] = getTopCell(element);
			paths['left'] = getLeftCell(getLeftCell(element));
			paths['right'] = getRightCell(getRightCell(element));
			paths['bottom'] = getBottomCell(element);
		}else{
			paths['top'] = getTopCell(getTopCell(element));
			paths['bottom'] = getBottomCell(getBottomCell(element));
			paths['left'] = getLeftCell(element);
			paths['right'] = getRightCell(element);		
		}
	}else{	
		// top coordinate is row - 1, same column num
		// bottom coord is row + 1, same column num
		// left coord is column num - 1, same row 
		// right coord is column num + 1, same row 
		if(prevRowParent){	
			let previousRow = element.parentNode.previousSibling.childNodes;
			for(let i = 0; i < previousRow.length; i++){
				if(previousRow[i].id.match(/\d+/g)[1] == column){
					paths['top'] = previousRow[i];
					break;
				}
			}
		}
		
		if(nextRowParent){
			let nextRow = element.parentNode.nextSibling.childNodes;
			for(let i = 0; i < nextRow.length; i++){
				if(nextRow[i].id.match(/\d+/g)[1] == column){
					paths['bottom'] = nextRow[i];
					break;
				}
			}
		}
		
		paths['left'] = element.previousSibling;
		paths['right'] = element.nextSibling;
	}

	for(let path in paths){
		if(paths[path] === null){
			delete paths[path];
		}
	}
	
	return paths;
}

/*****

	get attack range of unit 
	
*******/
function getAttackRange(element, distance){
	// this element will return the top, bottom, left and right blocks
	let paths = {};
	
	// get the parent of this element. this element should be a column cell, so the parent will be the row
	let row = parseInt(element.parentNode.id.match(/\d+/g)[0]);
	let column = parseInt(element.id.match(/\d+/g)[1]);

	// check top coord 
	let topRow = document.getElementById("row" + (row - distance));
	if(topRow){
		topRow = topRow.childNodes;
		for(let i = 0; i < topRow.length; i++){
			let col = parseInt(topRow[i].id.match(/\d+/g)[1]);
			if(col === column){
				// if a top cell exists for given distance 
				paths["top"] = topRow[i];
				break;
			}
		}
	}else{
		paths["top"] = null;
	}
	
	// check bottom coord 
	let bottomRow = document.getElementById("row" + (row + distance));
	if(bottomRow){
		bottomRow = bottomRow.childNodes;
		for(let i = 0; i < bottomRow.length; i++){
			let col = parseInt(bottomRow[i].id.match(/\d+/g)[1]);
			if(col === column){
				// if a top cell exists for given distance 
				paths["bottom"] = bottomRow[i];
				break;
			}
		}
	}else{
		paths["bottom"] = null;
	}
	
	// check left coord 
	paths["left"] = null;
	let currRow = element.parentNode.childNodes;
	for(let i = 0; i < currRow.length; i++){
		let newCol = parseInt(currRow[i].id.match(/\d+/g)[1]);
		if(newCol === (column - distance)){
			paths["left"] = currRow[i];
			break;
		}
	}
	
	// check right coord 
	paths["right"] = null;
	for(let i = 0; i < currRow.length; i++){
		let newCol = parseInt(currRow[i].id.match(/\d+/g)[1]);
		if(newCol === (column + distance)){
			paths["right"] = currRow[i];
			break;
		}
	}
	
	return paths;
}

// get the DOM element that represents a cell in the grid given a row and column. 
function getCell(row, col){
	// changing let to var here stopped Chrome from complaining. why?
	var rowElement = document.getElementById('row' + row).childNodes;
	for(let i = 0; i < rowElement.length; i++){
		if(rowElement[i].id === ('row' + row + 'column' + col)){
			return rowElement[i];
		}
	}
	return null;
}

// highlight valid cell to place unit within player's territory
// not good, because column limit is hardcoded!!!
function validSpace(e){
	let findDigit = e.target.id.match(/\d+/g);
	
	if(findDigit !== null){
		let col = parseInt( findDigit[1] );
	
		// come up with a separate function to determine whether a square is within player territory
		if(col > 25){
			// highlight spot because this is a valid place to place unit
			e.target.style.border = "1px solid rgb(221, 223, 255)";
		}
	}
}

// when hovering over an enemy to select for an attack
function selectEnemyOn(e){
	if(e.target.className === "enemy"){
		e.target.style.border = "1px solid rgb(221, 223, 255)";
	}
}

// when hovering over an enemy to select for an attack and the cursor leaves 
function selectEnemyOut(e){
	if(e.target.className === "enemy"){
		e.target.style.border = "1px solid #000";
	}
}

// when moving over grid cells, de-highlight cells passed over if cursor moves to another cell 
// not good, because column limit is hardcoded!!!
function leaveSpace(e){
	let findDigit = e.target.id.match(/\d+/g);
	if(findDigit !== null){
		let col = parseInt( e.target.id.match(/\d+/g)[1] );
		// come up with a separate function to determine whether a square is within player territory
		if(col > 25){
			e.target.style.border = "1px solid #000";
		}
	}
}

export { 
	getPathsDefault, 
	getAttackRange, 
	getCell, 
	validSpace, 
	leaveSpace, 
	selectEnemyOn, 
	selectEnemyOut,
	convert2dCoordsTo3d,
	move,
	rotate,
	getMoveDirection
};