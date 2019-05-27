import { JSDOM } from "jsdom";
import * as Utils from "../../scripts/Utils.js";
import { shallow, mount } from 'enzyme';
import { Game } from "../../scripts/Game.js";

// when testing make sure to uncomment import react statements in the script files used 
describe("check functions from Utils.js", () => {
		
	let jsdom;
	let wrapper;
	
	beforeAll(() => {
		// create a mock of the DOM, add the grid. then select a cell of the grid and check paths
		jsdom = new JSDOM("<!doctype html><html><body><div></div></body></html>");
		document = jsdom.window.document;
		
		let w = 36;
		let h = 15;
		wrapper = mount(<Game gridWidth={w} gridHeight={h} />, {attachTo: document.body});
	});
	
	it("test getPathsDefault", () => {
		expect(document.getElementsByTagName('table').length).toEqual(1);
		expect(document.getElementsByTagName('tr').length).toEqual(15); 
		expect(document.getElementsByTagName('td').length).toEqual(540); 		
		
		// select left corner cell (should only have right and bottom paths not null)
		let leftCornerCell = document.getElementsByTagName('td')[0];
		let paths = Utils.getPathsDefault(leftCornerCell);
		expect(paths.top).toBe(null);
		expect(paths.bottom).not.toBe(null);
		expect(paths.left).toBe(null);
		expect(paths.right).not.toBe(null);
		
		// select a center element (top, left, bottom and right should be non-null)
	});
	
	it("test valid space", () => {
		// a valid space (from the player's perspective) is a space that is in a column > 33
		let row = document.getElementsByTagName('table')[0].childNodes[0].childNodes[0]; // a row is a child node of a tbody
		let aValidSpace = row.childNodes[34];
		let invalidSpace = row.childNodes[2];
		
		// check that the border color has changed appropriately
		let aValidSpaceBorderColorInitial = aValidSpace.style.border;
		let invalidSpaceBorderColorInitial = invalidSpace.style.border;
		
		// simulate passing a mouse event to validSpace
		let validMouseEvent = {'target': aValidSpace};
		Utils.validSpace(validMouseEvent);
		expect(aValidSpace.style.border).not.toEqual(aValidSpaceBorderColorInitial);
		
		let invalidMouseEvent = {'target': invalidSpace};
		Utils.validSpace(invalidMouseEvent);
		expect(invalidSpace.style.border).toEqual(invalidSpaceBorderColorInitial);
		
	});
	
	
});