import { Cube } from './cube.js';

let cube = new Cube();

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
            cube.turn('y', -1);
            break;
        case 'f': // U'
            cube.turn('y', 1);
            break;
        case 'i': // R
            cube.turn('x', -1);
            break;
        case 'k': // R'
            cube.turn('x', 1);
            break;
        default:
            // z moves???
            break;
    }
});

// moveQueue = [];

renderer.render(scene, camera);