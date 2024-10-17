import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { Cube } from './cube.js';

// Neccesary for display: scene, camera, renderer
const scene = new THREE.Scene();

// Camera display settings
// params: FOV(field of wiew, angle of view), aspect ratio(think old TVs), near and far clipping plane
// adjusts angle of view
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );

// adjusts window size of the scene
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight );
// renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// scene.add( cube );

// x: left & right
// y: up & down
// z: forward & back 
camera.position.set(0, 3, 4); 
camera.lookAt(0, 1, 0);

// Device and browser compatibility check for WebGL 2
if ( WebGL.isWebGL2Available() ) {
	// Initiate function or other initializations here
	renderer.render(scene, camera);
} else {
	const warning = WebGL.getWebGL2ErrorMessage();
	console.log(warning);
}

const myCube = new Cube();

// listen for keyboard input and make turns
for (const piece of myCube.pieces) {
	scene.add(piece);
}

for (const group of myCube.groups) {
	scene.add(group);
}
renderer.render(scene, camera);

document.addEventListener('keydown', (event) => {
	const keyName = event.key;

	switch (keyName) {
		case ';': 
			cubeRotate('y', 1);
			break;
		case 'a':
			cubeRotate('y', -1);
			break;
		case 'y':
			cubeRotate('x', -1);
			break;
		case 'b':
			cubeRotate('x', 1);
			break;
		case 'h':
			turn('F', 1);
			break;
	}
		
});

// const turn = (dimension, direction) => {
// 	// rotate 90*
// 	let currRotate = 0;
// 	const maxRotate = Math.PI / 2;
// 	const rotationSpeed = Math.PI / 8 * direction;
// 	let currLayer = myCube.U_Layer;
// 	let val = 1;
// 	if (dimension == 'F') {
// 		currLayer = myCube.F_Layer;
// 	} 
// 	else if (dimension == 'y') {
// 		currLayer = myCube.U_Layer;
// 		val = 0;
// 	}
// 	for (const piece of myCube.pieces) {
// 		if (piece.position[dimension] == val) {
// 			currLayer.add(piece);
// 			console.log('hi');
// 		}
// 	}
// 	console.log(myCube.F_Layer.children);
	

// 	if (dimension == 'z') {
// 		myCube.F_Layer.children.forEach(child => {
// 				child.material.color.set(0x3330ff);
			
// 		});
		
// 	}
// 	// animate cube rotation
// 	const timer = setInterval(() => {
// 		currRotate += rotationSpeed;
// 		currLayer.rotation[dimension] += rotationSpeed;
// 		renderer.render(scene, camera);
// 		if (Math.abs(currRotate) >= maxRotate) {
// 			clearInterval(timer);
// 		}
// 	}, 50);

// 	renderer.render(scene, camera);
// } 

const cubeRotate = (dimension, direction) => {
	// rotate 90*
	let currRotate = 0;
	const maxRotate = Math.PI / 2;
	const rotationSpeed = Math.PI / 8 * direction;

	for (const piece of myCube.pieces) {
		myCube.Full_Cube.add(piece);
	}

	// animate cube rotation
	const timer = setInterval(() => {
		currRotate += rotationSpeed;
		myCube.Full_Cube.rotation[dimension] += rotationSpeed;
		renderer.render(scene, camera);
		if (Math.abs(currRotate) >= maxRotate) {
			clearInterval(timer);
		}
	}, 50);

	renderer.render(scene, camera);
} 