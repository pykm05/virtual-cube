class Cube {

    // x: right and left
    // y: up and down
    // z: forward and backward

    allPieces = [];
    activeGroup = [];
    notRotating = true;
    turnSpeed = Math.PI / 60;
    midRotation = false;
    special;

    constructor() {
        this.render();
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {

                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                    const piece = new THREE.Mesh(geometry, material);

                    if (i == 1 && j == 1 && k ==1) {
                        this.special = piece;
                        piece.material.color.set(0xff0000)}
                    piece.position.set(i, j, k)
                    piece.rubikPosition = piece.position.clone();
                    this.allPieces.push(piece);
                }
            }
        }
    }

    // Performs x, y, z rotations
    // rotate(axis, direction) {
    //     if (this.midRotation) return;

    //     this.midRotation = true;

    //     const step = Math.PI / 16;
    //     const targetRotation = Math.PI / 2;

    //     const rotationAxis = new THREE.Vector3(
    //         axis === 'x' ? direction : 0,
    //         axis === 'y' ? direction : 0,
    //         axis === 'z' ? direction : 0
    //     );

    //     let currentRotation = 0;
    //     let targetgroup = new THREE.Group();
    //     this.allPieces.forEach((piece) => {
    //         targetgroup.add(piece);
    //     })

    //     const animateRotation = () => {
    //         currentRotation += step;

            

    //         if (Math.abs(currentRotation) >= Math.abs(targetRotation)) {
    //             targetgroup.rotateOnWorldAxis(rotationAxis, targetRotation - (currentRotation - step)); // fix over-rotation 
    //             renderer.render(scene, camera);
    //             this.midRotation = false;
    //             return;
    //         }

    //         targetgroup.rotateOnWorldAxis(rotationAxis, step);
    //         renderer.render(scene, camera);

    //         requestAnimationFrame(animateRotation);
    //     };

    //     animateRotation();
    // }

    // Performs L, R, U, D, F, B moves
    nearlyEqual(a, b, d) {
        d = d || 0.001;
        return Math.abs(a - b) <= d;
    }

    render() {

        //States
        //TODO: generalise to something like "activeState.tick()" - see comments 
        // on encapsulation above
        if(!this.notRotating) {
          this.doMove();
        } 
    
        renderer.render(scene, camera);
        requestAnimationFrame(this.render.bind(this));
      }

    pivot = new THREE.Object3D();
    axis = 'y'
    moveDirection = 1
    turn(axis) {

        if (this.notRotating) {
            this.axis = axis;
            console.log('cube now turning')
            this.activeGroup = []
            this.pivot.rotation.set(0, 0, 0);
            this.pivot.updateMatrixWorld();
            scene.add(this.pivot);
            this.notRotating = false;

            this.allPieces.forEach((piece) => { // What is rubikpsoititon? Line 352
                if (this.nearlyEqual(piece.position[this.axis], 1)) {
                    this.activeGroup.push(piece)
                    piece.material.color.set(0xff0550)
                    renderer.render(scene, camera)
                }
            })

            this.activeGroup.forEach((piece) => {
                this.pivot.add(piece);
            })

            console.log(this.activeGroup)
            // this.activeGroup.forEach((e) => {
            //     console.log(e.rubikPosition)
            // })

            // this.render();
        } else {
            console.log('there is alreay a turn trying to turn')
        }
    }

    

    doMove() {
        // Check for the current this.pivot rotation and stop at 90 degrees (PI/2) or -90 degrees (-PI/2)
        // Move a quarter turn then stop
        if (this.pivot.rotation[this.axis] >= Math.PI / 2) {
            // Compensate for overshoot
            this.pivot.rotation[this.axis] = Math.PI / 2;
            this.moveComplete(); // Ensure moveComplete is called when the rotation reaches 90 degrees
        } else if (this.pivot.rotation[this.axis] <= Math.PI / -2) {
            this.pivot.rotation[this.axis] = Math.PI / -2;
            this.moveComplete(); // Ensure moveComplete is called when the rotation reaches -90 degrees
        } else {
            this.pivot.rotation[this.axis] += (this.moveDirection * this.turnSpeed);
        }
    
    };

    moveComplete() {
        this.notRotating = true;
        console.log('Rotation complete');
        this.pivot.updateMatrixWorld();
        scene.remove(this.pivot);
    
        this.activeGroup.forEach((piece) => {
            piece.updateMatrixWorld();
    
            piece.rubikPosition = piece.position.clone();
            const worldPosition = piece.getWorldPosition(new THREE.Vector3());
            
            this.pivot.remove(piece);
            scene.add(piece)
            piece.position.copy(worldPosition);
            piece.updateMatrixWorld(true);
            piece.material.color.set(0x00ff00)
            
        });

        console.log(this.special.getWorldPosition(new THREE.Vector3()));
        
    };
}

export { Cube };