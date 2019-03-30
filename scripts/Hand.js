
class CardDisplay extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			//'dead': false,
			'index': this.props.index,
			'name': this.props.name,
			'image': this.props.image,
			'description': this.props.description,
			'ability': this.props.ability
		}
	}
	
	/* need to be able to update state! */
	
	render(){
		
		let titleStyle = {
			'font-weight': 'bold'
		}
		
		let imageStyle = {
			'width': '200px',
			'height': '150px',
			'margin-top': '10px'
		}
		
		let buttonStyle = {
			'margin-top': '10px'
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
				console.log(this.state.index);
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
			 'cardStates': this.props.cards.map((el) => false),
			 'gameInstance': this.props.gameInstance
		}
	}

	render(){
		let cardDisplays = this.state.cards.map((card, i) => { return React.createElement(CardDisplay, {
			key: i, // key is special so it can't be accessed from props (will just be 'undefined')
			index: i,
			name: card.name, 
			image: card.image, 
			description: card.description, 
			ability: () => card.ability(this.props.gameInstance) 
			}); 
		});
		return(
			React.createElement('div', null, cardDisplays)
		)
	}

}

export { CardDisplay }; 
export { CurrentHand };
