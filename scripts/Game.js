import { getPathsDefault, getCell } from './Utils.js';
import { Deck } from './Deck.js';
import { CurrentHand, CardDisplay } from './Hand.js';
import { GameConsole } from './GameConsole.js';

class Game {
	constructor(){
		this.playerUnits = [];
		this.enemyUnits = [];
	
		this.gameGridElement = null;
	
		this.playerDeck = new Deck();
		this.enemyDeck = new Deck();
		this.handSize = 4; // how many cards a hand can have at a time 
		this.consoleDialog = [];
		this.consoleElement = null; // assign the dom element that's supposed to hold the console 
	
		this.currentUnit = null;	
	}
	
	refreshConsole(msg){
		this.consoleDialog.push(msg);
		if(this.consoleElement === null){
			let consoleEl = document.createElement('div');
			document.body.appendChild(consoleEl);
			this.consoleElement = consoleEl;
		}
		ReactDOM.render(React.createElement(GameConsole, {consoleDialog: this.consoleDialog}), this.consoleElement);
	}
	
	clearEnemyUnits(){
		this.enemyUnits = [];
	}
	
	clearPlayerUnits(){
		this.playerUnits = [];
	}
	
	setHandSize(newSize){
		this.handSize = newSize;
	}
	
	explosionAnimation(timestamp, num, canvas){
		if(num > 6){
			return;
		}
		let nextImage = new Image();
		nextImage.src = './explosion_animation/' + num + '.png';

		nextImage.onload = () => {
			let ctx = canvas.getContext('2d');
			ctx.clearRect(0,0,canvas.width,canvas.height);
			ctx.drawImage(nextImage,0,0,nextImage.width,nextImage.height);
			window.requestAnimationFrame((timestamp) => this.explosionAnimation(timestamp, num+1, canvas));
		}
	}
	
	/*****

		create the grid map 
		pass in the width as the number of cells wide the grid should be 
		pass in the height as in the number of rows the grid should have 

	******/
	createGrid(width, height, parentElement){
		
		this.gameGridElement = parentElement;
		this.refreshConsole("game started");
		
		let thisGameInstance = this;

		let parent = parentElement;

		//console.log("width: " + window.innerWidth + " height: " + window.innerHeight)
		
		let w = Math.round(Math.floor(window.innerWidth / width) / 10) * 10; // calculate width of cell
		let h = Math.round(Math.floor(window.innerHeight / height) / 10) * 8; // calculate height of cell
		
		//console.log("w: " + w + " h: " + h)
		parent.style.padding = "5px";
		
		let table = document.createElement('table');
		
		for(let i = 0; i < height; i++){
			let newRow = document.createElement('tr');
			newRow.style.width = "100%";
			newRow.id = 'row' + i;
			newRow.style.padding = "0";
			newRow.style.margin = "0";
			
			// if grid is 15 x 36, width per cell should be ~50, height ~40 
			for(let j = 0; j < width; j++){

				let newColumn = document.createElement('td');
				newColumn.style.border = '1px solid #000';
				newColumn.style.width = w + "px"; 
				newColumn.style.height = h + "px"; 
				newColumn.style.backgroundSize = "100% 100%";
				newColumn.id = 'column' + j;
				newColumn.setAttribute('pathLight', 0); // 0 == pathLight is off 
				
				// bind click event to highlight paths 
				newColumn.addEventListener('click', () => { thisGameInstance.activeObject(newColumn, thisGameInstance.playerUnits); });
				//newColumn.addEventListener('click', function(){ thisGameInstance.activeObject(this, thisGameInstance.playerUnits); });   //note the difference from the arrow function!
				
				// bind click event to move unit 
				newColumn.addEventListener('click', () => {thisGameInstance.moveUnit(newColumn); });
				
				newRow.appendChild(newColumn);
			}
			table.appendChild(newRow);
		}
		
		parent.appendChild(table);	
	}
	
