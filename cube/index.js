import { Cube } from './cube.js';

let cube = new Cube();

let piecesAsGroup = new THREE.Group();

cube.pieces.forEach((piece) => {
    piecesAsGroup.add(piece)
})

scene.add(piecesAsGroup);

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'a': // y
            cube.rotate("y", 1);
            break;
        case ';': // y'
            cube.rotate("y", -1);
            break;
        case 'y': // x
            cube.rotate("x", 1);
            break;
        case 'b': // x'
            cube.rotate("x", -1);
            break;
        default:
            // z moves???
            break;
    }
});

// moveQueue = [];

// turn(key) {

// }

// manageQueue() {

// }

renderer.render(scene, camera);