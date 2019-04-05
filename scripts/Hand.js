// thought simply npm installing react and then importing from the node_modules directory would work
// https://stackoverflow.com/questions/51765686/how-to-obtain-es6-module-of-react-and-reactdom
// https://github.com/facebook/react/issues/11503
// https://github.com/wearespindle/react-ecmascript

// uncomment these for the jasmine tests lol  - this is because since Jasmine works server-side/in node.js,
// it can access the node_modules where react and react-dom live. can't do that when integrating modules client-side as I'm doing 
//import React from 'react';
//import ReactDOM from 'react-dom';

class CardDisplay extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			'index': this.props.index,
			'name': this.props.name,
			'image': this.props.image,
			'description': this.props.description,
			'ability': this.props.ability
		}
	}
	
	render(){
		
		let titleStyle = {
			'fontWeight': 'bold'
		}
		
		let imageStyle = {
			'width': '200px',
			'height': '150px',
			'marginTop': '10px'
		}
		
		let buttonStyle = {
			'marginTop': '10px'
		}
		
		/*
		return(
			<div>
				<div style={titleStyle}>
					{this.state.name}
				</div>
				
				<div>
					<img src={this.state.image} style={imageStyle}>
				</div>
				
				<div>
					{this.state.description}
				</div>
				
				<button style={buttonStyle} onClick={this.state.ability}>
					activate
				</button>
			</div>
		)*/
		return React.createElement('div',
			{className: "card"},
			React.createElement('div', {style: titleStyle}, this.state.name),
			React.createElement('img', {style: imageStyle, src: this.state.image}),
			React.createElement('div', null, this.state.description),
			React.createElement('button', {style: buttonStyle, onClick: () => {
				this.state.ability();
				//console.log(this.state.index);
				//console.log("card is now dead");
				// tell parent that we should be inactivated and cleared from the hand 
			}}, 'activate')
		)
	}

}

class CurrentHand extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			'numCardsPerHand':  this.props.numCardsPerHand,
			'cards': this.props.cards,
			'cardStates': Array(this.props.numCardsPerHand).fill(true), //this.props.cards.map((el) => true),
			'gameInstance': this.props.gameInstance
		}
	}

	// on updating arrays in state: https://stackoverflow.com/questions/26253351/correct-modification-of-state-arrays-in-reactjs
	render(){
		let cardDisplays = this.state.cards.map((card, i) => { 
			if(this.state.cardStates[i] === true){
				return React.createElement(CardDisplay, {
					key: i, // key is special so it can't be accessed from props (will just be 'undefined')
					index: i,
					name: card.name, 
					image: card.image, 
					description: card.description, 
					ability: () => { 
						card.ability(this.props.gameInstance); 
						// make it so that after the ability is activated, this hand is immediately notified that the card has been used and should be 
						// eliminated from view 
						this.setState((state) => { let copy = [...state.cardStates]; copy[i] = false; return {'cardStates': copy} }); 
					}
				});	
			}
		});

		return(
			React.createElement('div', null, cardDisplays)
		)
	}

}

export { CardDisplay }; 
export { CurrentHand };
