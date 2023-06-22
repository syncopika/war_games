import { getPathsDefault, getAttackRange, getCell } from './Utils.js';
import * as THREE from 'three';

const Grid = (props) => {

	// create the table cells
	let numRows = props.numRows; //Math.round(Math.floor(window.innerWidth / props.width) / 10) * 12; // calculate width of cell
	let numCols = props.numCols; //Math.round(Math.floor(window.innerHeight / props.height) / 10) * 8; // calculate height of cell
	
	let cellWidth = 100 / numCols; // a percentage of 100
	let cellHeight = 100 / numRows; // a percentage of 100
	
	let containerStyle = {
		'position': 'relative',
        'width': props.width + 'px',
        'display': 'block',
        'margin': '0 auto',
	};
	
	let gridStyle = {
		'width': props.width + 'px',
		'height': props.height + 'px',
		'position': 'absolute',
		'top': 0,
		'left': 0
	};
	
	let rowStyle = {
		'width': '100%',
		'padding': '0',
		'margin': '0'
	};
	
	let colStyle = {
		'border': '1px solid #000',
		'width': cellWidth + '%',
		'height': cellHeight + '%'
	};
	
	let tableStyle = {
		'width': '100%',
		'height': '100%'
	};
	
	let rows = [];
	for(let i = 0; i < numRows; i++){
		let cols = [];
		for(let j = 0; j < numCols; j++){
			let newColId = 'row' + i + 'column' + j;
			cols.push(
				<td
					key={newColId}
					id={newColId}
					pathlight={0}
					style={colStyle}
				> 
				</td>
			);
		}
		let newRowId = "row" + i;
		
		// add the cells for each column to their row 
		rows.push(
				<tr 
					key={newRowId} 
					id={newRowId} 
					style={rowStyle}
				>
				{cols}
				</tr>
		);
	}

	return(
		<div id='container' style={containerStyle}>
			<div id='grid' style={gridStyle}>
				<table style={tableStyle}>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		</div>
	);
	
	
}

export { Grid };

