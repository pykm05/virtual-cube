import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

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
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 3;


// function animate() {

// 	cube.rotation.x += 0.01;
// 	cube.rotation.y += 0.01;

// 	renderer.render( scene, camera );
// }

// Device and browser compatibility check for WebGL 2
if ( WebGL.isWebGL2Available() ) {

	// Initiate function or other initializations here
	renderer.render(scene, camera);

} else {

	const warning = WebGL.getWebGL2ErrorMessage();
	console.log(warning);

}

document.addEventListener('keydown', (event) => {
	const keyName = event.key;
	const rotationSpeed = -0.5;
	switch (keyName) {
		case ';': 
			cubeRotate('y', -1);
			break;
		case 'a':
			cubeRotate('y', 1);
			break;
		case 'y':
			cubeRotate('x', 1);
			break;
		case 'b':
			cubeRotate('x', -1);
			break;
	}
});

const cubeRotate = (dimension, direction) => {

	let currRotate = 0;
	const maxRotate = Math.PI / 2;
	const rotationSpeed = 0.2 * direction;

	const timer = setInterval(() => {
		currRotate += rotationSpeed;
		cube.rotation[dimension] += rotationSpeed;
		renderer.render(scene, camera);
		if (Math.abs(currRotate) >= maxRotate) {
			clearInterval(timer);
		}
	}, 100);
}