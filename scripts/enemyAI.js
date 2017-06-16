// functions that help with unit movement, board manipulation

/*****

create the grid map 

******/
function createGrid(){

	var parent = document.getElementById('grid');

	for(var i = 0; i < height; i++){
		
		var newRow = document.createElement('div');
		newRow.style.width = "100%";
		newRow.id = 'row' + i;
		newRow.style.padding = "0";
		newRow.style.margin = "0";
		
		for(var j = 0; j < length; j++){

			var newColumn = document.createElement('div');
			newColumn.style.border = '1px solid #000';
			newColumn.style.width = "50px";
			newColumn.style.height = '40px';
			newColumn.style.display = 'inline-block';
			newColumn.style.backgroundSize = "100% 100%";
			newColumn.id = 'column' + j;
			newColumn.setAttribute('pathLight', 0); // 0 == pathLight is off 
			
			// bind click event to highlight paths 
		    newColumn.addEventListener('click', function(){
				activeObject(this);
			});
			
			// bind click event to move unit 
		    newColumn.addEventListener('click', function(){
				moveUnit(this);
			});
			
			newRow.appendChild(newColumn);
		}
		parent.appendChild(newRow);
	}
}


/****
	show paths when click on unit
****/
function activeObject(currElement){

	// only the player can select/move their own units 
	if(!player.includes(currElement)){
		return;
	}

	// what kind of unit is it?
	if(currElement.style.backgroundImage !== "" && currElement.getAttribute('pathLight') == 0){
		// light up the paths 
		var elementPaths = getPathsDefault(currElement);
		for(key in elementPaths){
			if(elementPaths[key]){
				elementPaths[key].style.border = "1px solid #dddfff";
			}
		}
		currElement.setAttribute('pathLight', 1);
		currentUnit = currElement;
		
		// if special unit, show attack paths 
		if(currElement.style.backgroundImage === 'url("alolanRaichu.png")'){
			var attackRange = getAttackRange(currElement, 2);
			for(path in attackRange){
				if(attackRange[path]){
					attackRange[path].style.border = "1px solid #FF1919";
				}
			}
		}
		
	}else if(currElement.style.backgroundImage !== "" && currElement.getAttribute('pathLight') == 1){
		var elementPaths = getPathsDefault(currElement);
		for(key in elementPaths){
			if(elementPaths[key]){
				elementPaths[key].style.border = "1px solid #000";
				//elementPaths[key].style.backgroundColor = "transparent";
			}
		}
		
		// if special unit, un-highlight attack paths 
		if(currElement.style.backgroundImage === 'url("alolanRaichu.png")'){
			var attackRange = getAttackRange(currElement, 2);
			for(path in attackRange){
				if(attackRange[path]){
					attackRange[path].style.border = "1px solid #000";
				}
			}
		}
		
		currElement.setAttribute('pathLight', 0);
		currentUnit = null;
	}
}

/*****
	default path option
	get the top, bottom, left, and right cells of clicked-on unit 
*******/
function getPathsDefault(element){
	// this element will return the top, bottom, left and right blocks
	var paths = {};
	
	// get the parent of this element. this element should be a column cell, so the parent will be the row
	var row = parseInt(element.parentNode.id.match(/\d+/g)[0]);
	var column = parseInt(element.id.match(/\d+/g)[0]);
	
	// top coordinate is row - 1, same column num
	// bottom coord is row + 1, same column num
	// left coord is column num - 1, same row 
	// right coord is column num + 1, same row 

	if(element.parentNode.previousSibling){	
		var previousRow = element.parentNode.previousSibling.childNodes;
		for(var i = 0; i < previousRow.length; i++){
			if(previousRow[i].id.match(/\d+/g)[0] == column){
				paths['top'] = previousRow[i];
				break;
			}
		}
	}else{
		paths['top'] = null;
	}
	
	if(element.parentNode.nextSibling){
		var nextRow = element.parentNode.nextSibling.childNodes;
		for(var i = 0; i < nextRow.length; i++){
			if(nextRow[i].id.match(/\d+/g)[0] == column){
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

/*****

	get attack range of unit 
	
*******/
function getAttackRange(element, distance){
	// this element will return the top, bottom, left and right blocks
	var paths = {};
	
	// get the parent of this element. this element should be a column cell, so the parent will be the row
	var row = parseInt(element.parentNode.id.match(/\d+/g)[0]);
	var column = parseInt(element.id.match(/\d+/g)[0]);

	// check top coord 
	var topRow = document.getElementById("row" + (row - distance));
	if(topRow){
		topRow = topRow.childNodes;
		for(var i = 0; i < topRow.length; i++){
			var col = parseInt(topRow[i].id.match(/\d+/g)[0]);
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
	var bottomRow = document.getElementById("row" + (row + distance));
	if(bottomRow){
		bottomRow = bottomRow.childNodes;
		for(var i = 0; i < bottomRow.length; i++){
			var col = parseInt(bottomRow[i].id.match(/\d+/g)[0]);
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
	var currRow = element.parentNode.childNodes;
	for(var i = 0; i < currRow.length; i++){
		var newCol = parseInt(currRow[i].id.match(/\d+/g));
		if(newCol === (column - distance)){
			paths["left"] = currRow[i];
			break;
		}
	}
	
	// check right coord 
	paths["right"] = null;
	for(var i = 0; i < currRow.length; i++){
		var newCol = parseInt(currRow[i].id.match(/\d+/g));
		if(newCol === (column + distance)){
			paths["right"] = currRow[i];
			break;
		}
	}
	
	return paths;
}


/*****

	move player's units 

******/
// pass in the DOM element you want to move to 
function moveUnit(element){
	
	// if square is highlighted or red (#FF1919) (for ranged units like raichu)
	if(element.style.border === '1px solid rgb(221, 223, 255)' || element.style.border === '1px solid rgb(255, 25, 25)'){
		// red squares only indicate attack range, not movement, so don't allow movement there 
		if(element.style.backgroundImage === "" &&  element.style.border !== '1px solid rgb(255, 25, 25)'){
		
			// for ranged units
			// clear the red highlight
			if(currentUnit.style.backgroundImage === 'url("alolanRaichu.png")'){
				// we can assume the current unit is a ranged attacker
				// we can't assume what the range is, so the range ought to be another html attribute 
				var attackRange = getAttackRange(currentUnit, 2);
				console.log(attackRange);
				for(path in attackRange){
					if(attackRange[path]){
						attackRange[path].style.border = "1px solid #000";
					}
				}
			}
		
			// move the unit there 
			element.style.backgroundImage = currentUnit.style.backgroundImage;
			element.setAttribute("health", currentUnit.getAttribute("health"));
			element.setAttribute("attack", currentUnit.getAttribute("attack"));
			
			// clear old data for currentUnit
			currentUnit.style.backgroundImage = "";
			currentUnit.setAttribute("health", null);
			currentUnit.setAttribute("attack", null)
			
			var currUnitPaths = getPathsDefault(currentUnit);
			for(key in currUnitPaths){
				if(currUnitPaths[key]){
					currUnitPaths[key].style.border = "1px solid #000";
				}
			}
		
			// update player array 
			for(var i = 0; i < player.length; i++){
				if(player[i] === currentUnit){
					player[i] = element;
					break;
				}
			}
			
			// set currentUnit to new location
			currentUnit = element;
		}
		
		// if cell to move in is an enemy unit 
		if(element.className === "enemy"){
			// do damage
			var damage = element.getAttribute("health") - currentUnit.getAttribute("attack");
			if(damage <= 0){
				// remove from enemies array 
				enemies.splice(enemies.indexOf(element), 1);
				
				// obliterate enemy 
				if(currentUnit.style.backgroundImage === 'url("alolanRaichu.png")'){
					$('#grid').effect("bounce");
				}else{
					$('#grid').effect("shake");
				}
				
				element.classList.remove("enemy");
				element.style.backgroundImage = "";
				element.setAttribute("health", null);
				element.setAttribute("attack", null);
			}else{
				if(currentUnit.style.backgroundImage === 'url("alolanRaichu.png")'){
					$('#grid').effect("bounce");
				}else{
					$('#grid').effect("shake");
				}
				
				element.setAttribute("health", damage);
			}

			var currUnitPaths = getPathsDefault(currentUnit);
			for(key in currUnitPaths){
				if(currUnitPaths[key]){
					currUnitPaths[key].style.border = "1px solid #000";
				}
			}
			currentUnit.setAttribute('pathLight', 0);
					
			// for ranged units
			// clear the red highlight
			if(currentUnit.style.backgroundImage === 'url("alolanRaichu.png")'){
				// we can assume the current unit is a ranged attacker
				// we can't assume what the range is, so the range ought to be another html attribute 
				// right now we're assuming it's 2 
				var attackRange = getAttackRange(currentUnit, 2);
				console.log(attackRange);
				for(path in attackRange){
					if(attackRange[path]){
						attackRange[path].style.border = "1px solid #000";
					}
				}
			}
		}

	}
}


/****

	place enemy units in random locations initially
	
****/
function placeRandom(){

	var randomCol = Math.floor(Math.random() * (length-1));
	var randomRow = Math.floor(Math.random() * (height-1));
	var randCell = getCell(randomRow, randomCol);
	
	while(randCell.style.backgroundImage !== ""){
		randomCol = Math.floor(Math.random() * (length-1));
		randomRow = Math.floor(Math.random() * (height-1));
		randCell = getCell(randomRow, randomCol);
	}
	
	randCell.setAttribute("health", 20);
	randCell.setAttribute("attack", 5);
	randCell.className = "enemy";
	randCell.style.backgroundImage = "url('shiina2.png')";
	enemies.push(randCell);
}

function getCell(row, col){
	var row = document.getElementById('row' + row).childNodes;
	for(var i = 0; i < row.length; i++){
		if(row[i].id === 'column' + col){
			return row[i];
		}
	}
	return null;
}
