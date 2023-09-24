import {
		 convert2dCoordsTo3d, 
		 //move, 
		 //rotate,
	  } from './Utils.js';
import { Deck } from './Deck.js';
import { CurrentHand, CardDisplay } from './Hand.js';
import { GameConsole } from './GameConsole.js';
import { Header } from './Header.js';
import { Grid } from './Grid.js';
//import { enemyMovement, enemyMovement2 } from "./enemyAI.js";

import { CompleteDomination } from "./cards/card1.js";
import { PancakeSniper } from "./cards/card2.js";
import { BearAttack } from "./cards/card3.js";

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

/*** NOTES

how about this for a new idea:

stack a transparent canvas (2d) on top of the webgl one instead of using an html grid.
on the transparent canvas you can draw a circle showing the attack/movement range of the current ship.
the circle will only appear when you click on a ship. 

in this way, we can have our ships move around arbitrarily! no need to keep track of what grid cell it's on 
for one thing. 

***/

function inRange(v1, v2, limit){
    return (v1.x <= v2.x + limit && v1.x >= v2.x - limit && v1.y <= v2.y + limit && v1.y >= v2.y - limit);
}

function move(object, targetPos, directionVec, setIntervalName){
    // stop movement if reach target		
    // remember that in 3d space, downward movement means increasing negative numbers (unlike in 2d where going down means increasing positive value)
    if(inRange(object.position, targetPos, 0.1)){
        clearInterval(setIntervalName);
    }else{
        object.position.addScaledVector(directionVec, 0.2);
    }
}

function getAngleBetween(obj, vec){
    // https://github.com/mrdoob/three.js/issues/1606
    const matrix = new THREE.Matrix4();
    matrix.extractRotation(obj.matrix);
    
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyMatrix4(matrix);

    const currDirectionVector = direction; 
    const angleBetween = currDirectionVector.angleTo(vec);
    return angleBetween;
}

function rotate(object, angle, targetVec, setIntervalName, resolve){
    const limit = 0.03;
    const angleBetween = getAngleBetween(object, targetVec);
    if(angleBetween >= -limit && angleBetween <= limit){
        console.log("finished rotating");
        clearInterval(setIntervalName);
        resolve("done rotating");
    }else{
        object.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle);
    }
}

function moveObj(objToMove, targetPos){
    // check to make sure what moves are valid.
    // i.e. if an enemy ship is alread in another enemy's circle, they can move outside the circle
    // or rotate. they can't move closer if already in range to a fellow enemy. 
    let obj = objToMove;
    let v = targetPos;
    let vec = new THREE.Vector3(v.x - obj.position.x, v.y - obj.position.y, v.z - obj.position.z);
            
    // get curr unit direction vector 
    // https://github.com/mrdoob/three.js/issues/1606
    let angleBetween = getAngleBetween(obj, vec);
    
    // figure out if the angle should be added (clockwise) or subtracted (rotate counterclckwise)
    // https://stackoverflow.com/questions/16613616/work-out-whether-to-turn-clockwise-or-anticlockwise-from-two-angles
    let matrix = new THREE.Matrix4();
    matrix.extractRotation(obj.matrix);
    let direction = new THREE.Vector3(0, 0, 1);
    direction.applyMatrix4(matrix);
    let currDirectionVector = direction; 

    let crossProductLength = currDirectionVector.cross(vec);
    let rotatePromise = new Promise((resolve, reject) => {
        if(Math.abs(crossProductLength.z) > 0){
            // clockwise
            let rotateFunc = setInterval(
                function(){
                    rotate(obj, angleBetween / 40, vec, rotateFunc, resolve);
                }, 35
            );
        }else{
            // counterclockwise
            let rotateFunc = setInterval(
                function(){
                    rotate(obj, -angleBetween / 40, vec, rotateFunc, resolve);
                }, 35
            );
        }
    });
    
    rotatePromise.then((result) => {
        console.log(result);
        
        // move to point clicked
        vec.normalize();
        let moveFunc = setInterval(
            function(){
                obj.isMoving = true;
                move(obj, v, vec, moveFunc);
                obj.isMoving = false;
            }, 30
        );
    });
}

