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

function moveCellAttributes(source, dest, attributes){
	for(let attr in attributes){
		dest.setAttribute(attr, attributes[attr]);
		source.removeAttribute(attr);
	}
}


function getLeftCell(cell){
	return cell.previousSibling;
}

function getRightCell(cell){
	return cell.nextSibling;
}

function getTopCell(cell){
	try{
		let cellId = cell.id.match(/\d+/g); // get the row and column nums 
		let topCellId = "row" + (parseInt(cellId[0]) - 1) + "column" + cellId[1];
		let topCell = document.getElementById(topCellId);
		return topCell;
	}catch(error){
		return null;
	}
}

function getBottomCell(cell){
	try{
		let cellId = cell.id.match(/\d+/g); // get the row and column nums 
		let bottomCellId = "row" + (parseInt(cellId[0]) + 1) + "column" + cellId[1];
		let bottomCell = document.getElementById(bottomCellId);
		return bottomCell;
	}catch(error){
		return null;
	}
}

function checkRotation(currCell, direction){
	// if direction is clockwise or coounterclockwise
	// get topleft, topright, bottomleft, bottomright
	let topCell = getTopCell(currCell);
	let bottomCell = getBottomCell(currCell);
	
	if(direction === "counterclockwise"){
		let topRight = topCell.nextSibling;
		let bottomLeft = bottomCell.previousSibling;
		if(!topRight || ! bottomLeft){
			return false;
		}
		return topRight.className === "" && bottomLeft.className === "";
	}else if(direction === "clockwise"){
		// clockwise
		let topLeft = topCell.previousSibling;
		let bottomRight = bottomCell.nextSibling;
		if(!topLeft || !bottomRight){
			return false;
		}
		return topLeft.className === "" && bottomRight.className === "";
	}
	return false;
}

// target = dom element of grid cell to go to 
// current = dom element currently in 
function getMoveDirection(current, target){
	let cellDirection;
	let currUnitPaths = getPathsDefault(current);
	//console.log(currUnitPaths)
	for(let path in currUnitPaths){
		if(target.id === currUnitPaths[path].id){
			cellDirection = path;
			break;
		}
	}
	return cellDirection;
}

function getMoveRotation(currDirection, moveDirection){
	let direction = null;
	if(currDirection === "top"){
		if(moveDirection === "right"){
			direction = "clockwise";
		}else if(moveDirection === "left"){
			direction = "counterclockwise";
		}
	}else if(currDirection === "left"){
		if(moveDirection === "top"){
			direction = "clockwise"; 
		}else if(moveDirection === "bottom"){
			direction = "counterclockwise";
		}
	}else if(currDirection === "right"){
		if(moveDirection === "top"){
			direction = "counterclockwise";
		}else if(moveDirection === "bottom"){
			direction = "clockwise";
		}
	}else{
		// currDirection === "bottom"
		if(moveDirection === "right"){
			direction = "counterclockwise";
		}else if(moveDirection === "left"){
			direction = "clockwise";
		}
	}
	return direction;
}


function rotate(direction, object, targetAngle, setIntervalName){
	if(direction === "clockwise"){
		// only rotate 90 degrees
		// BUT WHAT ABOUT ROTATING LEFT TO RIGHT AT 180 DEGREES!!!??
		object.rotation.y -= 0.03;
		if(THREE.Math.radToDeg(object.rotation.y) <= targetAngle){
			clearInterval(setIntervalName);
		}
	}else{
		object.rotation.y += 0.03;
		if(THREE.Math.radToDeg(object.rotation.y) >= targetAngle){
			clearInterval(setIntervalName);
		}
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

function moveToDestination(curr, destination, dest3DCoords, obj, currUnitPaths){
	let currCellDirection = curr.getAttribute("direction");
	let cellDirectionToGo = getMoveDirection(curr, destination);
	
	// do we need to rotate 
	let rotation = getMoveRotation(currCellDirection, cellDirectionToGo);
	let canRotate = checkRotation(curr, rotation);
	if(rotation && canRotate){
		// if rotation needed, rotate 
		//console.log(THREE.Math.radToDeg(obj.rotation.y));
		let targetAngle = (rotation === "clockwise" ? -90 : 90); // left to right (clckwise) is a reduction in degrees
		targetAngle += THREE.Math.radToDeg(obj.rotation.y);
		//console.log(targetAngle);
		let rotateFunc = setInterval(
			function(){
				rotate(rotation, obj, targetAngle, rotateFunc);
			}, 50
		);
	}else if(rotation && !canRotate){
		for(let key in currUnitPaths){
			currUnitPaths[key].style.border = "1px solid #000";
		}
		return false; // fix this later. this move just shouldn't be an option for defaultPaths
	}

	let moveFunc = setInterval(
		function(){
			move(cellDirectionToGo, obj, dest3DCoords, moveFunc);
		}, 50
	);
	
	// clear old data for currentUnit
	for(let key in currUnitPaths){
		currUnitPaths[key].style.border = "1px solid #000";
	}
	
	moveCellAttributes(curr, destination, {
		"health": curr.getAttribute("health"),
		"attack": curr.getAttribute("attack"),
		"unitType": curr.getAttribute("unitType"),
		"direction": cellDirectionToGo,
		"span": 3,
		"bgImage": curr.getAttribute("bgImage")
	});
	
	curr.removeAttribute("unittype");
	curr.className = "";
	curr.removeAttribute("health");
	curr.removeAttribute("attack");
	curr.removeAttribute("direction");
	curr.removeAttribute("span");
	curr.removeAttribute("bgImage");
	curr.setAttribute("pathlight", 0);
	
	return true;
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

	// top coordinate is row - 1, same column num
	// bottom coord is row + 1, same column num
	// left coord is column num - 1, same row 
	// right coord is column num + 1, same row 
	paths['top'] = getTopCell(element);
	paths['bottom'] = getBottomCell(element);
	paths['left'] = getLeftCell(element);
	paths['right'] = getRightCell(element);

	for(let path in paths){
		if(paths[path] === null){
			delete paths[path];
		}
	}
	//console.log(paths);
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
	
	for(let path in paths){
		if(paths[path] === null){
			delete paths[path];
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
	getMoveDirection,
	getMoveRotation,
	checkRotation,
	moveCellAttributes,
	moveToDestination
};