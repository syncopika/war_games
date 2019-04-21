// utility functions that do general things
// since functions in my enemy AI file and my Game file need to use these functions, they're here 

/*****
	default path option
	get the top, bottom, left, and right cells of clicked-on unit 
*******/
function getPathsDefault(element){
	// this element will return the top, bottom, left and right blocks
	let paths = {};
	
	// get the parent of this element. this element should be a column cell, so the parent will be the row
	let row = parseInt(element.parentNode.id.match(/\d+/g)[0]);
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
function validSpace(e){
	let findDigit = e.target.id.match(/\d+/g);
	
	if(findDigit !== null){
		let col = parseInt( findDigit[1] );
	
		// come up with a separate function to determine whether a square is within player territory
		if(col > 32){
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
function leaveSpace(e){
	let findDigit = e.target.id.match(/\d+/g);
	if(findDigit !== null){
		let col = parseInt( e.target.id.match(/\d+/g)[1] );
		// come up with a separate function to determine whether a square is within player territory
		if(col > 32){
			e.target.style.border = "1px solid #000";
			
		}
	}
}

export { getPathsDefault, getCell, validSpace, leaveSpace, selectEnemyOn, selectEnemyOut };