function explosionEffect(mesh, scene){
    //console.log('explosion');
    const position = mesh.position;
    const geometry = new THREE.SphereGeometry(0.5, 12, 12);
    const material = new THREE.MeshBasicMaterial({color: 0xffc0cb});//0x848884});
    material.wireframe = true;
    
    const numParticles = 20;
    for(let i = 0; i < numParticles; i++){
        const particle = new THREE.Mesh(geometry, material);
        particle.position.x = position.x - Math.random() * 3.3; //-Math.random() * position.x+2 + Math.random() * position.x+2;
        particle.position.y = position.y + Math.random() * 2.5; //-Math.random() * position.y+2 + Math.random() * position.y+2;
        particle.position.z = position.z + Math.random() * 2.3; //-Math.random() * position.z+2 + Math.random() * position.z+2;
        
        const sign = Math.random() < 0.5 ? -1 : 1;
        const direction = new THREE.Vector3(
            sign * (Math.random() * -1.2),
            sign * (Math.random() * 2.2),
            sign * (Math.random() * -1.2)
        );
        direction.normalize();
        particle.name = 'particle' + i;
        particle.direction = direction;
        
        scene.add(particle);
        
        setTimeout(() => {
            scene.remove(particle);
        }, 3000);
    }
}

function airstrike(plane, target, scene){
    console.log("setting up airstrike!");
    plane.scale.set(0.85, 0.85, 0.85);
    plane.add(new THREE.AxesHelper(5));
    
    // TODO: fix the axes of the plane model? z is pointing down it seems
    plane.rotateY(Math.PI / 2);
    plane.rotateX(Math.PI / 2);
    
    scene.add(plane);
    const start = new THREE.Vector3();
    start.copy(target.position);
    start.x -= 300;
    start.y += 50;
    
    /*
    const end = new Vector3();
    end.copy(target.position);
    end.x += 80;
    */
    
    plane.position.copy(start);
    
    // TODO: set plane rotation?
    
    plane.direction = new THREE.Vector3(3, 0, 0);
    plane.target = target;
    
    setTimeout(() => {
        scene.remove(plane);
    }, 8000);
}

function togglePlayerSelectArea(playerMesh, scene){
    if(playerMesh.selectAreaOn){
        playerMesh.selectAreaOn = false;
        scene.remove(playerMesh.selectArea);
    }else{
        playerMesh.selectArea.position.set(playerMesh.position.x, playerMesh.position.y + 1.0, playerMesh.position.z);
        scene.add(playerMesh.selectArea);
        playerMesh.selectAreaOn = true;
    }
}

