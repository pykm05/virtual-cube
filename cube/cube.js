// Variables and shared objects

function Cube() {
    let allPieces = [];
    let activeGroup = [];
    let notRotating = true;
    let turnSpeed = Math.PI / 20;
    let special;
    let pivot = new THREE.Object3D();
    let axis = 'y';
    let moveDirection = 1;
    function nearlyEqual(a, b, d) {
        d = d || 0.001;
        return Math.abs(a - b) <= d;
    }

    // Function to initialize the cube
    function initCube() {
        render();
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                    const piece = new THREE.Mesh(geometry, material);

                    if (i == 1 && j == 1 && k == 1) {
                        special = piece;
                        piece.material.color.set(0xff0000);
                    }
                    piece.position.set(i, j, k);
                    piece.rubikPosition = piece.position.clone();
                    allPieces.push(piece);
                    scene.add(piece);
                }
            }
        }
    }

    // Function to render the scene
    function render() {
        if (!notRotating) {
            doMove();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    // Function to perform the turn (L, R, U, D, F, B)
    function turn(newAxis, newMoveDirection) {
        if (notRotating) {
            moveDirection = newMoveDirection;
            axis = newAxis;
            console.log('cube now turning');
            activeGroup = [];
            pivot.rotation.set(0, 0, 0);
            pivot.updateMatrixWorld();
            scene.add(pivot);
            notRotating = false;

            allPieces.forEach((piece) => {
                if (nearlyEqual(piece.position[axis], 1)) {
                    activeGroup.push(piece);
                }
            });

            activeGroup.forEach((piece) => {
                pivot.add(piece);
            });

            console.log(activeGroup);
        } else {
            console.log('there is already a turn trying to turn');
        }
    }

    // Function to perform the move/rotation logic
    function doMove() {
        if (pivot.rotation[axis] >= Math.PI / 2) {
            pivot.rotation[axis] = Math.PI / 2;
            moveComplete();
        } else if (pivot.rotation[axis] <= Math.PI / -2) {
            pivot.rotation[axis] = Math.PI / -2;
            moveComplete();
        } else {
            pivot.rotation[axis] += (moveDirection * turnSpeed);
        }
    }

    // Function to finalize the move and reset states
    function moveComplete() {
        notRotating = true;
        console.log('Rotation complete');
        pivot.updateMatrixWorld();
        scene.remove(pivot);

        activeGroup.forEach((piece) => {
            piece.updateMatrixWorld();
            piece.rubikPosition = piece.position.clone();
            const worldPosition = piece.getWorldPosition(new THREE.Vector3());

            pivot.remove(piece);
            scene.add(piece);
            piece.position.copy(worldPosition);
            piece.updateMatrixWorld(true);
        });

        console.log(special.getWorldPosition(new THREE.Vector3()));
    }

    // Call initCube to initialize and start rendering
    initCube();

    return {
        turn
    }
}



export { Cube };
