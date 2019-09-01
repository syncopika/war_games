// https://stackoverflow.com/questions/41174095/do-i-need-to-use-onload-to-start-my-webpack-bundled-code

import React from 'react';
import ReactDOM from 'react-dom';
import { Game } from "./scripts/Game.js";

ReactDOM.render(
	<Game 
		gridWidth={1400}
		gridHeight={600}
		handSize={3} 
	/>,
	document.getElementById('root')
);


/***************************/
