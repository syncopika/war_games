import React from 'react';
import { shallow, mount } from 'enzyme';

import Card from '../../scripts/Card.js';
import { CardDisplay, CurrentHand } from '../../scripts/Hand.js';

describe('testing <CardDisplay />', () => {
	it('should have a button labeled "activate"', () => {
		const wrapper = shallow(<CardDisplay />);
		expect(wrapper.find("button").text()).toEqual("activate");
	});
});


describe('testing <CurrentHand />', () => {
	
	it('should render three <CardDisplay /> components', () => {
		function blank(){};
		const card1 = new Card('card1','',blank,'');
		const card2 = new Card('card2','',blank,'');
		const card3 = new Card('card3','',blank,'');
		const testDeck = [card1,card2,card3];
		
		const wrapper = mount(<CurrentHand gameState={{'playerHand': testDeck}} gameMethods={null} />);
			
		expect(wrapper.find(CardDisplay).length).toEqual(3);
	});

});
