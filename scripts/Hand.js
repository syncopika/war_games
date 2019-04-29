// thought simply npm installing react and then importing from the node_modules directory would work
// https://stackoverflow.com/questions/51765686/how-to-obtain-es6-module-of-react-and-reactdom
// https://github.com/facebook/react/issues/11503
// https://github.com/wearespindle/react-ecmascript


// to be used as a child component of CurrentHand 
let CardDisplay = (props) => {

	let titleStyle = {
		'fontWeight': 'bold'
	};
	
	let imageStyle = {
		'width': '200px',
		'height': '150px',
		'marginTop': '10px'
	};
	
	let buttonStyle = {
		'marginTop': '10px'
	};
	
	return(
		<div className="card">
			<div style={titleStyle}>
				{props.name}
			</div>
			
			<div>
				<img src={props.image} style={imageStyle} />
			</div>
			
			<div>
				{props.description}
			</div>
			
			<button style={buttonStyle} onClick={props.ability}>
				activate
			</button>
		</div>
	);
	
	/*
	return React.createElement('div',
		{className: "card"},
		React.createElement('div', {style: titleStyle}, this.state.name),
		React.createElement('img', {style: imageStyle, src: this.state.image}),
		React.createElement('div', null, this.state.description),
		React.createElement('button', {style: buttonStyle, onClick: () => {
			this.state.ability();
		}}, 'activate')
	)*/


}

const CurrentHand = (props) => {

/*
	constructor(props){
		super(props);
		this.state = {
			'numCardsPerHand': this.props.numCardsPerHand,
			'cards': this.props.cards,
			'cardStates': Array(this.props.numCardsPerHand).fill(true), 
			'gameInstance': this.props.gameInstance
		}
	}
*/
	
	// on updating arrays in state: https://stackoverflow.com/questions/26253351/correct-modification-of-state-arrays-in-reactjs
	//render(){
		let cardDisplays = props.gameState.playerHand.map((card, i) => { 
			return React.createElement(CardDisplay, {
				key: i, // key is special so it can't be accessed from props (will just be 'undefined')
				index: i,
				name: card.name, 
				image: card.image, 
				description: card.description, 
				ability: () => { 
					card.ability(props.gameState, card.name, props.gameMethods); 
					// make it so that after the ability is activated, this hand is immediately notified that the card has been used and should be 
					// eliminated from view 
					props.gameMethods.removeCardFromHand(card.name, "player");
					// use a function passed as a prop to update Game state 
					//this.setState((state) => { let copy = [...state.cardStates]; copy[i] = false; return {'cardStates': copy} }); 
				}
			});	
		});

		return(
			React.createElement('div', {id: 'showCards'}, cardDisplays)
		);
	//}

}

export { CardDisplay }; 
export { CurrentHand };