class Game extends React.Component{
	constructor(props){
		super(props);
        // what doesn't need to be in state?
        // renderer, scene, loader
		this.state = {
			'width': this.props.gridWidth, // width in px
			'height': this.props.gridHeight, // height in px
			//'numRows': Math.floor(this.props.gridHeight / 60),
			//'numCols': Math.floor(this.props.gridWidth / 52),
			'playerUnits': {}, // map a grid cell's id to a unit
			'enemyUnits': {},
			'playerDeck': new Deck([PancakeSniper, CompleteDomination, BearAttack]),
			'enemyDeck': new Deck(),
			'handSize': this.props.handSize, //4, // how many cards a hand can have at a time 
			'playerHand': [],   // the cards the player currently holds
			'enemyHand': [],  // the cards the opponent currently holds
			'consoleMsgs': [],
			'enemyScore': 0,
			'playerScore': 0,
			'playerMoves': 100,
            'orbitControlsOn': false,
            'perspCameraMode': false,
			'currentEnemyUnit': null, // for displaying info of the current enemy selected
			'currentPlayerUnit': null, // currently selected player unit, and for displaying info of the current player unit selected 
			'playerTurn': true, // boolean indicating if player's turn or not
			'renderer': null,
			'scene': null,
			'loader': new GLTFLoader(), // don't think this should be part of react state?
            'airstrike': false,
		};
		
		this.playerUnitStats = {'health': 50, 'attack': 20, 'className': 'player', 'unitType': 'range2', 'direction': 'left', 'span': 3, 'bgImage': 'assets/battleship-edit.png'};
		this.enemyUnitStats = {'health': 50, 'attack': 20, 'className': 'enemy', 'unitType': 'range2', 'direction': 'right', 'span': 3, 'bgImage': 'assets/battleship2-edit.png'};
		
        this.orthoCamera = null;
        this.perspCamera = null;
        
        // for lerping camera
        this.camStartPos = null;   // initial position before lerping
        this.camStartTime; // start time for lerping
        this.lerpCamera = false;
        this.clock = new THREE.Clock();
        
        this.orbitControls = null;
        
        this.planeModel = null;
        
		// methods for binding to pass to child components 
		this.drawCards = this.drawCards.bind(this);
		this.endPlayerTurn = this.endPlayerTurn.bind(this);
		this.endEnemyTurn = this.endEnemyTurn.bind(this);
		this.updateConsole = this.updateConsole.bind(this);
		this.selectEnemyUnit = this.selectEnemyUnit.bind(this);
		this.selectPlayerUnit = this.selectPlayerUnit.bind(this);
		this.removeFromEnemyUnits = this.removeFromEnemyUnits.bind(this);
		this.addToEnemyUnits = this.addToEnemyUnits.bind(this);
		this.addToPlayerUnits = this.addToPlayerUnits.bind(this);
		this.clearEnemyUnits = this.clearEnemyUnits.bind(this);
		this.clearPlayerUnits = this.clearPlayerUnits.bind(this);
		this.removeCardFromHand = this.removeCardFromHand.bind(this);
		this.setPlayerMoves = this.setPlayerMoves.bind(this);
        this.toggleLerpCamera = this.toggleLerpCamera.bind(this);
        this.toggleOrbitControls = this.toggleOrbitControls.bind(this);
        this.toggleAirstrike = this.toggleAirstrike.bind(this);
	}
	