	/*** 
		draw a new hand (pull 3 cards) for the player 
		@gameInstance = instance of Game object 
	***/
	drawCards(){	
		let deck = this.playerDeck;
		
		if(deck.length === 0){
			return;
		}
		
		// shuffle deck first?
	
		let max = this.handSize;
		if(deck.length <= 2 && deck.length >= 1){
			max = deck.length;
		}
		
		// if player already has some cards, the number of cards drawn can't exceed handSize!
		let cardsDrawn = [];
		for(let i = 1; i < max; i++){
			cardsDrawn.push(deck.remove());
		}
		
		// to do later: don't hardcode the container
		this.refreshConsole("player drew " + cardsDrawn.length + " cards!");
		ReactDOM.render(React.createElement(CurrentHand, {numCardsPerHand: max, cards: cardsDrawn, gameInstance: this}), document.getElementById('showCards'));
		
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
	placeRandom(element, leftBound, rightBound, bottomBound, topBound, stats){

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
			this.enemyUnits.push(randCell);
		}else if(stats["className"] === "player"){
			this.playerUnits.push(randCell);
		}
	}
	
	/*****
	
		place obstacles randomly
	
	******/
	placeObstacles(leftBound, rightBound, bottomBound, topBound){
		let randomCol = Math.floor(Math.random() * (rightBound - leftBound - 1) + leftBound);
		let randomRow = Math.floor(Math.random() * (topBound - bottomBound - 1) + bottomBound);
		let randCell = getCell(randomRow, randomCol);
		
		while(randCell.style.backgroundImage !== ""){
			randomCol = Math.floor(Math.random() * (rightBound - leftBound - 1) + leftBound);
			randomRow = Math.floor(Math.random() * (topBound - bottomBound - 1) + bottomBound);
			randCell = getCell(randomRow, randomCol);
		}
		
		randCell.style.backgroundColor = "#000";
		randCell.className = "obstacle";
	}
	
	
	/*****
	
		enemy's turn 
		@enemyAI = a function that tells each enemy unit how to move 
	
	******/
	enemyTurn(enemyAI){
		for(let i = 0; i < this.enemyUnits.length; i++){
			enemyAI(this.enemyUnits[i], this.enemyUnits, this.playerUnits);
		}
		alert('enemy ended turn');
	}
	
	/*****

		get attack range of unit 
		
	*******/
	getAttackRange(element, distance){
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
	//this.getAttackRange = getAttackRange;
	
		
	/****
	
		show paths when clicking on unit
		
	****/
	activeObject(currElement, playerList){

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
			this.currentUnit = currElement;
			
			// if special unit, show attack paths 
			if(currElement.getAttribute("unitType") === 'range2'){
				let attackRange = this.getAttackRange(currElement, 2);
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
				let attackRange = this.getAttackRange(currElement, 2);
				for(let path in attackRange){
					if(attackRange[path]){
						attackRange[path].style.border = "1px solid #000";
					}
				}
			}
			
			currElement.setAttribute('pathLight', 0);
			this.currentUnit = null;
		}
	}


