// the Game component will pass the console messages to display

const GameConsole = (props) => {
	//console.log(props);
	let consoleStyle = {
		'fontFamily': 'monospace',
		'fontSize': '14px',
		'overflowY': 'scroll',
		'height': '200px',
		'width': '700px',
		'border': '1px solid #000',
		'margin': '0 auto',
		'paddingLeft': '5px'
	};
			
	return(
		React.createElement('div', {style: consoleStyle}, props.consoleMsgs.map((line, i) => {
			return React.createElement('p', {key: i}, `${line}`);
		}))
	);
	
}

export { GameConsole };