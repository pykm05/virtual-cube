class Cube {

    // x: right and left
    // y: up and down
    // z: forward and backward

    pieces;
    notRotating;

    constructor() {
        this.pieces = new THREE.Group();
        this.notRotating = true

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                    const piece = new THREE.Mesh(geometry, material);

                    piece.position.set(i, j, k)
                    this.pieces.add(piece);
                }
            }
        }
    }

    rotate(key) {
        let factor = 1;
        let targetRotation = this.pieces.rotation.y + Math.PI / 2;
        let turnSpeed = Math.PI / 30;

        if (key == ';') factor = -1;
        else factor = 1;
        targetRotation = this.pieces.rotation.y + Math.PI / 2 * factor;
        this.notRotating = false;

        renderer.setAnimationLoop(() => {
            this.pieces.rotation.y += turnSpeed * factor;

            if (this.pieces.rotation.y >= targetRotation && factor == 1 ||
                this.pieces.rotation.y <= targetRotation && factor == -1
            ) {
                this.pieces.rotation.y = targetRotation; // Prevent over-rotation
                renderer.setAnimationLoop(null);
                this.notRotating = true;
            }

            this.pieces.updateMatrixWorld(true);
            renderer.render(scene, camera);
        });
    }
}

export { Cube };