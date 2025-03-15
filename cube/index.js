import { Cube } from './cube.js';

let cube = new Cube();

scene.add(cube.pieces);

window.addEventListener('keydown', (e) => {
    if (cube.notRotating) {
        cube.rotate(e.key);
    }
});

renderer.render(scene, camera);