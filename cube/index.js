import { cube } from './cube.js';

// x: right and left
// y: up and down
// z: forward and backward

scene.add( cube );
console.log(cube)
camera.position.y = 3;
camera.position.z = 5;

camera.lookAt(new THREE.Vector3(0, 0, 0));
// Reusable vector for world position
const worldPosition = new THREE.Vector3();

function animate() {
    // Rotate the cube
    cube.rotation.y += 0.04;

    // Update world matrix
    cube.updateMatrixWorld(true);

    // Loop through all the children and get their world positions
    cube.children.forEach((child, index) => {
        child.getWorldPosition(worldPosition);
        console.log(`World position of child ${index}:`, worldPosition);
    });

    // Render the scene
    renderer.render(scene, camera);
}