	/*** 
		create the initial state of the game after all the DOM elements have been added 
	***/
	componentDidMount(){
		let self = this;
		let width = self.state.width;
		let height = self.state.height;
		
		const WIDTH = self.state.width; //1400;
		const HEIGHT = self.state.height; //600;
		const VIEW_ANGLE = 100;
		const ASPECT = WIDTH / HEIGHT;
		const NEAR = 1;
		const FAR = 1000;
		const LEFT = WIDTH / -10;
		const RIGHT = WIDTH / 10;
		const TOP = HEIGHT / 10;
		const BOTTOM = HEIGHT / -10;
		
		const container = document.querySelector('#container');
		const renderer = new THREE.WebGLRenderer();
        //renderer.toneMappingExposure = 0.5;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        
        this.orthoCamera = new THREE.OrthographicCamera(LEFT, RIGHT, TOP, BOTTOM, NEAR, FAR);
        this.orthoCamera.rotateX(Math.PI / 2);
        
        this.perspCamera = new THREE.PerspectiveCamera(15, WIDTH / HEIGHT, 0.01, 10000);
        
        this.orbitControls = new OrbitControls(this.perspCamera, renderer.domElement);
        this.orbitControls.enabled = false;
        this.orbitControls.enablePan = false;
        this.orbitControls.update();
        
        const raycaster = new THREE.Raycaster();
        //raycaster.linePrecision = 0.1;
        
		const scene = new THREE.Scene();
		//scene.background = new THREE.Color(0xffffff);
		
		scene.add(this.orthoCamera);
        scene.add(this.perspCamera);
        //scene.add(plane);
        
		renderer.setSize(WIDTH, HEIGHT);	
		container.appendChild(renderer.domElement);
        
        // https://threejs.org/examples/webgl_shaders_ocean.html
        
        // Water
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

        const water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('waternormals.jpg', function(texture){
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: scene.fog !== undefined
            }
        );
        
        water.name = 'water';
        water.rotation.x = -Math.PI / 2;

        scene.add(water);

        // Skybox
        const sky = new Sky();
        sky.name = 'sky';
        sky.scale.setScalar(10000);

        const skyUniforms = sky.material.uniforms;

        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;
        
        const parameters = {
            elevation: 2.2,
            azimuth: 0
        };

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const sceneEnv = new THREE.Scene();
        const sun = new THREE.Vector3();

        let renderTarget;

        function updateSun(){
            const phi = THREE.MathUtils.radToDeg(90 - parameters.elevation);
            const theta = THREE.MathUtils.radToDeg(parameters.azimuth);

            sun.setFromSphericalCoords(1, phi, theta);

            sky.material.uniforms['sunPosition'].value.copy(sun);
            water.material.uniforms['sunDirection'].value.copy(sun).normalize();

            if(renderTarget !== undefined) renderTarget.dispose();

            sceneEnv.add(sky);
            renderTarget = pmremGenerator.fromScene(sceneEnv);
            scene.add(sky);

            scene.environment = renderTarget.texture;
        }

        updateSun();

        // https://stackoverflow.com/questions/18553209/orthographic-camera-and-selecting-objects-with-raycast
        // https://stackoverflow.com/questions/56349097/imprecise-raycast-with-orthographic-camera-in-three-js
        // https://stackoverflow.com/questions/26412409/using-raycasting-to-check-the-object-in-front-of-a-perspective-camera-with-first
        const mouse = new THREE.Vector2();
        renderer.domElement.addEventListener('mousedown', (evt) => {
            if(this.state.camera === this.orthoCamera){
                const x = evt.clientX - renderer.domElement.getBoundingClientRect().left;
                const y = evt.clientY - renderer.domElement.getBoundingClientRect().top;

                mouse.x = (x / renderer.domElement.width) * 2 - 1;
                mouse.y = -(y / renderer.domElement.height) * 2 + 1;

                const v = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(this.orthoCamera); // corresponding 3d coord to where clicked
                //console.log(`3d space - x: ${v.x}, y: ${v.y}, z: ${v.z}`);
                
                raycaster.set(v, new THREE.Vector3(0, -1, 0)); // ortho camera is looking down about the y-axis
                
                const intersects = raycaster.intersectObjects(scene.children, true); // make sure it's recursive
                if(intersects){
                    const selected = intersects.filter(x => !(x.object.name === 'sky' || x.object.name === 'water' || x.object.name === 'axeshelper'))[0]; // get first hit that's not sky or water or axeshelper
                    
                    if(!selected) return;
                    
                    if(selected.object.name === 'player'){
                        self.selectPlayerUnit(selected.object);
                        
                        // toggle select area visibility
                        togglePlayerSelectArea(selected.object, scene);
                    }else if(selected.object.name === 'selectArea'){
                        togglePlayerSelectArea(self.state.currentPlayerUnit, scene)
                        self.state.currentPlayerUnit.isMoving = true;
                        //console.log(`3d space - x: ${v.x}, y: ${v.y}, z: ${v.z}`);
                        //console.log(`player pos - x: ${self.state.currentPlayerUnit.position.x}, y: ${self.state.currentPlayerUnit.position.y}, z: ${self.state.currentPlayerUnit.position.z}`);
                        v.y = 0;
                        moveObj(self.state.currentPlayerUnit, v);
                    }
                    
                    if(selected.object.name === 'enemy' || selected.object.name === 'obstacle'){
                        if(self.state.currentPlayerUnit && selected.object.position.distanceTo(self.state.currentPlayerUnit.position) <= self.state.currentPlayerUnit.selectArea.geometry.parameters.radius + 5){
                            console.log("attacking...");
                            
                            if(self.state.airstrike){
                                airstrike(self.planeModel.clone(), selected.object, scene);
                            }
                            
                            explosionEffect(selected.object, scene);
                        }
                    }
                    
                    if(selected.object.material) selected.object.material.wireframe = true;
                    setTimeout(() => {
                        if(selected.object.material) selected.object.material.wireframe = false;
                    }, 1000);
                }
            }else{
                const x = evt.clientX - renderer.domElement.getBoundingClientRect().left;
                const y = evt.clientY - renderer.domElement.getBoundingClientRect().top;
                
                mouse.x = (x / renderer.domElement.width) * 2 - 1;
                mouse.y = -(y / renderer.domElement.height) * 2 + 1;
                
                raycaster.setFromCamera(mouse, this.perspCamera);
                
                const intersects = raycaster.intersectObjects(scene.children, true);
                if(intersects){
                    const selected = intersects.filter(x => !(x.object.name === 'sky' || x.object.name === 'water' || x.object.name === 'axeshelper'))[0];
                    
                    if(!selected) return;
                    
                    if(selected.object.name === 'selectArea'){
                        // TODO: how to know correct z-index based on where user clicked on selectArea? maybe don't allow movement in perspective cam mode
                        
                        //self.state.currentPlayerUnit.isMoving = true;
                        //const v = new THREE.Vector3(mouse.x, mouse.y, -450).unproject(this.perspCamera);
                        //moveObj(self.state.currentPlayerUnit, v);
                    }else if(selected.object.name === 'player'){
                        // TODO: maybe don't allow movement in perspective cam mode
                        //togglePlayerSelectArea(selected.object, scene);
                    }else if(selected.object.name === 'enemy' || selected.object.name === 'obstacle'){
                        if(self.state.currentPlayerUnit && selected.object.position.distanceTo(self.state.currentPlayerUnit.position) <= self.state.currentPlayerUnit.selectArea.geometry.parameters.radius + 5){
                            if(self.state.airstrike){
                                airstrike(self.planeModel.clone(), selected.object, scene);
                            }
                            
                            explosionEffect(selected.object, scene);
                        }
                    }
                }                
            }
        });
		
        renderer.domElement.addEventListener('mousemove', (evt) => {
                const x = evt.clientX - renderer.domElement.getBoundingClientRect().left;
                const y = evt.clientY - renderer.domElement.getBoundingClientRect().top;
                
                mouse.x = (x / renderer.domElement.width) * 2 - 1;
                mouse.y = -(y / renderer.domElement.height) * 2 + 1;
                
                raycaster.setFromCamera(mouse, this.state.camera);
                
                const intersects = raycaster.intersectObjects(scene.children, true); // make sure it's recursive
                if(intersects){
                    const selected = intersects.filter(x => !(x.object.name === 'sky' || x.object.name === 'water' || x.object.name === 'axeshelper'))[0]; // get first hit that's not sky or water or axeshelper
                    
                    if(!selected) return;
                    
                    if(self.state.currentPlayerUnit && selected.object.position.distanceTo(self.state.currentPlayerUnit.position) <= self.state.currentPlayerUnit.selectArea.geometry.parameters.radius + 5){
                        // flash wireframe so we know what we selected
                        // testing explosion effect
                        if(selected.object.name === 'enemy' || selected.object.name === 'obstacle'){     
                            if(selected.object.material) selected.object.material.wireframe = true;
                            setTimeout(() => {
                                if(selected.object.material) selected.object.material.wireframe = false;
                            }, 1000);
                        }
                    }
                }
        });
        
		this.setState({'renderer': renderer, 'camera': this.orthoCamera, 'scene': scene});
        
        const hemiLight = new THREE.HemisphereLight(0xffffff);
        hemiLight.position.set(0, 80, 0);
        //scene.add(hemiLight);
		
		const spotLight = new THREE.SpotLight(0xffffff);
		spotLight.position.set(0, 0, 20);
		spotLight.castShadow = true;
		//scene.add(spotLight);

		let obj = null;
		let loadedModels = [];
		loadedModels.push(self.getModel('../assets/battleship-edit.glb', 'player', 'player'));
		loadedModels.push(self.getModel('../assets/battleship2.glb', 'enemy', 'enemy'));
        loadedModels.push(self.getModel('../assets/spiky-thing.gltf', 'none', 'obstacle'));
        loadedModels.push(self.getModel('../assets/f14.gltf', 'none', 'plane'));
		
		Promise.all(loadedModels).then((objects) => {
            console.log(objects);
            
            // place obstacles
            const obstacleModel = objects.filter(x => x.name === "obstacle")[0];
            for(let i = 0; i < 10; i++){
                const obstacle = obstacleModel.clone();
                self.placeObstacles(obstacle);
            }
            
			objects.forEach((obj) => {
                obj.castShadow = true;
				if(obj.side === "enemy"){
					self.placeObject(obj);
					scene.add(obj);
				}else if(obj.side === "player"){
					self.placeObject(obj);
					scene.add(obj);
				}else if(obj.name === 'plane'){
                    this.planeModel = obj;
                }
			});
            
			requestAnimationFrame(update);
		});
		
		function update(){
            if(self.lerpCamera){
                if(self.state.currentPlayerUnit){
                    const currObj = self.state.currentPlayerUnit; //self.state.playerUnits[self.state.currentPlayerUnit.id];
                    const pos = currObj.position;
                    
                    // some position relative to the player's current unit
                    const endCamPos = new THREE.Vector3(
                        pos.x + 80,
                        pos.y + 2,
                        pos.z - 10 //self.state.camera.position.z
                    );
                    
                    if(!self.orbitControls.enabled){
                        self.perspCamera.position.copy(endCamPos);
                        self.perspCamera.lookAt(currObj.position);
                    }
                    
                    if(self.orbitControls.enabled){
                        self.orbitControls.target = self.state.currentPlayerUnit.position;
                        self.orbitControls.update();
                    }
                }
               
                renderer.render(scene, self.perspCamera);
            }else{
                renderer.render(scene, self.orthoCamera);
            }
            
            scene.children.forEach(child => {
                if(child.name.includes("particle")){
                    child.position.add(child.direction);
                }
                
                if(child.name.includes("plane")){
                    child.position.add(child.direction);
                    
                    if(Math.abs(child.target.position.x - child.position.x) <= 1.5){
                        explosionEffect(child.target, scene);
                    }
                }
            });
            
            water.material.uniforms['time'].value += 1.0 / 60.0;
            
			requestAnimationFrame(update);
		}
	}
	
