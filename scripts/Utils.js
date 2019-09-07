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

/*****
	default path option
	get the top, bottom, left, and right cells of clicked-on unit 
*******/
function getPathsDefault(element){
	// this element will return the top, bottom, left and right blocks
	let paths = {};
	
	let column = parseInt(element.id.match(/\d+/g)[1]);
	
	// top coordinate is row - 1, same column num
	// bottom coord is row + 1, same column num
	// left coord is column num - 1, same row 
	// right coord is column num + 1, same row 
	if(element.parentNode.previousSibling){	
		let previousRow = element.parentNode.previousSibling.childNodes;
		for(let i = 0; i < previousRow.length; i++){
			if(previousRow[i].id.match(/\d+/g)[1] == column){
				paths['top'] = previousRow[i];
				break;
			}
		}
	}else{
		paths['top'] = null;
	}
	
	if(element.parentNode.nextSibling){
		let nextRow = element.parentNode.nextSibling.childNodes;
		for(let i = 0; i < nextRow.length; i++){
			if(nextRow[i].id.match(/\d+/g)[1] == column){
				paths['bottom'] = nextRow[i];
				break;
			}
		}
	}else{
		paths['bottom'] = null;
	}
	
	paths['left'] = element.previousSibling;
	paths['right'] = element.nextSibling;
	
	// eliminate null paths 
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
	convert2dCoordsTo3d
};