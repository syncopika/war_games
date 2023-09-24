// utility functions that do general things
// since functions in my enemy AI file and my Game file need to use these functions, they're here 
import * as THREE from 'three';

function convert2dCoordsTo3d(rendererObj, camera, containerWidth, containerHeight){
    let posX = Math.floor(Math.random() * containerWidth);
    let posY = Math.floor(Math.random() * containerHeight);
	let x = posX / containerWidth * 2 - 1;
	let y = posY / containerHeight * -2 + 1;
	let v = new THREE.Vector3(x, y, 0).unproject(camera);
	return v;
}

function rotate(direction, object, targetAngle, setIntervalName){
	if(direction === "clockwise"){
		// only rotate 90 degrees
		// BUT WHAT ABOUT ROTATING LEFT TO RIGHT AT 180 DEGREES!!!??
		object.rotation.y -= 0.03;
		if(THREE.MathUtils.radToDeg(object.rotation.y) <= targetAngle){
			clearInterval(setIntervalName);
		}
	}else{
		object.rotation.y += 0.03;
		if(THREE.MathUtils.radToDeg(object.rotation.y) >= targetAngle){
			clearInterval(setIntervalName);
		}
	}
}

// target = 3d vertex
function move(direction, object, target, setIntervalName){
	// stop movement if reach target		
	// remember that in 3d space, downward movement means increasing negative numbers (unlike in 2d where going down means increasing positive value)
	if(direction == "left"){
		object.position.x -= .2;
		if(object.position.x <= target.x){
			clearInterval(setIntervalName);
		}
	}else if(direction == "right"){
		object.position.x += .2;
		if(object.position.x >= target.x){
			clearInterval(setIntervalName);
		}
	}else if(direction == "top"){
		object.position.y += .2;
		if(object.position.y >= target.y){
			clearInterval(setIntervalName);
		}
	}else{
		object.position.y -= .2;
		if(object.position.y <= target.y){
			clearInterval(setIntervalName);
		}
	}
}

export {
	convert2dCoordsTo3d,
	move,
	rotate,
};