// this looks helpful: https://medium.com/kevin-salters-blog/testing-react-with-enzyme-fbfc30190e70
// be careful not to test implementation details!

import { JSDOM } from "jsdom";
import { Game } from "../../scripts/Game.js";
import { Header } from "../../scripts/Header.js";
import { shallow, mount } from 'enzyme';

// when testing make sure to uncomment import react statements in the script files used 
describe("<Game />", () => {
	
	let jsdom;
	let wrapper;
	
	// I'm not sure if I really should be doing this...
	// todo: find out why you can't just call shallow on a component
	// I think it might have to do with my component's behavior, i.e. attaching event listeners to 
	// elements that should be rendered in componentDidMount - maybe this is the problem
	beforeAll(() => {	
		// create a mock of the DOM, add the grid. then select a cell of the grid and check paths
		jsdom = new JSDOM("<!doctype html><html><body><div></div></body></html>");
		document = jsdom.window.document;
		wrapper = mount(<Game gridWidth={28} gridHeight={15} />, {attachTo: document.body});
	});
	
	it("should have the Header component", () => {
		const header = wrapper.find(Header);
		expect(header.length).toEqual(1);
	});
	
	it("should have 2 img elements", () => {
		const imgElements = wrapper.find('img');
		expect(imgElements.length).toEqual(2);
	});
	
});