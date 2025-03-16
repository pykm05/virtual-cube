class Cube {

    // x: right and left
    // y: up and down
    // z: forward and backward

    pieces = [];
    notRotating = true;
    turnSpeed = Math.PI / 30;
    targetGroup = new THREE.Group();

    constructor() {
        scene.add(this.targetGroup);

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                    const piece = new THREE.Mesh(geometry, material);

                    piece.position.set(i, j, k)
                    this.pieces.push(piece);
                }
            }
        }
    }

    // perform x, y, and z moves
    rotate(axis, direction) {
        this.targetGroup.remove(...this.targetGroup.children);
        this.pieces.forEach((piece) => { this.targetGroup.add(piece) });

        const targetRotation = this.targetGroup.rotation[axis] + Math.PI / 2 * direction;

        renderer.setAnimationLoop(() => {
            this.targetGroup.rotation[axis] += this.turnSpeed * direction;

            if (this.targetGroup.rotation[axis] >= targetRotation && direction == 1 ||
                this.targetGroup.rotation[axis] <= targetRotation && direction == -1
            ) {
                this.targetGroup.rotation[axis] = targetRotation; // Prevent over-rotation
                renderer.setAnimationLoop(null);
            }

            this.targetGroup.updateMatrixWorld(true);
            renderer.render(scene, camera);
        });
    }
}

export { Cube };