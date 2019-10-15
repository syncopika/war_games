function Point(x, y, mesh){
	this.x = mesh.position.x;
	this.y = mesh.position.y;
	this.obj = mesh;
}

function Node(point, dim){
	this.data = [point.x, point.y];
	this.point = point;
	this.dim = dim;
	this.left = null;
	this.right = null;
}

function getDist(x1, x2, y1, y2){
	// removing Math.sqrt from the equation seemed to be the fix in producing 
	// the correct output (with sqrt it looks like you get the wrong neighbor choices for some points going along a diagonal in the image)
	// not sure why? however, with Math.sqrt it's considerably faster...
	return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}

// in this use case our dimensions will be x and y (since each pixel has an x,y coordinate)
// so only 2 dimensions 
function build2dTree(pointsList, currDim){
	
	var maxDim = 2;
	
	// sort the current list in ascending order depending on the current dimension
	var dim = currDim === 0 ? 'x' : 'y';
	pointsList.sort(function(a, b){
		if(a[dim] < b[dim]){
			return -1;
		}else if(a[dim] > b[dim]){
			return 1;
		}else{
			return 0;
		}
	});
	
	// base case: if pointsList is size 0, return null. otherwise if size 1, place the point and return 
	if(pointsList.length === 0){
		return null;
	}
	if(pointsList.length === 1){
		return new Node(pointsList[0], currDim);
	}
	if(pointsList.length === 2){
		// since it's a BST, the 2nd element (at index 1) will be larger and thus the parent of 
		// the 1st element, which will go to the left of the parent
		var newParent = new Node(pointsList[1], currDim);
		var newChild = new Node(pointsList[0], (currDim + 1) % maxDim);
		newParent.left = newChild;
		return newParent;
	}
	
	// take the median point, place it, and recurse on left and right 
	var midIndex = Math.floor((pointsList.length - 1) / 2);
	var newNode = new Node(pointsList[midIndex], currDim);
	newNode.left = build2dTree(pointsList.slice(0, midIndex), (currDim + 1) % maxDim);
	newNode.right = build2dTree(pointsList.slice(midIndex+1, pointsList.length), (currDim + 1) % maxDim);		
	return newNode;
}

function getTreeSize(tree){
	if(tree === null){
		return 0;
	}else{
		return 1 + getTreeSize(tree.left) + getTreeSize(tree.right);
	}
}

function isLeaf(node){
	return node.left === null && node.right === null;
}


// find nearest neighbor in 2d tree given a point's x and y coords and the tree's root 
function findNearestNeighbor(root, x, y){
	var record = {};
	
	// set default values 
	record.nearestNeighbor = root.point;
	record.minDist = getDist(root.data[0], x, root.data[1], y);
	
	// pass record to the recursive nearest-neighbor helper function so that it gets updated
	findNearestNeighborHelper(root, record, x, y);
	
	return record.nearestNeighbor;
}

function findNearestNeighborHelper(root, record, x, y){
	
	if(isLeaf(root)){
		var dist = getDist(root.data[0], x, root.data[1], y);
		if(dist < record.minDist){
			record.nearestNeighbor = root.point;
			record.minDist = dist;
		}
	}else{
	
		// compare current dist with min dist 
		currDist = getDist(root.data[0], x, root.data[1], y);
		if(currDist < record.minDist){
			record.nearestNeighbor = root.point;
			record.minDist = currDist;
		}
		
		if(root.left && !root.right){
			// if a node has one child, it will always be the left child 
			findNearestNeighborHelper(root.left, record, x, y);
		}else{
			// find the right direction to go in the tree based on dimension //distance
			var currDimToCompare = (root.dim === 0) ? x : y;
			
			if(currDimToCompare === x){
				// is x greater than the current node's x? if so, we want to go right. else left.
				if(x > root.data[0]){
					findNearestNeighborHelper(root.right, record, x, y);
					
					// then, we check if the other subtree might actually have an even closer neighbor!
					if(x - record.minDist < root.data[0]){
						findNearestNeighborHelper(root.left, record, x, y);
					}
				}else{
					findNearestNeighborHelper(root.left, record, x, y);

					if(x + record.minDist > root.data[0]){
						// x + record.minDist forms a circle. the circle in this case
						// encompasses this current node's coordinates, so we can get closer to the query node 
						// by checking the right subtree 
						findNearestNeighborHelper(root.right, record, x, y);
					}
				}
			}else{
				if(y > root.data[1]){
					findNearestNeighborHelper(root.right, record, x, y);
					if(y - record.minDist < root.data[1]){
						findNearestNeighborHelper(root.left, record, x, y);
					}
				}else{
					findNearestNeighborHelper(root.left, record, x, y);
					if(y + record.minDist > root.data[1]){
						findNearestNeighborHelper(root.right, record, x, y);
					}
				}
			}
		}
	}
	
}


function enemyMove(){
	let playerList = playerUnits.map((obj) => new Point(obj.position.x, obj.position.y, obj));
	let tree = build2dTree(playerList, 0);
	console.log(playerList);
	enemyUnits.forEach((enemyObj) => {
		let neighbor = findNearestNeighbor(tree, enemyObj.position.x, enemyObj.position.y);
		console.log("I am at: " + "x: " + enemyObj.position.x + ", y: " + enemyObj.position.y + ". The enemy I should attack is at: x: " + neighbor.x + ", y: " + neighbor.y);
		// move the enemy units towards their selected opponent 
		//console.log(enemyObj.selectArea.geometry.parameters.radius);
		let neighborMesh = neighbor.obj;
		let vecToOpponent = new THREE.Vector3(neighbor.x - enemyObj.position.x, neighbor.y - enemyObj.position.y, -450).normalize();
		vecToOpponent.multiplyScalar(100);
		let posToMoveTo = new THREE.Vector3(enemyObj.position.x + vecToOpponent.x, enemyObj.position.y + vecToOpponent.y, -450);
		moveObj(enemyObj, posToMoveTo);
	});
}
