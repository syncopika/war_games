import { getPathsDefault, getCell } from './Utils.js';
import { Deck } from './Deck.js';

function Game(){

	const playerUnits = [];
	const enemyUnits = [];
	
	const playerDeck = new Deck();
	const enemyDeck = new Deck();
	
	let currentUnit = null;
	
	this.playerUnits = function(){
		return playerUnits;
	}
	
	this.enemyUnits = function(){
		return enemyUnits;
	}
	
	this.clearEnemyUnits = function(){
		enemyUnits.splice(0, playerUnits.length);
	}
	
	this.clearPlayerUnits = function(){
		playerUnits.splice(0, playerUnits.length);
	}
	
	this.playerDeck = function(){
		return playerDeck;
	}
	
	this.enemyDeck = function(){
		return enemyDeck();
	}
	
	this.currentUnit = function(){
		return currentUnit;
	}
	
	this.setCurrentUnit = function(newUnit){
		currentUnit = newUnit;
	}
	
	/*****

		create the grid map 
		pass in the width as the number of cells wide the grid should be 
		pass in the height as in the number of rows the grid should have 

	******/
	this.createGrid = function(width, height){

		let parent = document.getElementById('grid');

		console.log("width: " + window.innerWidth + " height: " + window.innerHeight)
		
		let w = Math.round(Math.floor(window.innerWidth / width) / 10) * 10; // calculate width of cell
		let h = Math.round(Math.floor(window.innerHeight / height) / 10) * 8; // calculate height of cell
		
		console.log("w: " + w + " h: " + h)
		parent.style.padding = "5px";
		
		for(let i = 0; i < height; i++){
			
			let newRow = document.createElement('div');
			newRow.style.width = "100%";
			newRow.id = 'row' + i;
			newRow.style.padding = "0";
			newRow.style.margin = "0";
			
			// if grid is 15 x 36, width per cell should be ~50, height ~40 
			for(let j = 0; j < width; j++){

				let newColumn = document.createElement('div');
				newColumn.style.border = '1px solid #000';
				newColumn.style.width = w + "px"; 
				newColumn.style.height = h + "px"; 
				newColumn.style.display = 'inline-block';
				newColumn.style.verticalAlign = "middle";
				newColumn.style.backgroundSize = "100% 100%";
				newColumn.id = 'column' + j;
				newColumn.setAttribute('pathLight', 0); // 0 == pathLight is off 

				// bind click event to highlight paths 
				newColumn.addEventListener('click', function(){
					activeObject(this, playerUnits);
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

		place unit in random location
		and add to either player's or enemy's list of units 

		leftBound and rightBound are parameters to determine the range of where to place unit
		
		@element = path to the picture file for the unit
		@leftBound = column to start at
		@rightBound = column to end at 
		@topBound = top row boundary
		@bottomBound = bottom row boundary
		@stats = other information like className, id, health, attack, other html attributes in an associative array
		
		the bound params are INCLUSIVE
	****/
	this.placeRandom = function(element, leftBound, rightBound, bottomBound, topBound, stats){

		let randomCol = Math.floor(Math.random() * (rightBound - leftBound - 1) + leftBound);
		let randomRow = Math.floor(Math.random() * (topBound - bottomBound - 1) + bottomBound);
		let randCell = getCell(randomRow, randomCol);
		
		while(randCell.style.backgroundImage !== ""){
			randomCol = Math.floor(Math.random() * (rightBound - leftBound - 1) + leftBound);
			randomRow = Math.floor(Math.random() * (topBound - bottomBound - 1) + bottomBound);
			randCell = getCell(randomRow, randomCol);
		}
		
		for(let property in stats){
			if(property === "className"){
				randCell.className = stats[property];
			}else{
				randCell.setAttribute(property, stats[property]);
			}
		}

		randCell.style.backgroundImage = "url(" + element + ")";
		
		// enemyUnits need to be pushed into the enemyUnits array
		if(stats["className"] === "enemy"){
			enemyUnits.push(randCell);
		}else if(stats["className"] === "player"){
			playerUnits.push(randCell);
		}
	}
	
	/*****
	
		enemy's turn 
		@enemyAI = a function that tells each enemy unit how to move 
	
	******/
	this.enemyTurn = function(enemyAI){
		for(let i = 0; i < enemyUnits.length; i++){
			enemyAI(enemyUnits[i], enemyUnits, playerUnits);
		}
		alert('enemy ended turn');
	}
	
	/*****

		get attack range of unit 
		
	*******/
	function getAttackRange(element, distance){
		// this element will return the top, bottom, left and right blocks
		let paths = {};
		
		// get the parent of this element. this element should be a column cell, so the parent will be the row
		let row = parseInt(element.parentNode.id.match(/\d+/g)[0]);
		let column = parseInt(element.id.match(/\d+/g)[0]);

		// check top coord 
		let topRow = document.getElementById("row" + (row - distance));
		if(topRow){
			topRow = topRow.childNodes;
			for(let i = 0; i < topRow.length; i++){
				let col = parseInt(topRow[i].id.match(/\d+/g)[0]);
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
				let col = parseInt(bottomRow[i].id.match(/\d+/g)[0]);
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
			let newCol = parseInt(currRow[i].id.match(/\d+/g));
			if(newCol === (column - distance)){
				paths["left"] = currRow[i];
				break;
			}
		}
		
		// check right coord 
		paths["right"] = null;
		for(let i = 0; i < currRow.length; i++){
			let newCol = parseInt(currRow[i].id.match(/\d+/g));
			if(newCol === (column + distance)){
				paths["right"] = currRow[i];
				break;
			}
		}
		
		return paths;
	}
	// make function accessible from the outside as well
	this.getAttackRange = getAttackRange;
	
		
	/****
		show paths when click on unit
	****/
	function activeObject(currElement, playerList){

		// only the player can select/move their own units 
		if(!playerList.includes(currElement)){
			return;
		}
		
		// update header in top of page to show current unit selected and current health
		// this makes some assumptions of the id's of the relevant elements in the header 
		let imgUrl = currElement.style.backgroundImage; // need to eliminate the 'url()' part from the string 
		imgUrl = imgUrl.substring(imgUrl.indexOf('"')+1, imgUrl.indexOf(')')-1);  // note that this means the actual file path should not have quotes or parentheses!
		document.getElementById('player').setAttribute('src', imgUrl);
		document.getElementById('playerHealth').textContent = currElement.getAttribute("health");

		// what kind of unit is it?
		if(currElement.style.backgroundImage !== "" && currElement.getAttribute('pathLight') == 0){
			// light up the paths 
			let elementPaths = getPathsDefault(currElement);
			for(let key in elementPaths){
				if(elementPaths[key]){
					elementPaths[key].style.border = "1px solid #dddfff";
				}
			}
			currElement.setAttribute('pathLight', 1);
			currentUnit = currElement;
			
			// if special unit, show attack paths 
			if(currElement.getAttribute("unitType") === 'range2'){
				let attackRange = getAttackRange(currElement, 2);
				for(let path in attackRange){
					if(attackRange[path]){
						attackRange[path].style.border = "1px solid #FF1919";
					}
				}
			}
			
		}else if(currElement.style.backgroundImage !== "" && currElement.getAttribute('pathLight') == 1){
			// this is deselecting a unit 
			let elementPaths = getPathsDefault(currElement);
			for(let key in elementPaths){
				if(elementPaths[key]){
					elementPaths[key].style.border = "1px solid #000";
					//elementPaths[key].style.backgroundColor = "transparent";
				}
			}
			
			// if special unit, un-highlight attack paths also
			if(currElement.getAttribute("unitType") === 'range2'){
				let attackRange = getAttackRange(currElement, 2);
				for(let path in attackRange){
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

		move player's units 

		pass in the DOM element you want to move to 
		
	******/
	function moveUnit(element){
		
		if(currentUnit == null){
			return;
		}
		
		// if square is highlighted or red (#FF1919) (for ranged units like raichu)
		if(element.style.border === '1px solid rgb(221, 223, 255)' || element.style.border === '1px solid rgb(255, 25, 25)'){
			
			// red squares only indicate attack range, not movement, so don't allow movement there 
			if(element.style.backgroundImage === "" && element.style.border !== '1px solid rgb(255, 25, 25)'){
			
				// for ranged units
				// clear the red highlight
				if(currentUnit.getAttribute("unitType") === 'range2'){
					// we can assume the current unit is a ranged attacker
					// we can't assume what the range is, so the range ought to be another html attribute 
					let attackRange = getAttackRange(currentUnit, 2);

					for(let path in attackRange){
						if(attackRange[path]){
							attackRange[path].style.border = "1px solid #000";
						}
					}
				}
			
				// move the unit there 
				element.style.backgroundImage = currentUnit.style.backgroundImage;
				element.setAttribute("health", currentUnit.getAttribute("health"));
				element.setAttribute("attack", currentUnit.getAttribute("attack"));
				element.setAttribute("unitType", currentUnit.getAttribute("unitType"));
				
				// clear old data for currentUnit
				currentUnit.style.backgroundImage = "";
				currentUnit.setAttribute("unitType", null);
				currentUnit.setAttribute("health", null);
				currentUnit.setAttribute("attack", null)
				
				let currUnitPaths = getPathsDefault(currentUnit);
				for(let key in currUnitPaths){
					if(currUnitPaths[key]){
						currUnitPaths[key].style.border = "1px solid #000";
					}
				}
			
				// update player array 
				for(let i = 0; i < playerUnits.length; i++){
					if(playerUnits[i] === currentUnit){
						playerUnits[i] = element;
						break;
					}
				}
				
				// set currentUnit to new location
				currentUnit = element;
			}
			
			// if cell to move in is an enemy unit 
			if(element.className === "enemy"){
				// do damage
				let damage = element.getAttribute("health") - currentUnit.getAttribute("attack");
				if(damage <= 0){
					// remove from enemyUnits array 
					enemyUnits.splice(enemyUnits.indexOf(element), 1);
					
					// obliterate enemy 
					if(currentUnit.getAttribute("unitType") === 'range2'){
						$('#grid').effect("bounce");
					}else{
						$('#grid').effect("shake");
					}
					
					element.classList.remove("enemy");
					element.style.backgroundImage = "";
					element.setAttribute("health", null);
					element.setAttribute("attack", null);
					element.setAttribute("unitType", null);
				}else{
					if(currentUnit.getAttribute("unitType") === 'range2'){
						$('#grid').effect("bounce");
					}else{
						$('#grid').effect("shake");
					}
					
					element.setAttribute("health", damage);
				}

				let currUnitPaths = getPathsDefault(currentUnit);
				for(let key in currUnitPaths){
					if(currUnitPaths[key]){
						currUnitPaths[key].style.border = "1px solid #000";
					}
				}
				currentUnit.setAttribute('pathLight', 0);
						
				// for ranged units
				// clear the red highlight
				if(currentUnit.getAttribute("unitType") === 'range2'){
					// we can assume the current unit is a ranged attacker
					// we can't assume what the range is, so the range ought to be another html attribute 
					let attackRange = getAttackRange(currentUnit, 2);
					//console.log(attackRange);
					for(let path in attackRange){
						if(attackRange[path]){
							attackRange[path].style.border = "1px solid #000";
						}
					}
				}
			}
		}
	}


}

export { Game };