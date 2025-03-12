window.scene = new THREE.Scene();
window.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

window.renderer = new THREE.WebGLRenderer();
window.renderer.setSize( window.innerWidth, window.innerHeight );
window.renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

function animate() {
    window.renderer.render(scene, camera);
}