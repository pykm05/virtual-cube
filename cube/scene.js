window.scene = new THREE.Scene();
window.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.y = 3;
camera.position.z = 5;
camera.lookAt(new THREE.Vector3(0, 0, 0));

window.renderer = new THREE.WebGLRenderer();
window.renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );