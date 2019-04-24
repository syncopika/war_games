// https://stackoverflow.com/questions/41174095/do-i-need-to-use-onload-to-start-my-webpack-bundled-code

import { Game } from "./scripts/Game.js";
import { GameConsole } from "./scripts/GameConsole.js";
import { enemyMovement, enemyMovement2 } from "./scripts/enemyAI.js";
import { CompleteDomination } from "./scripts/cards/card1.js";
import { PancakeSniper } from "./scripts/cards/card2.js";
import { BearAttack } from "./scripts/cards/card3.js";


/****   start game here  *****/
$(function(){
	
	/*****
		initiate first state of game 
	******/
	function initialState(length, height){
		
		// randomly place nyasu 
		// function placeRandom(element, health, attack, leftBound, rightBound, bottomBound, topBound, stats)
		gameInstance.placeRandom("./assets/catadmiral.png", length - 10, length, 0, height, {'health': 100, 'attack': 20, 'className': 'player', 'unitType': 'boss'});
		
		// place enemies 
		for(let i = 0; i < 10; i++){
			gameInstance.placeRandom("./assets/gasmask.png", 0, length, 0, height, {'health': 20, 'attack': 5, 'className': 'enemy', 'unitType': 'infantry'});
		}
		
		// place enemy boss
		gameInstance.placeRandom("./assets/enemyboss1.png", 0, 10, 0, height, {'health': 50, 'attack': 5, 'className' : 'enemy', 'unitType': 'boss'});
		
		// place obstacles
		for(let i = 0; i < 15; i++){
			gameInstance.placeObstacles(0, length, 0, height);
		}
	}

	// set up map 
	let length = 36;
	let height = 15;

	let gameInstance = new Game();
	gameInstance.consoleElement = document.getElementById('console');
	gameInstance.createGrid(length, height, document.getElementById('grid'));

	// set up units initially 
	initialState(length, height);

	// hook up end turn button with enemyTurn function 
	// get the selected enemyAI search method (i.e. dfs, A*)
	document.getElementById('endTurn').addEventListener('click', function(){
		let selectedMethod = $('#searchMethod :selected').text();
		gameInstance.enemyTurn(enemyMovement2, selectedMethod);
	});

	// load player's deck 
	let playerDeck = gameInstance.playerDeck;
	playerDeck.add(BearAttack);
	playerDeck.add(CompleteDomination);
	playerDeck.add(PancakeSniper);


	// hook up end draw cards button with drawCards function 
	document.getElementById('drawCards').addEventListener('click', function(){
		gameInstance.drawCards();
	});

	// add event listener to document to be able to click on enemy units and get some info 
	// what if selected enemy unit gets killed and their info was present? delete that info? 
	// if so, then maybe add an attribute for 'selectedEnemy' that wil equal the DOM element 
	// of the selected enemy. in the function where player attacks enemy, if enemy dies, check
	// 'selectedEnemy' attribute if it was that enemy. 
	document.addEventListener('click', function(e){
		if(e.target.className === "enemy"){
			let start = e.target.style.backgroundImage.indexOf("(") + 2;  // inclusive 
			let end = e.target.style.backgroundImage.indexOf(")") - 1;   // not inclusive
			let imgSrc = e.target.style.backgroundImage.substring(start, end);
			document.getElementById('selectedEnemy').setAttribute('src', imgSrc);
			document.getElementById('selectedEnemy').setAttribute('width', 90);
			document.getElementById('selectedEnemy').setAttribute('height', 120);
			document.getElementById('enemyHealth').textContent = e.target.getAttribute("health");
		}
	});
});

/***************************/
