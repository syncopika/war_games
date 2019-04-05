// the Game component will pass the console messages to display

// uncomment these for the jasmine tests lol 
//import React from 'react';
//import ReactDOM from 'react-dom';

class GameConsole extends React.Component{

	constructor(props){
		super(props);
		this.state = { 
			consoleDialog: this.props.currDialog,
			playerTextColor: 'blue',
			enemyTextColor: 'red'
		}
	}
	
	/*
	*  @action - string 
	*  @source - string 
	*/
	updateConsole(action, source){
		//if(source === 'player'){
		//}
		let newEntry = source + ": " + action;
		let copy = [...this.state.consoleDialog].push(newEntry);
		this.setState({
			consoleDialog: copy
		})
	}
	
	render(){
		let consoleStyle = {
			'font': 'monospace',
			'font-size': '14px',
			'overflow-y': 'scroll',
			'height': '200px',
			'width': '700px',
			'border': '1px solid #000',
			'margin': '0 auto',
			'padding-left': '5px'
		};
				
		return(
			React.createElement('div', {style: consoleStyle}, this.state.consoleDialog.map((line, i) => {
				return React.createElement('p', {key: i}, `${line}`);
			}))
		);
	}

}

export { GameConsole };