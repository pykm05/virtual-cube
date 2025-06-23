import * as THREE from 'three';

function Scene(container: HTMLElement | null) {
    if (!container) throw new Error('Scene container is not available');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.y = 3;
    camera.position.z = 5;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x000000);
    container.appendChild(renderer.domElement);

    function resizeRenderer() {
        if (!container) return;

        const width = container.offsetWidth;
        const height = container.offsetHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', resizeRenderer);
    renderer.render(scene, camera);

    return { scene, renderer, camera };
}

export default Scene;
