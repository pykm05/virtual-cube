class Cube {

    // x: right and left
    // y: up and down
    // z: forward and backward

    pieces = new THREE.Group();
    notRotating = true;
    turnSpeed = Math.PI / 30;
    midRotation = false;

    constructor() {
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

    // Performs x, y, z rotations
    rotate(axis, direction, color = 0xff0000) {
        if (this.midRotation) return;

        this.midRotation = true;

        const step = Math.PI / 16;
        const targetRotation = Math.PI / 2;

        const rotationAxis = new THREE.Vector3(
            axis === 'x' ? direction : 0,
            axis === 'y' ? direction : 0,
            axis === 'z' ? direction : 0
        );
    
        this.pieces.children[0].material.color.set(color);
    
        let currentRotation = 0;
    
        const animateRotation = () => {
            currentRotation += step;
    
            if (Math.abs(currentRotation) >= Math.abs(targetRotation)) {
                this.pieces.rotateOnWorldAxis(rotationAxis, targetRotation - (currentRotation - step)); // fix over-rotation 
                renderer.render(scene, camera);
                console.log(this.pieces.children[0].getWorldPosition(new THREE.Vector3()));
                this.midRotation = false;
                return;
            }
    
            this.pieces.rotateOnWorldAxis(rotationAxis, step);
            renderer.render(scene, camera);
    
            requestAnimationFrame(animateRotation);
        };
    
        animateRotation();
    }
    

    // Performs L, R, U, D, F, B moves
    turn(face, direction) {
        let targetGroup = new THREE.Group();
        scene.add(targetGroup);

        // Translate move name into axis of rotation
        let axis;
        switch (face) {
            case 'U':
                axis = 'y';
                this.pieces.children.forEach((piece) => {
                    if (Math.round(piece.getWorldPosition(new THREE.Vector3())[axis]) === 1) {
                        piece.material.color.set(0xff0000)
                        targetGroup.add(piece)
                    }
                });

        }
        scene.add(targetGroup)
        renderer.render(scene, camera);
        renderer.render(scene, camera);



        // renderer.setAnimationLoop(() => {
        //     this.targetGroup.rotation[axis] += this.turnSpeed * direction;

        //     if (this.targetGroup.rotation[axis] >= targetRotation && direction == 1 ||
        //         this.targetGroup.rotation[axis] <= targetRotation && direction == -1
        //     ) {
        //         this.targetGroup.rotation[axis] = targetRotation; // Prevent over-rotation
        //         renderer.setAnimationLoop(null);
        //     }

        //     this.targetGroup.updateMatrixWorld(true);
        //     renderer.render(scene, camera);
        // });

        this.targetGroup.children.forEach(child => { console.log(child.getWorldPosition(new THREE.Vector3())) })

    }
}

export { Cube };