	getModel(modelFilePath, side, name){
		return new Promise((resolve, reject) => {
			this.state.loader.load(
				modelFilePath,
				function(gltf){
					gltf.scene.traverse((child) => {
						if(child.type === "Mesh"){
			
							let material = child.material;
							let geometry = child.geometry;
							let obj = new THREE.Mesh(geometry, material);
							
							obj.scale.x = child.scale.x * 20;
							obj.scale.y = child.scale.y * 20;
							obj.scale.z = child.scale.z * 20;
							obj.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI / 2); // note this on object's local axis! so when you rotate, the axes change (i.e. x becomes z)
							//obj.rotateOnAxis(new THREE.Vector3(0,0,1), Math.PI / 2);
						
							obj.side = side; // player or enemy mesh?
							resolve(obj);
                            obj.name = name;
                            
                            if(name === 'player'){
                                // add select area to player mesh
                                const geometry = new THREE.CircleGeometry(17, 32);
                                const material = new THREE.MeshBasicMaterial({color: 0xffff00, opacity: 0.5, transparent: true, side: THREE.DoubleSide});
                                const circle = new THREE.Mesh(geometry, material);
                                circle.name = "selectArea";
                                circle.rotateX(Math.PI / 2);
                                
                                obj.isMoving = false;
                                obj.selectArea = circle; 
                                obj.selectAreaOn = false; // TODO: maybe we don't need this flag? can we just check the circle mesh's parent? e.g. scene if in scene, nothing if not in scene?
                                // get radius via: circle.geometry.parameters.radius
                            }
						}
					});
				},
				// called while loading is progressing
				function(xhr){
					console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
				},
				// called when loading has errors
				function(error){
					console.log( 'An error happened' );
					console.log(error);
				}
			);
		});
	}
	
	/****
		place unit in random location
		and add to either player's or enemy's list of units 

		leftBound and rightBound are parameters to determine the range of where to place unit
		
		@unitName = name of the unit i.e. battleship1
		@leftBound = column to start at
		@rightBound = column to end at 
		@topBound = top row boundary
		@bottomBound = bottom row boundary
		@stats = dictionary containing unit attributes to add to grid cell element
		the bound params are INCLUSIVE
	****/
	placeObject(object){
        const v = convert2dCoordsTo3d(this.state.renderer, this.orthoCamera, this.state.width, this.state.height);
        
        if(object.name === 'enemy'){
            object.position.set(v.x, -1.5, v.y);
        }else{
            object.position.set(v.x, 0, v.y);
        }
        
        const axesHelper = new THREE.AxesHelper(5);
        axesHelper.name = 'axeshelper';
        object.add(axesHelper);
	}

	// place obstacles randomly
	placeObstacles(obj){
        if(obj){
            const v = convert2dCoordsTo3d(this.state.renderer, this.orthoCamera, this.state.width, this.state.height);
            
            // TODO: rotate about Z randomly
            obj.scale.x *= 0.15;
            obj.scale.y *= 0.15;
            obj.scale.z *= 0.15;
            obj.position.set(v.x, 0, v.y);
            this.state.scene.add(obj);
		}
	}
    
    toggleLerpCamera(){
        this.lerpCamera = !this.lerpCamera;
        if(this.lerpCamera){
            this.setState({
                'camera': this.perspCamera,
                'perspCameraMode': true,
            });
        }else{
            this.setState({
                'camera': this.orthoCamera,
                'perspCameraMode': false,
            });
        }
    }
	/*
	addToDeck(card, deck, side){
		let copy = [...deck];
		copy.push(card);
		if(side === 'player'){
			this.setState({'playerDeck': copy});
		}else{
			this.setState({'enemyDeck': copy});
		}
	}*/
    
    toggleOrbitControls(){
        this.state.orbitControlsOn = !this.state.orbitControlsOn;
        if(this.state.orbitControlsOn){
            this.orbitControls.enabled = true;
        }else{
            this.orbitControls.enabled = false;
        }
    }
    
    toggleAirstrike(){
        this.state.airstrike = !this.state.airstrike;
        console.log("airstrike: " + this.state.airstrike);
    }
	
	/***
		
		functions to pass to child components
		
	***/
	updateConsole(msg){
		this.setState((state) => {
			let copy = [...state.consoleMsgs];
			copy.push(msg);
			return {'consoleMsgs': copy};
		});
	}
	
	clearEnemyUnits(){
		this.setState({
			'enemyUnits': {}
		});
	}
	
	clearPlayerUnits(){
		this.setState({
			'playerUnits': {}
		});
	}
	
	selectEnemyUnit(unitElement){
		this.setState({'currentEnemyUnit': unitElement});
	}
	
	selectPlayerUnit(unitElement){
		this.setState({'currentPlayerUnit': unitElement});
	}
	
	addToEnemyUnits(unitElement){
		this.setState((state) => {
			let copy = [...state.enemyUnits];
			copy.push(unitElement);
			return {'enemyUnits': copy};
		});
	}
	
	setPlayerMoves(newValue){
		this.setState({'playerMoves': newValue});
	}
	
	addToPlayerUnits(unitElement){
		this.setState((state) => {
			let copy = [...state.playerUnits];
			copy.push(unitElement);
			return {'playerUnits': copy};
		});
	}
	
	
	removeFromEnemyUnits(unitElement){
		this.setState((state) => {
			let copy = [...state.enemyUnits];
			copy.splice(copy.indexOf(unitElement), 1);
			return {'enemyUnits': copy};
		});
	}
	
	removeCardFromHand(cardName, side){
		let newState = {};
		let newArr = [];
		let hand;
		if(side === "player"){
			hand = "playerHand";
			
			// since this card has been used, decrement the player's number of moves 
			newState['playerMoves'] = this.state['playerMoves'] - 1;
		}else{
			hand = "enemyHand";
		}
		this.state[hand].forEach((card) => {
			if(card.name !== cardName){
				newArr.push(card);
			}
		});
		newState[hand] = newArr;
		this.setState(newState);
	}
	
	/***
	
		draw new cards (up to the given hand size)
		
	***/
	drawCards(){	
		let deck = this.state.playerDeck;
		
		if(deck.size() === 0){
			return;
		}
		
		// shuffle deck first?
		let max = this.state.handSize;
		if(deck.size() <= 2 && deck.size() >= 1){
			max = deck.length;
		}
		
		// if player already has some cards, the number of cards drawn can't exceed handSize!
		// also increment player's number of moves 
		let cardsDrawn = [...this.state.playerHand]; // making a copy 
		for(let i = 0; i < max; i++){
			cardsDrawn.push(deck.remove());
		}
		
		// should have console refresh and cards displayed should also update 
		this.setState((state) => { 
			let copy = [...state.consoleMsgs]; 
			copy.push("player drew " + cardsDrawn.length + " cards!");
			
			// subtract 1 because drawing cards itself costs a move 
			return {'consoleMsgs': copy, 'playerHand': cardsDrawn, 'playerMoves': this.state.playerMoves + cardsDrawn.length - 1}; 
		});
	}
	
	// end turn for player 
	// executing this function should have the enemy move 
	// need to also deactivate any buttons clickable for the player during the enemy's turn 
	endPlayerTurn(){
		this.setState({'playerTurn': false}); // this should cause clickable buttons to become unclickable?
		this.updateConsole('player ended turn!'); 
		
		// get the selected search method from dropdown 
		let selectedMethod = document.getElementById('searchMethod');
		this.enemyTurn(enemyMovement2, selectedMethod.options[ selectedMethod.selectedIndex ].value);
	}
	
	endEnemyTurn(){
		this.setState({'playerTurn': true});
	}
	
	// game console will rerender if dialogMsgs receives a new message
	// hand will rerender as cards get used up OR player requests to draw new cards 
	render(){
		const gameMethods = {
			'drawCards': this.drawCards ,
			'endPlayerTurn': this.endPlayerTurn,
			'endEnemyTurn': this.endEnemyTurn,
			'updateConsole': this.updateConsole,
			'selectEnemyUnit': this.selectEnemyUnit,
			'selectPlayerUnit': this.selectPlayerUnit,
			'removeFromEnemyUnits': this.removeFromEnemyUnits,
			'addToEnemyUnits': this.addToEnemyUnits,
			'addToPlayerUnits': this.addToPlayerUnits,
			'clearEnemyUnits': this.clearEnemyUnits,
			'clearPlayerUnits': this.clearPlayerUnits,
			'removeCardFromHand': this.removeCardFromHand,
			'setPlayerMoves': this.setPlayerMoves
		};
        
        const containerStyle = {
            'position': 'relative',
            'display': 'block',
            'margin': '0 auto',
            'width': this.state.width,
        };
        
        const controlsStyle = {
            'textAlign': 'center',
        };

		return(
			<div>
                <div id='controls' style={controlsStyle}>
                    <button onClick={this.toggleLerpCamera}> change camera </button>
                    <label>toggle orbit controls</label> <input type='checkbox' onChange={this.toggleOrbitControls} disabled={!this.state.perspCameraMode} />
                    <label>toggle airstrike</label> <input type='checkbox' onChange={this.toggleAirstrike} />
                </div>
                
				<br />
                
                <div id='container' style={containerStyle}></div>
                
                <br />
				
				<GameConsole 
					consoleMsgs={this.state.consoleMsgs}
				/>
				
				<br />
				
				<CurrentHand 
					gameState={this.state}
					gameMethods={gameMethods}
				/>
			</div>
		);
	}
	
	
}

export { Game };