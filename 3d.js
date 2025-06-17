import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 380;

const scene = new THREE.Scene();
let raspberry;
const loader = new GLTFLoader();

loader.load('./raspberry2.glb',
    function (gltf) {
        raspberry = gltf.scene;
        raspberry.position.z = 0.4;
        if (window.innerWidth <= 567) {
            raspberry.position.y = 50;
        } else {
            raspberry.position.y = 40;
            raspberry.scale.set(1, 0.15, 1);
        }
        scene.add(raspberry);
        modelMove();
    },
    function (xhr) { },
    function (error) { console.error(error); }
);

const renderer = new THREE.WebGLRenderer({
    alpha: true
});

if (window.innerWidth <= 567) {
    document.getElementById('container3D').style.position = 'fixed'
    renderer.setSize(window.innerWidth, window.innerHeight);
} else {
    const bodyHeight = document.body.clientHeight;
    renderer.setSize(window.innerWidth, bodyHeight);
}
document.getElementById('container3D').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, .7);
scene.add(ambientLight);
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if (raspberry) {
        raspberry.rotation.y += 0.01;
        const scale = 1 + Math.abs(Math.sin(Date.now() * 0.0015)) * 0.1;
        if (window.innerWidth <= 567) {
            raspberry.scale.set(scale, scale, scale);
        } else {
            raspberry.scale.set(scale, 0.15 * scale, scale);
        }
        raspberry.position.y += Math.sin(Date.now() * 0.001) * 0.005;
    }
};
reRender3D();

function getXByScreenPercent(percent) {
    const px = window.innerWidth * (percent / 100);
    const screenToWorldRatio = 0.001;
    return (px - window.innerWidth / 2) * screenToWorldRatio;
}

let arrPositionModel = [
    {
        id: 'home',
        position: { x: getXByScreenPercent(2800), y: 34, z: -100 },
        rotation: { x: 0.1, y: 1.5, z: 0 }
    },
    {
        id: 'benefits',
        position: { x: getXByScreenPercent(200), y: 29, z: -200 },
        rotation: { x: 0.15, y: 0, z: 0 }
    },
    {
        id: 'nutrition',
        position: { x: getXByScreenPercent(-4000), y: 8.4, z: -350 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 'recipes',
        position: { x: getXByScreenPercent(-7500), y: -25.5, z: -300 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 'contact',
        position: { x: getXByScreenPercent(4500), y: -48, z: -600 },
        rotation: { x: 0, y: 0, z: 0 }
    },
];

let arrPositionModelPhone = [
    {
        id: 'home',
        position: { x: getXByScreenPercent(0), y: -50, z: -100 },
        rotation: { x: 0.1, y: 1.5, z: 0 }
    },
    {
        id: 'benefits',
        position: { x: getXByScreenPercent(7500), y: 0, z: -200 },
        rotation: { x: 0.15, y: 0, z: 0 }
    },
    {
        id: 'nutrition',
        position: { x: getXByScreenPercent(500), y: 21.2, z: -350 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 'recipes',
        position: { x: getXByScreenPercent(-7500), y: 0, z: -300 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 'contact',
        position: { x: getXByScreenPercent(9000), y: -44.3, z: -350 },
        rotation: { x: 0, y: 0, z: 0 }
    },
];

let lastSection = null;
const modelMove = () => {
    const sections = document.querySelectorAll('section');
    let currentSection;
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id;
        }
    });

    if (currentSection && currentSection !== lastSection) {
        lastSection = currentSection;
        let new_coordinates;
        if (window.innerWidth <= 567) {
            new_coordinates = arrPositionModelPhone.find(val => val.id === currentSection);
        } else {
            new_coordinates = arrPositionModel.find(val => val.id === currentSection);
        }
        if (new_coordinates) {
            gsap.to(raspberry.position, {
                x: new_coordinates.position.x,
                y: new_coordinates.position.y,
                z: new_coordinates.position.z,
                duration: 3,
                ease: "power1.out"
            });
            gsap.to(raspberry.rotation, {
                x: new_coordinates.rotation.x,
                y: new_coordinates.rotation.y,
                z: new_coordinates.rotation.z,
                duration: 3,
                ease: "power1.out"
            });
        }
    }
};

if (window.innerWidth <= 567) {
    camera.position.z = 600;
    camera.fov = 10.1;
    camera.updateProjectionMatrix();
}

window.addEventListener('scroll', () => {
    if (raspberry) {
        modelMove();
    }
});

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});