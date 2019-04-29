// this component displays the currently selected player unit and enemy unit and their stats (i.e. health, name, attack pts.)
// it is rendered in the Game component 

const Header = (props) => {
	
	let currPlayerUnit = props.selectedUnit;
	let currEnemy = props.selectedEnemy;
	
	// pass in e.target.style.backgroundImage
	function getImageSrc(url){
		let start = url.indexOf("(") + 2;  // inclusive 
		let end = url.indexOf(")") - 1;   // not inclusive
		return url.substring(start, end);
	}

	return (
		<div id='header'>
			<div id='enemyInfo'>
				<h3> enemy info </h3>
				<span>
				{
					(currEnemy === null) ? 
					(<img id='selectedEnemy' width='90px' height='120px' />) :
					(<img id='selectedEnemy' src={getImageSrc(currEnemy.style.backgroundImage)} width='90px' height='120px' />)
				}
				</span>
				<h3> enemy health: { 
					(currEnemy === null) ?
					<span id='enemyHealth'></span> :
					<span id='enemyHealth'> {currEnemy.getAttribute('health')} </span>
				} 
				</h3>
				<br />
				<p> enemy unit count: <span> {props.enemyUnits.length} </span></p>
			</div>
			
			<div id='title'>
				<h3> 2d turn-based game idea </h3>
				<p> click on the cat on the grid to move. </p>
				<p> click on an adjacent enemy unit to do damage, or on any enemy unit to get info. </p> 
				<p> click on 'draw cards' to get some new abilities. </p>
				<p>'end turn' causes the enemies to move and possibly do damage to you. </p>
				<select id="searchMethod">
					<option value="depth-first search" selected>depth-first search</option>
					<option value="A*">A*</option>
				</select>
				<p> yeah, I know the art is bad... lol </p>
			</div>
			
			<div id='playerOptions'>
				<h3> player info </h3>
				<span>
				{
					(currPlayerUnit === null) ? 
					(<img id='player' width='90px' height='120px' />) :
					(<img id='player' src={getImageSrc(currPlayerUnit.style.backgroundImage)} width='90px' height='120px' />)
				}
				</span> 
				<h3> player health: {
					(currPlayerUnit === null) ?
					<span id='playerHealth'></span> :
					<span id='playerHealth'> {currPlayerUnit.getAttribute('health')} </span>
				}
				</h3>
				<button disabled={!props.playerTurn} id='drawCards' onClick={props.drawCards}> draw cards </button>
				<button disabled={!props.playerTurn} id='endTurn' onClick={props.endPlayerTurn}> end turn </button>
				<p> player unit count: <span> {props.playerUnits.length} </span></p>
			</div>
		</div>
	);
}

export { Header };