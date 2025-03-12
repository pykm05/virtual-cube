const cube = new THREE.Group();

for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            const piece = new THREE.Mesh( geometry, material );
            piece.position.set(i, j, k)
            cube.add(piece);
        }
    }
}

export { cube };