	/*****

		move player's units 

		@element - the DOM element you want to move to 
		
	******/
	moveUnit(element){
		
		if(this.currentUnit == null){
			return;
		}
		
		if(element.className === "obstacle"){
			return;
		}
		
		// if square is highlighted or red (#FF1919) (for ranged units like raichu)
		if(element.style.border === '1px solid rgb(221, 223, 255)' || element.style.border === '1px solid rgb(255, 25, 25)'){
			
			// red squares only indicate attack range, not movement, so don't allow movement there 
			if(element.style.backgroundImage === "" && element.style.border !== '1px solid rgb(255, 25, 25)'){
			
				// for ranged units
				// clear the red highlight
				if(this.currentUnit.getAttribute("unitType") === 'range2'){
					// we can assume the current unit is a ranged attacker
					// we can't assume what the range is, so the range ought to be another html attribute 
					let attackRange = this.getAttackRange(this.currentUnit, 2);

					for(let path in attackRange){
						if(attackRange[path]){
							attackRange[path].style.border = "1px solid #000";
						}
					}
				}
			
				// move the unit there 
				element.style.backgroundImage = this.currentUnit.style.backgroundImage;
				element.setAttribute("health", this.currentUnit.getAttribute("health"));
				element.setAttribute("attack", this.currentUnit.getAttribute("attack"));
				element.setAttribute("unitType", this.currentUnit.getAttribute("unitType"));
				
				// clear old data for currentUnit
				this.currentUnit.style.backgroundImage = "";
				this.currentUnit.setAttribute("unitType", null);
				this.currentUnit.setAttribute("health", null);
				this.currentUnit.setAttribute("attack", null)
				
				let currUnitPaths = getPathsDefault(this.currentUnit);
				for(let key in currUnitPaths){
					if(currUnitPaths[key]){
						currUnitPaths[key].style.border = "1px solid #000";
					}
				}
			
				// update player array 
				for(let i = 0; i < this.playerUnits.length; i++){
					if(this.playerUnits[i] === this.currentUnit){
						this.playerUnits[i] = element;
						break;
					}
				}
				
				// set currentUnit to new location
				this.currentUnit = element;
			}
			
			// if cell to move in is an enemy unit 
			if(element.className === "enemy"){
				
				let animationCanvas = document.createElement('canvas');
				
				// show animation 
				animationCanvas.width = parseInt(element.style.width);
				animationCanvas.height = parseInt(element.style.height);
				animationCanvas.style.zIndex = 1;
				let canvasCtx = animationCanvas.getContext('2d');
				canvasCtx.fillStyle = "rgba(0,0,0,255)";
				canvasCtx.fillRect(0, 0, animationCanvas.width, animationCanvas.height);
				element.appendChild(animationCanvas);
		
				window.requestAnimationFrame((timestamp)=>{this.explosionAnimation(timestamp, 1, animationCanvas)});
				
				// do damage
				// show some effects when dealing damage
				let damage = element.getAttribute("health") - this.currentUnit.getAttribute("attack");
				if(damage <= 0){
					// remove from enemyUnits array 
					this.enemyUnits.splice(this.enemyUnits.indexOf(element), 1);
				
					// obliterate enemy 
					let gridContainer = element.parentNode.parentNode.parentNode.id;
					if(this.currentUnit.getAttribute("unitType") === 'range2'){
						$('#' + gridContainer).effect("bounce");
					}else{
						$('#' + gridContainer).effect("shake");
					}
					
					// remove animation canvas 
					setTimeout(function(){
						element.removeChild(animationCanvas);
					}, 300);
					
					element.classList.remove("enemy");
					element.style.backgroundImage = "";
					element.setAttribute("health", null);
					element.setAttribute("attack", null);
					element.setAttribute("unitType", null);
				}else{
					if(this.currentUnit.getAttribute("unitType") === 'range2'){
						$('#grid').effect("bounce");
					}else{
						$('#grid').effect("shake");
					}
					
					element.setAttribute("health", damage);
				}

				let currUnitPaths = getPathsDefault(this.currentUnit);
				for(let key in currUnitPaths){
					if(currUnitPaths[key]){
						currUnitPaths[key].style.border = "1px solid #000";
					}
				}
				this.currentUnit.setAttribute('pathLight', 0);
						
				// for ranged units
				// clear the red highlight
				if(this.currentUnit.getAttribute("unitType") === 'range2'){
					// we can assume the current unit is a ranged attacker
					// we can't assume what the range is, so the range ought to be another html attribute 
					let attackRange = this.getAttackRange(this.currentUnit, 2);
					//console.log(attackRange);
					for(let path in attackRange){
						if(attackRange[path]){
							attackRange[path].style.border = "1px solid #000";
						}
					}
				}
			
			this.refreshConsole("player attacked!");
			} // end if enemy 
		}
	}


}

export { Game };