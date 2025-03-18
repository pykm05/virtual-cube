import { Cube } from './cube.js';

let cube = new Cube();

scene.add(cube.pieces);

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
            cube.turn('U', 1);
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