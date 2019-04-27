import { getPathsDefault, getAttackRange, getCell } from './Utils.js';

const Grid = (props) => {

	// create the table cells
	let w = Math.round(Math.floor(window.innerWidth / props.width) / 10) * 12; // calculate width of cell
	let h = Math.round(Math.floor(window.innerHeight / props.height) / 10) * 8; // calculate height of cell
	
	let rowStyle = {
		'width': '100%',
		'padding': '0',
		'margin': '0'
	};
	
	let colStyle = {
		'border': '1px solid #000',
		'width': w + 'px',
		'height': h + 'px',
		'backgroundSize': '100% 100%'
	};
	
	let rows = [];
	for(let i = 0; i < props.height; i++){
		let cols = [];
		for(let j = 0; j < props.width; j++){
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
				</tr>);
	}

	return(
		<div id='grid'>
			<table>
				<tbody>
					{rows}
				</tbody>
			</table>
		</div>
	);
	
	
}

export { Grid };

