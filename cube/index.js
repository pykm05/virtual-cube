import { Cube } from './cube.js';

let cube = new Cube();

let pieces = new THREE.Group();

cube.allPieces.forEach((e) => {
    pieces.add(e)
})

scene.add(pieces);

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'a': // y
            cube.rotate('y', 1);
            break;
        case ';': // y'
            cube.rotate('y', -1);
            break;
        case 'y': // x
            cube.rotate('x', -1);
            break;
        case 'b': // x'
            cube.rotate('x', 1);
            break;
        case 'j': // U
            cube.turn('y');
            break;
        case 'k': // U
            cube.turn('x');
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