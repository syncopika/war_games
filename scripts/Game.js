import { getPathsDefault, getCell } from './Utils.js';
import { Deck } from './Deck.js';
import { CurrentHand, CardDisplay } from './Hand.js';
import { GameConsole } from './GameConsole.js';
import { Header } from './Header.js';
import { Grid } from './Grid.js';
import { enemyMovement, enemyMovement2 } from "./enemyAI.js";


import { CompleteDomination } from "./cards/card1.js";
import { PancakeSniper } from "./cards/card2.js";
import { BearAttack } from "./cards/card3.js";

class Game extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			'width': 36,
			'height': 15,
			'playerUnits': [],
			'enemyUnits': [],
			'playerDeck': new Deck([PancakeSniper, CompleteDomination, BearAttack]),
			'enemyDeck': new Deck(),
			'handSize': this.props.handSize, //4; // how many cards a hand can have at a time 
			'playerHand': [],   // the cards the player currently holds
			'enemyHand': [],  // the cards the opponent currently holds
			'consoleMsgs': [],
			'enemyScore': 0,
			'playerScore': 0,
			'currentEnemyUnit': null, // for displaying info of the current enemy selected
			'currentPlayerUnit': null, // currently selected player unit, and for displaying info of the current player unit selected 
			'playerTurn': true // boolean indicating if player's turn or not
		}
		
		// methods for binding to pass to child components 
		this.drawCards = this.drawCards.bind(this);
		this.endPlayerTurn = this.endPlayerTurn.bind(this);
		this.endEnemyTurn = this.endEnemyTurn.bind(this);
		this.updateConsole = this.updateConsole.bind(this);
		this.selectEnemyUnit = this.selectEnemyUnit.bind(this);
		this.selectPlayerUnit = this.selectPlayerUnit.bind(this);
		this.updatePlayerUnitsAtIndex = this.updatePlayerUnitsAtIndex.bind(this);
		this.removeFromEnemyUnits = this.removeFromEnemyUnits.bind(this);
		this.addToEnemyUnits = this.addToEnemyUnits.bind(this);
		this.addToPlayerUnits = this.addToPlayerUnits.bind(this);
	}
	
	/*** 
		create the initial state of the game after all the DOM elements have been added 
	***/
	componentDidMount(){
		let self = this;
		let width = self.state.width;
		let height = self.state.height;
	
		// add event listeners
		document.addEventListener('click', function(e){
			if(e.target.className === "enemy"){
				// tell parent Game component about the currently selected enemy to display its info 
				self.selectEnemyUnit(e.target);
			}
		});
		
		// bind click event to highlight paths
		for(let i = 0; i < height; i++){
			for(let j = 0; j < width; j++){
				let cell = document.getElementById('row' + i + 'column' + j);
				cell.addEventListener('click', () => { self.activeObject(cell, self.state.playerUnits); });
				cell.addEventListener('click', () => { self.moveUnit(cell); });
			}
		}
		
		// populate map 
		self.placeRandom("./assets/catadmiral.png", width - 10, width, 0, height, {'health': 100, 'attack': 20, 'className': 'player', 'unitType': 'boss'});
		
		// place enemies 
		for(let i = 0; i < 10; i++){
			self.placeRandom("./assets/gasmask.png", 0, width, 0, height, {'health': 20, 'attack': 5, 'className': 'enemy', 'unitType': 'infantry'});
		}
		
		// place enemy boss
		self.placeRandom("./assets/enemyboss1.png", 0, 10, 0, height, {'health': 50, 'attack': 5, 'className' : 'enemy', 'unitType': 'boss'});
		
		// place obstacles
		for(let i = 0; i < 17; i++){
			self.placeObstacles(0, width, 0, height);
		}
	}
	
	/***
		functions for creating initial state of game 
	***/
	
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
			this.addToEnemyUnits(randCell);
			
		}else if(stats["className"] === "player"){
			this.addToPlayerUnits(randCell);
		}
	}
	
	// place obstacles randomly
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
	
	/****
	
		show paths when clicking on unit
		
	****/
	activeObject(currElement, playerList){
		
		//console.log(playerList.length);

		// only the player can select/move their own units 
		if(!playerList.includes(currElement)){
			return;
		}
		
		// also can only move if it's the player's turn 
		
		// what kind of unit is it?
		if(currElement.style.backgroundImage !== "" && currElement.getAttribute('pathlight') == 0){
			// light up the paths 
			let elementPaths = getPathsDefault(currElement);
			for(let key in elementPaths){
				if(elementPaths[key]){
					elementPaths[key].style.border = "1px solid #dddfff";
				}
			}
			currElement.setAttribute('pathlight', 1);
			this.selectPlayerUnit(currElement);
			
			// if special unit, show attack paths 
			if(currElement.getAttribute("unitType") === 'range2'){
				let attackRange = getAttackRange(currElement, 2);
				for(let path in attackRange){
					if(attackRange[path]){
						attackRange[path].style.border = "1px solid #FF1919";
					}
				}
			}
			
		}else if(currElement.style.backgroundImage !== "" && currElement.getAttribute('pathlight') == 1){
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
			
			currElement.setAttribute('pathlight', 0);
			this.selectPlayerUnit(null);
		}
	}
	
	// explosion animation for when enemy unit is destroyed
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

		move player's units 

		@element - the DOM element you want to move to 
		
	******/
	moveUnit(element){
		
		let playerUnit = this.state.currentPlayerUnit;
		
		if(playerUnit == null){
			return;
		}
		
		if(element.className === "obstacle"){
			return;
		}
		
		// if square is highlighted or red (#FF1919) (for ranged units like pancake sniper)
		if(element.style.border === '1px solid rgb(221, 223, 255)' || element.style.border === '1px solid rgb(255, 25, 25)'){
			
			// red squares only indicate attack range, not movement, so don't allow movement there 
			if(element.style.backgroundImage === "" && element.style.border !== '1px solid rgb(255, 25, 25)'){
			
				// for ranged units
				// clear the red highlight
				if(playerUnit.getAttribute("unitType") === 'range2'){
					// we can assume the current unit is a ranged attacker
					// we can't assume what the range is, so the range ought to be another html attribute 
					let attackRange = getAttackRange(playerUnit, 2);

					for(let path in attackRange){
						if(attackRange[path]){
							attackRange[path].style.border = "1px solid #000";
						}
					}
				}
			
				// move the unit there 
				element.style.backgroundImage = playerUnit.style.backgroundImage;
				element.setAttribute("health", playerUnit.getAttribute("health"));
				element.setAttribute("attack", playerUnit.getAttribute("attack"));
				element.setAttribute("unitType", playerUnit.getAttribute("unitType"));
				
				// clear old data for currentUnit
				playerUnit.style.backgroundImage = "";
				playerUnit.setAttribute("unitType", null);
				playerUnit.setAttribute("health", null);
				playerUnit.setAttribute("attack", null);
				
				let currUnitPaths = getPathsDefault(playerUnit);
				for(let key in currUnitPaths){
					if(currUnitPaths[key]){
						currUnitPaths[key].style.border = "1px solid #000";
					}
				}
			
				// update player array 
				for(let i = 0; i < this.state.playerUnits.length; i++){
					if(this.state.playerUnits[i] === playerUnit){
						// replace old cell representing this unit with new cell holding the moved unit
						this.updatePlayerUnitsAtIndex(element, i);
						break;
					}
				}
				
				// set currentUnit to new location
				this.selectPlayerUnit(element);
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
				let damage = element.getAttribute("health") - playerUnit.getAttribute("attack");
				if(damage <= 0){
					// remove from enemyUnits array 
					this.removeFromEnemyUnits(element);
				
					// obliterate enemy 
					let gridContainer = element.parentNode.parentNode.parentNode.id;
					if(playerUnit.getAttribute("unitType") === 'range2'){
						$('#grid').effect("bounce");
					}else{
						$('#grid').effect("shake");
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
					if(playerUnit.getAttribute("unitType") === 'range2'){
						$('#grid').effect("bounce");
					}else{
						$('#grid').effect("shake");
					}	
					element.setAttribute("health", damage);
				}

				let currUnitPaths = getPathsDefault(playerUnit);
				for(let key in currUnitPaths){
					if(currUnitPaths[key]){
						currUnitPaths[key].style.border = "1px solid #000";
					}
				}
				playerUnit.setAttribute('pathlight', 0);
						
				// for ranged units
				// clear the red highlight
				if(playerUnit.getAttribute("unitType") === 'range2'){
					// we can assume the current unit is a ranged attacker
					// we can't assume what the range is, so the range ought to be another html attribute 
					let attackRange = getAttackRange(playerUnit, 2);
					//console.log(attackRange);
					for(let path in attackRange){
						if(attackRange[path]){
							attackRange[path].style.border = "1px solid #000";
						}
					}
				}
			
				//this.refreshConsole("player attacked!");
				this.updateConsole("player attacked!");
			} // end if enemy 
		}
	}
	
	/*****
		enemy's turn 
		@enemyAI = a function that tells each enemy unit how to move 
	******/
	enemyTurn(enemyAI, searchMethod){
		for(let i = 0; i < this.state.enemyUnits.length; i++){
			enemyAI(this.state.enemyUnits[i], this.state.enemyUnits, this.state.playerUnits, searchMethod);
		}
		alert('enemy ended turn');
	}
	
	addToDeck(card, deck, side){
		let copy = [...deck];
		copy.push(card);
		if(side === 'player'){
			this.setState({'playerDeck': copy});
		}else{
			this.setState({'enemyDeck': copy});
		}
	}
	
	
	/***
		
		functions to pass to child components
		
	***/
	updateConsole(msg){
		this.setState((state) => {
			let copy = [...state.consoleMsgs];
			copy.push(msg);
			return {'consoleMsgs': copy};
		});
	}
	
	clearEnemyUnits(){
		this.setState({
			'enemyUnits': []
		});
	}
	
	clearPlayerUnits(){
		this.setState({
			'playerUnits': []
		});
	}
	
	selectEnemyUnit(unitElement){
		//console.log(unitElement);
		this.setState({'currentEnemyUnit': unitElement});
	}
	
	selectPlayerUnit(unitElement){
		//console.log('player unit selected!');
		this.setState({'currentPlayerUnit': unitElement});
	}
	
	addToEnemyUnits(unitElement){
		this.setState((state) => {
			let copy = [...state.enemyUnits];
			copy.push(unitElement);
			return {'enemyUnits': copy};
		});
	}
	
	addToPlayerUnits(unitElement){
		this.setState((state) => {
			let copy = [...state.playerUnits];
			copy.push(unitElement);
			return {'playerUnits': copy};
		});
	}
	
	updatePlayerUnitsAtIndex(unitElement, index){
		this.setState((state) => {
			let copy = [...state.playerUnits];
			copy[index] = unitElement;
			return {'playerUnits': copy};
		});
	}
	
	removeFromEnemyUnits(unitElement){
		this.setState((state) => {
			let copy = [...state.enemyUnits];
			copy.splice(copy.indexOf(unitElement), 1);
			return {'enemyUnits': copy};
		});
	}
	
	/*** 
		draw a new hand (pull 3 cards) for the player 
		@gameInstance = instance of Game object 
	***/
	drawCards(){	
		let deck = this.state.playerDeck;
		
		if(deck.size() === 0){
			return;
		}
		
		// shuffle deck first?
	
		let max = this.state.handSize;
		if(deck.size() <= 2 && deck.size() >= 1){
			max = deck.length;
		}
		
		// if player already has some cards, the number of cards drawn can't exceed handSize!
		let cardsDrawn = [...this.state.playerHand]; // making a copy 
		for(let i = 0; i < max; i++){
			cardsDrawn.push(deck.remove());
		}
		
		// should have console refresh and cards displayed should also update 
		this.setState((state) => { 
			let copy = [...state.consoleMsgs]; 
			copy.push("player drew " + cardsDrawn.length + " cards!");
			return {'consoleMsgs': copy, 'playerHand': cardsDrawn}; 
		});
		
	}
	
	// end turn for player 
	// executing this function should have the enemy move 
	// need to also deactivate any buttons clickable for the player during the enemy's turn 
	endPlayerTurn(){
		this.setState({'playerTurn': false}); // this should cause clickable buttons to become unclickable?
		this.updateConsole('player ended turn!'); 
		
		// get the selected search method from dropdown 
		let selectedMethod = document.getElementById('searchMethod');
		this.enemyTurn(enemyMovement2, selectedMethod.options[ selectedMethod.selectedIndex ].value);
		this.endEnemyTurn();
	}
	
	endEnemyTurn(){
		this.setState({'playerTurn': true});
	}
	
	// game console will rerender if dialogMsgs receives a new message
	// hand will rerender as cards get used up OR player requests to draw new cards 
	render(){
		return(
			<div>
				<Header 
					selectedEnemy={this.state.currentEnemyUnit} 
					selectedUnit={this.state.currentPlayerUnit} 
					playerUnits={this.state.playerUnits}
					enemyUnits={this.state.enemyUnits}
					playerTurn={this.state.playerTurn}

					endPlayerTurn={this.endPlayerTurn} 
					drawCards={this.drawCards}
				/>
				
				<Grid 
					width={this.state.width}
					height={this.state.height}
				/>
				
				<br />
				
				<GameConsole 
					consoleMsgs={this.state.consoleMsgs }
				/>
				
				<br />
				
				<CurrentHand 
					numCardsPerHand={this.state.handSize }
					cards={this.state.playerHand }
					updateConsole={this.updateConsole}
				/>
			</div>
		);
	}
	
	
}

export { Game };