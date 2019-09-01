import { getPathsDefault, getAttackRange, getCell, validSpace, leaveSpace, selectEnemyOn, selectEnemyOut, convert2dCoordsTo3d } from './Utils.js';
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
			'unitSizeMap': {
				'battleship1': 3 // takes up 3 cells
			},
			'unitGeometries': {}, // map unit names to their geometries and materials (i.e. {'battleship1': {'geometry': {...}, 'material': {...}}})
			'camera': null,
			'renderer': null,
			'scene': null
		};
		
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
		
		// populate map 
		//self.placeRandom("./assets/battleship.png", width - 10, width, 0, height, {'health': 100, 'attack': 20, 'className': 'player', 'unitType': 'boss'});
		
		/* place enemies 
		for(let i = 0; i < 10; i++){
			//self.placeRandom("./assets/battleship2.png", 0, width, 0, height, {'health': 20, 'attack': 5, 'className': 'enemy', 'unitType': 'infantry'});
		}*/
		
		// place enemy boss
		//self.placeRandom("./assets/battleship3.png", 0, 10, 0, height, {'health': 50, 'attack': 5, 'className' : 'enemy', 'unitType': 'boss'});
		
		/* place obstacles
		for(let i = 0; i < 17; i++){
			self.placeObstacles(0, width, 0, height);
		}*/
		
		const WIDTH = 1400;
		const HEIGHT = 600;
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
		spotLight.shadow.mapSize.width = 2000;
		spotLight.shadow.mapSize.height = 2000;
		spotLight.shadow.camera.near = 500;
		spotLight.shadow.camera.far = 4000;
		spotLight.shadow.camera.fov = 30;
		scene.add(spotLight);
			
		let loader = new GLTFLoader();
		let obj;
		// Load a glTF resource
		loader.load(
			// resource URL
			'../assets/battleship-edit.glb',
			// called when the resource is loaded
			function (gltf) {

				//scene.add( gltf.scene );
				gltf.scene.traverse((child) => {
					if(child.type === "Mesh"){
						//console.log(child);
						
						// give the player 2 battleships 
						let material = child.material;
						let geometry = child.geometry;
						
						for(let i = 0; i < 2; i++){
							obj = new THREE.Mesh(geometry, material);
							
							let randomCol = Math.floor(Math.random() * (self.state.numCols - 1));
							let randomRow = Math.floor(Math.random() * (self.state.numRows - 1));
		
							let gridCell = document.querySelector("#row" + randomRow + "column" + randomCol);
							
							self.state.playerUnits[gridCell.id] = obj;
							
							let v = convert2dCoordsTo3d(gridCell, renderer, camera, WIDTH, HEIGHT);
							
							obj.position.set(v.x, v.y, -450);
							obj.scale.x = child.scale.x * 20;
							obj.scale.y = child.scale.y * 20;
							obj.scale.z = child.scale.z * 20;
							obj.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI / 2); // note this on object's local axis! so when you rotate, the axes change (i.e. x becomes z)
							obj.rotateOnAxis(new THREE.Vector3(0,0,1), Math.PI / 2);
							scene.add(obj);
						}
						
						requestAnimationFrame(update);
					}
				});

			},
			// called while loading is progressing
			function (xhr) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// called when loading has errors
			function (error) {
				console.log( 'An error happened' );
				console.log(error);
			}
		);
		
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
			for(let unit in self.state.playerUnits){
				let mesh = self.state.playerUnits[unit];
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
			}

		}
		
			
		
	}
	
	/***
		functions for creating initial state of game 
	***/
	
	/****
		place unit in random location
		and add to either player's or enemy's list of units 

		leftBound and rightBound are parameters to determine the range of where to place unit
		
		@unitName = name of the unit i.e. battleship1
		@leftBound = column to start at
		@rightBound = column to end at 
		@topBound = top row boundary
		@bottomBound = bottom row boundary
		@unitSizeMap = dictionary mapping unit name to its size (the number of cells it occupies)
		
		the bound params are INCLUSIVE
	****/
	placeRandom(mesh, leftBound, rightBound, bottomBound, topBound, unitSizeMap){

		let randomCol = Math.floor(Math.random() * (rightBound - leftBound - 1) + leftBound);
		let randomRow = Math.floor(Math.random() * (topBound - bottomBound - 1) + bottomBound);
		let randCell = getCell(randomRow, randomCol);
		
		while(randCell.style.backgroundImage !== ""){
			randomCol = Math.floor(Math.random() * (rightBound - leftBound - 1) + leftBound);
			randomRow = Math.floor(Math.random() * (topBound - bottomBound - 1) + bottomBound);
			randCell = getCell(randomRow, randomCol);
		}
		
		/*
		for(let property in stats){
			if(property === "className"){
				randCell.className = stats[property];
			}else{
				randCell.setAttribute(property, stats[property]);
			}
		}*/

		//randCell.style.backgroundImage = "url(" + element + ")";
		
		/* enemyUnits need to be pushed into the enemyUnits array
		if(stats["className"] === "enemy"){
			this.addToEnemyUnits(randCell);
			
		}else if(stats["className"] === "player"){
			this.addToPlayerUnits(randCell);
		}*/
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
		if(currElement.getAttribute('pathlight') == 0){
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
		
		// if square is highlighted or red (#FF1919) (for ranged units)
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
				//element.style.backgroundImage = playerUnit.style.backgroundImage;
				let v = convert2dCoordsTo3d(element, this.state.renderer, this.state.camera, this.state.width, this.state.height); 
				let obj = this.state.playerUnits[playerUnit.id];
				obj.position.x = v.x;
				obj.position.y = v.y;
				
				element.setAttribute("health", playerUnit.getAttribute("health"));
				element.setAttribute("attack", playerUnit.getAttribute("attack"));
				element.setAttribute("unitType", playerUnit.getAttribute("unitType"));
				
				// clear old data for currentUnit
				playerUnit.style.backgroundImage = "";
				playerUnit.removeAttribute("unitType");
				playerUnit.removeAttribute("health");
				playerUnit.removeAttribute("attack");
				
				let currUnitPaths = getPathsDefault(playerUnit);
				for(let key in currUnitPaths){
					if(currUnitPaths[key]){
						currUnitPaths[key].style.border = "1px solid #000";
					}
				}
			
				// update player array 
				//for(let i = 0; i < this.state.playerUnits.length; i++){
					if(this.state.playerUnits[playerUnit.id]){
						// replace old cell representing this unit with new cell holding the moved unit
						//this.updatePlayerUnitsAtIndex(element, i);
						delete this.state.playerUnits[playerUnit.id];
						//break;
					}
				//}
				
				// set currentUnit to new location
				this.selectPlayerUnit(element);
				
				// update playerMoves 
				this.setPlayerMoves(this.state.playerMoves - 1);
			}
			
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
					
					element.classList.remove("enemy");
					element.style.backgroundImage = "";
					element.removeAttribute("health");
					element.removeAttribute("attack");
					element.removeAttribute("unitType");
					
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
			} // end if enemy 
		}
	}
	
	/*****
		enemy's turn 
		@enemyAI = a function that tells each enemy unit how to move
		@searchMethod = function that returns an array of grid cell ids representing the path to reach a player's unit		
	******/
	enemyTurn(enemyAI, searchMethod){
		let promiseList = []
		for(let i = 0; i < this.state.enemyUnits.length; i++){
			// enemyAI function should return a promise 
			promiseList.push(enemyAI(this.state.enemyUnits[i], this.state, this.selectEnemyUnit, searchMethod));
		}
		Promise.all(promiseList).then((results) => {
			alert('enemy ended turn');
			this.endEnemyTurn();
			// reset player's moves 
			this.setPlayerMoves(this.state.playerUnits.length + this.state.playerHand.length);
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
			'enemyUnits': []
		});
	}
	
	clearPlayerUnits(){
		this.setState({
			'playerUnits': []
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