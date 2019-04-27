// https://stackoverflow.com/questions/41174095/do-i-need-to-use-onload-to-start-my-webpack-bundled-code

import React from 'react';
import ReactDOM from 'react-dom';
import { Game } from "./scripts/Game.js";

ReactDOM.render(
	<Game 
		handSize={3} 
	/>,
	document.getElementById('root')
);


/***************************/
