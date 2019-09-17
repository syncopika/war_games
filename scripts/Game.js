import { getPathsDefault, 
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
	  } from './Utils.js';
import { Deck } from './Deck.js';
import { CurrentHand, CardDisplay } from './Hand.js';
import { GameConsole } from './GameConsole.js';
import { Header } from './Header.js';
import { Grid } from './Grid.js';
import { enemyMovement, enemyMovement2 } from "./enemyAI.js";

import { CompleteDomination } from "./cards/card1.js";
import { PancakeSniper } from "./cards/card2.js";
import { BearAttack } from "./cards/card3.js";

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/*** NOTES

how about this for a new idea:

stack a transparent canvas (2d) on top of the webgl one instead of using an html grid.
on the transparent canvas you can draw a circle showing the attack/movement range of the current ship.
the circle will only appear when you click on a ship. 

in this way, we can have our ships move around arbitrarily! no need to keep track of what grid cell it's on 
for one thing. 

***/

class Game extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			'width': this.props.gridWidth, // width in px
			'height': this.props.gridHeight, // height in px
			'numRows': Math.floor(this.props.gridHeight / 60),
			'numCols': Math.floor(this.props.gridWidth / 52),
			'playerUnits': {}, // map a grid cell's id to a unit
			'enemyUnits': {},
			'playerDeck': new Deck([PancakeSniper, CompleteDomination, BearAttack]),
			'enemyDeck': new Deck(),
			'handSize': this.props.handSize, //4, // how many cards a hand can have at a time 
			'playerHand': [],   // the cards the player currently holds
			'enemyHand': [],  // the cards the opponent currently holds
			'consoleMsgs': [],
			'enemyScore': 0,
			'playerScore': 0,
			'playerMoves': 1,
			'currentEnemyUnit': null, // for displaying info of the current enemy selected
			'currentPlayerUnit': null, // currently selected player unit, and for displaying info of the current player unit selected 
			'playerTurn': true, // boolean indicating if player's turn or not
			'camera': null,
			'renderer': null,
			'scene': null,
			'loader': new GLTFLoader()
		};
		
		this.pathHighlight = "1px solid rgb(203, 216, 245)"; //rgb(175, 223, 255)
		this.attackRangeHighlight = "1px solid rgb(255, 25, 25)";
		
		this.playerUnitStats = {'health': 100, 'attack': 20, 'className': 'player', 'unitType': 'boss', 'direction': 'left', 'span': 3};
		this.enemyUnitStats = {'health': 100, 'attack': 20, 'className': 'enemy', 'unitType': 'boss', 'direction': 'right', 'span': 3};
		
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
		this.clearEnemyUnits = this.clearEnemyUnits.bind(this);
		this.clearPlayerUnits = this.clearPlayerUnits.bind(this);
		this.removeCardFromHand = this.removeCardFromHand.bind(this);
		this.setPlayerMoves = this.setPlayerMoves.bind(this);
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
		for(let i = 0; i < Math.floor(height / 60); i++){
			for(let j = 0; j < Math.floor(width / 52); j++){
				let cell = document.getElementById('row' + i + 'column' + j);
				cell.addEventListener('click', () => { self.activeObject(cell, self.state.playerUnits); });
				cell.addEventListener('click', () => { self.moveUnit(cell); });
			}
		}
		

		// place obstacles
		for(let i = 0; i < 10; i++){
			self.placeObstacles(0, self.state.numCols, 0, self.state.numRows);
		}
		
		const WIDTH = self.state.width; //1400;
		const HEIGHT = self.state.height; //600;
		const VIEW_ANGLE = 100;
		const ASPECT = WIDTH / HEIGHT;
		const NEAR = 1;
		const FAR = 1000;
		const LEFT = WIDTH / -10;
		const RIGHT = WIDTH / 10;
		const TOP = HEIGHT / 10;
		const BOTTOM = HEIGHT / -10;
		
		const container = document.querySelector('#container');
		const renderer = new THREE.WebGLRenderer();
		const camera = new THREE.OrthographicCamera(LEFT, RIGHT, TOP, BOTTOM, NEAR, FAR);	
		const scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xffffff );
		
		scene.add(camera);
		renderer.setSize(WIDTH, HEIGHT);	
		container.appendChild(renderer.domElement);
		renderer.render(scene, camera);
		
		this.setState({'renderer': renderer, 'camera': camera, 'scene': scene});
		
		let spotLight = new THREE.SpotLight( 0xffffff );
		spotLight.position.set( 0, 0, 1 );
		spotLight.castShadow = true;
		spotLight.shadow.mapSize.width = 3000;
		spotLight.shadow.mapSize.height = 500;
		spotLight.shadow.camera.near = 10;
		spotLight.shadow.camera.far = 1000;
		spotLight.shadow.camera.fov = 30;
		scene.add(spotLight);
			
		let obj = null;
		let loadedModels = [];
		loadedModels.push(self.getModel('../assets/battleship-edit.glb', 'player'));
		loadedModels.push(self.getModel('../assets/battleship2.glb', 'enemy'));
		
		Promise.all(loadedModels).then((objects) => {
			objects.forEach((obj) => {
				if(obj.side === "enemy"){
					self.placeObject(3, self.state.numRows - 3, 2, Math.floor(self.state.numCols/2), obj, this.enemyUnitStats);
					scene.add(obj);
				}else{
					self.placeObject(3, self.state.numRows - 3, Math.floor(self.state.numCols/2) + 1, self.state.numCols - 2, obj, this.playerUnitStats);
					scene.add(obj);
				}
			});
			requestAnimationFrame(update);
		});
		
		let rotation = 0.05;
		let maxRotation = Math.PI * .05;
		let minRotation = -maxRotation;
		let maxReached = false;
		let minReached = false;
		
		function update(){		
			renderer.render(scene, camera);
			requestAnimationFrame(update);
			
			// keep adding to rotation until max is reached. 
			// if maxed is reached, keep decreasing rotation until min is reached.
			// if min is reached, repeat step 1. 
			let allUnits = new Set(Object.values(self.state.playerUnits).concat(Object.values(self.state.enemyUnits)));
			allUnits.forEach((mesh) => {
				if(mesh.rotation.z < maxRotation && !maxReached)
				{
					mesh.rotation.z += 0.002;
					if(mesh.rotation.z >= maxRotation){
						maxReached = true;
						minReached = false;
					}
				}else if(maxReached){
					mesh.rotation.z -= 0.002;
					if(mesh.rotation.z <= minRotation){
						minReached = true;
						maxReached = false;
					}
				}else if(minReached){
					mesh.rotation.z += 0.002;
				}
			});
		}
	}
	
	getModel(modelFilePath, side){
		return new Promise((resolve, reject) => {
			this.state.loader.load(
				modelFilePath,
				function(gltf){
					gltf.scene.traverse((child) => {
						if(child.type === "Mesh"){
			
							let material = child.material;
							let geometry = child.geometry;
							let obj = new THREE.Mesh(geometry, material);
							
							obj.scale.x = child.scale.x * 20;
							obj.scale.y = child.scale.y * 20;
							obj.scale.z = child.scale.z * 20;
							obj.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI / 2); // note this on object's local axis! so when you rotate, the axes change (i.e. x becomes z)
							obj.rotateOnAxis(new THREE.Vector3(0,0,1), Math.PI / 2);
						
							obj.side = side; // player or enemy mesh?
							resolve(obj);
						}
					});
				},
				// called while loading is progressing
				function(xhr){
					console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
				},
				// called when loading has errors
				function(error){
					console.log( 'An error happened' );
					console.log(error);
				}
			);
		});
	}
	
	getRandomCell(startRow, endRow, startCol, endCol){
		let randomCol = Math.floor(Math.random() * (endCol - startCol + 1) + startCol);
		let randomRow = Math.floor(Math.random() * (endRow - startRow + 1) + startRow);
		let gridCell = document.querySelector("#row" + randomRow + "column" + randomCol);
		return gridCell;
	}
	
	setCellAttributes(element, attributes){
		for(let property in attributes){
			if(property === "className"){
				element.className = attributes[property];
			}else{
				element.setAttribute(property, attributes[property]);
			}
		}		
	}
	
	removeCellAttributes(element, attributes){
		for(let property in attributes){
			if(propert === "className"){
				element.classList.remove(attributes[property]);
			}else{
				element.removeAttribute(property);
			}
		}
	}
	
	/****
		place unit in random location
		and add to either player's or enemy's list of units 

		leftBound and rightBound are parameters to determine the range of where to place unit
		
		@unitName = name of the unit i.e. battleship1
		@leftBound = column to start at
		@rightBound = column to end at 
		@topBound = top row boundary
		@bottomBound = bottom row boundary
		@stats = dictionary containing unit attributes to add to grid cell element
		the bound params are INCLUSIVE
	****/
	placeObject(startRow, endRow, startCol, endCol, object, stats){
		let gridCell = this.getRandomCell(startRow, endRow, startCol, endCol);
		
		// don't allow placement in cells with a unit or obstacle placed there already
		while(gridCell.className !== ""){
			gridCell = this.getRandomCell(startRow, endRow, startCol, endCol);
		}
		
		let v = convert2dCoordsTo3d(gridCell, this.state.renderer, this.state.camera, this.state.width, this.state.height);
		object.position.set(v.x, v.y, -450);
		
		if(object.side === "enemy"){
			this.state.enemyUnits[gridCell.id] = object;
		}else{
			this.state.playerUnits[gridCell.id] = object;
		}
		
		this.setCellAttributes(gridCell, stats);
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
		if(playerList[currElement.id] === undefined){
			return;
		}
		
		// also can only move if it's the player's turn 
		
		// what kind of unit is it?
		// double equals cause pathlight value might be a string (so need looser comparison) 
		if(currElement.getAttribute('pathlight') == 0){
			// light up the paths 
			let elementPaths = getPathsDefault(currElement);
			for(let key in elementPaths){
				if(elementPaths[key].className === ""){
					elementPaths[key].style.border = this.pathHighlight;
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
			
		}else if(currElement.getAttribute('pathlight') == 1){
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
		
		side effects:
			- playerMoves should be decremented by 1 if player moves or attacks 
		
	******/
	moveUnit(element){
		
		let playerUnit = this.state.currentPlayerUnit;
		
		if(playerUnit == null){
			return;
		}
		
		if(this.state.playerMoves === 0){
			this.updateConsole("no more moves left!");
			return;
		}
		
		let cellDirection = getMoveDirection(element, playerUnit);
		
		/***
			
			also need to check enemy units and their locations to see whether the next square over 
			is a valid move or possibly an attack. 
		
			track direction - see if unit needs to be rotated before moving 
		
		***/
		// if square is highlighted or red (#FF1919) (for ranged units)
		if(element.style.border === this.pathHighlight || element.style.border === this.attackRangeHighlight){
			
			// if cell to move in is an enemy unit 
			if(element.className === "enemy"){
				
				let animationCanvas = document.createElement('canvas');
				
				// show animation 
				animationCanvas.width = parseInt(element.style.width);
				animationCanvas.height = parseInt(element.style.height);
				animationCanvas.style.zIndex = 1;
				let canvasCtx = animationCanvas.getContext('2d');
				canvasCtx.fillStyle = "rgba(0,0,0,0)";
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
					
					self.removeCellAttributes(element, self.enemyUnitStats);
					//element.classList.remove("enemy");
					//element.style.backgroundImage = "";
					//element.removeAttribute("health");
					//element.removeAttribute("attack");
					//element.removeAttribute("unitType");
					
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
				// update playerMoves 
				this.setPlayerMoves(this.state.playerMoves - 1);
				
				this.updateConsole("player attacked!");
				
			}else if(element.style.border !== this.attackRangeHighlight){
				// red squares only indicate attack range, not movement, so don't allow movement there
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
				let v = convert2dCoordsTo3d(element, this.state.renderer, this.state.camera, this.state.width, this.state.height); 
				let obj = this.state.playerUnits[playerUnit.id];

				// rotate unit first if they're choosing a cell that's in a direction orthogonal
				// to their current direction 
				// get curr direction 
				// figure out what the direction of the cell to move to is relative to curr direction 
				// - also need to know if that cell requires a counterclockwise or clockwise rotation
				// do rotation
				
				// if rotation needed, rotate 
				let rotateFunc = setInterval(
					function(){
						rotate("clockwise", obj, 90, rotateFunc);
					}, 50
				);

				// gotta use promises
				let moveFunc = setInterval(
					function(){
						move(cellDirection, obj, v, moveFunc);
					}, 50
				);
				
				element.setAttribute("health", playerUnit.getAttribute("health"));
				element.setAttribute("attack", playerUnit.getAttribute("attack"));
				element.setAttribute("unitType", playerUnit.getAttribute("unitType"));
				element.setAttribute("direction", cellDirection);
				element.setAttribute("span", 3);
				
				// clear old data for currentUnit
				//playerUnit.style.backgroundImage = "";
				playerUnit.removeAttribute("unitType");
				playerUnit.removeAttribute("health");
				playerUnit.removeAttribute("attack");
				playerUnit.removeAttribute("direction");
				playerUnit.removeAttribute("span");
				
				let currUnitPaths = getPathsDefault(playerUnit);
				for(let key in currUnitPaths){
					if(currUnitPaths[key]){
						currUnitPaths[key].style.border = "1px solid #000";
					}
				}
			
				// update player array 
				let mesh = this.state.playerUnits[playerUnit.id];

				if(this.state.playerUnits[playerUnit.id]){
					// replace old cell representing this unit with new cell holding the moved unit
					delete this.state.playerUnits[playerUnit.id];
				}

				// set currentUnit to new location
				this.selectPlayerUnit(element);
				this.state.playerUnits[element.id] = obj;
				
				// update playerMoves 
				this.setPlayerMoves(this.state.playerMoves - 1);
			}
			
		}
	}
	
	
	
	/*****
		enemy's turn 
		@enemyAI = a function that tells each enemy unit how to move
		@searchMethod = function that returns an array of grid cell ids representing the path to reach a player's unit		
	******/
	enemyTurn(enemyAI, searchMethod){
		let promiseList = []
		for(let key in this.state.enemyUnits){
			// enemyAI function should return a promise
			promiseList.push(enemyAI(document.getElementById(key), this.state, this.selectEnemyUnit, searchMethod));
		}
		Promise.all(promiseList).then((results) => {
			alert('enemy ended turn');
			this.endEnemyTurn();
			// reset player's moves 
			this.setPlayerMoves(Object.keys(this.state.playerUnits).length + this.state.playerHand.length);
		});
	}
	
	/*
	addToDeck(card, deck, side){
		let copy = [...deck];
		copy.push(card);
		if(side === 'player'){
			this.setState({'playerDeck': copy});
		}else{
			this.setState({'enemyDeck': copy});
		}
	}*/
	
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
			'enemyUnits': {}
		});
	}
	
	clearPlayerUnits(){
		this.setState({
			'playerUnits': {}
		});
	}
	
	selectEnemyUnit(unitElement){
		this.setState({'currentEnemyUnit': unitElement});
	}
	
	selectPlayerUnit(unitElement){
		this.setState({'currentPlayerUnit': unitElement});
	}
	
	addToEnemyUnits(unitElement){
		this.setState((state) => {
			let copy = [...state.enemyUnits];
			copy.push(unitElement);
			return {'enemyUnits': copy};
		});
	}
	
	setPlayerMoves(newValue){
		this.setState({'playerMoves': newValue});
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
	
	removeCardFromHand(cardName, side){
		let newState = {};
		let newArr = [];
		let hand;
		if(side === "player"){
			hand = "playerHand";
			
			// since this card has been used, decrement the player's number of moves 
			newState['playerMoves'] = this.state['playerMoves'] - 1;
		}else{
			hand = "enemyHand";
		}
		this.state[hand].forEach((card) => {
			if(card.name !== cardName){
				newArr.push(card);
			}
		});
		newState[hand] = newArr;
		this.setState(newState);
	}
	
	/***
	
		draw new cards (up to the given hand size)
		
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
		// also increment player's number of moves 
		let cardsDrawn = [...this.state.playerHand]; // making a copy 
		for(let i = 0; i < max; i++){
			cardsDrawn.push(deck.remove());
		}
		
		// should have console refresh and cards displayed should also update 
		this.setState((state) => { 
			let copy = [...state.consoleMsgs]; 
			copy.push("player drew " + cardsDrawn.length + " cards!");
			
			// subtract 1 because drawing cards itself costs a move 
			return {'consoleMsgs': copy, 'playerHand': cardsDrawn, 'playerMoves': this.state.playerMoves + cardsDrawn.length - 1}; 
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
	}
	
	endEnemyTurn(){
		this.setState({'playerTurn': true});
	}
	
	// game console will rerender if dialogMsgs receives a new message
	// hand will rerender as cards get used up OR player requests to draw new cards 
	render(){
		
		let gameMethods = {
			'drawCards': this.drawCards ,
			'endPlayerTurn': this.endPlayerTurn,
			'endEnemyTurn': this.endEnemyTurn,
			'updateConsole': this.updateConsole,
			'selectEnemyUnit': this.selectEnemyUnit,
			'selectPlayerUnit': this.selectPlayerUnit,
			'updatePlayerUnitsAtIndex': this.updatePlayerUnitsAtIndex,
			'removeFromEnemyUnits': this.removeFromEnemyUnits,
			'addToEnemyUnits': this.addToEnemyUnits,
			'addToPlayerUnits': this.addToPlayerUnits,
			'clearEnemyUnits': this.clearEnemyUnits,
			'clearPlayerUnits': this.clearPlayerUnits,
			'removeCardFromHand': this.removeCardFromHand,
			'setPlayerMoves': this.setPlayerMoves
		};
			
		return(
			<div>
				<Header 
					selectedEnemy={this.state.currentEnemyUnit} 
					selectedUnit={this.state.currentPlayerUnit} 
					playerUnits={this.state.playerUnits}
					enemyUnits={this.state.enemyUnits}
					playerTurn={this.state.playerTurn}
					playerMoves={this.state.playerMoves}
					endPlayerTurn={this.endPlayerTurn} 
					drawCards={this.drawCards}
				/>
				
				<Grid 
					width={this.state.width}
					height={this.state.height}
					numRows={this.state.numRows}
					numCols={this.state.numCols}
				/>
				
				<br />
				
				<GameConsole 
					consoleMsgs={this.state.consoleMsgs}
				/>
				
				<br />
				
				<CurrentHand 
					gameState={this.state}
					gameMethods={gameMethods}
				/>
			</div>
		);
	}
	
	
}

export { Game };