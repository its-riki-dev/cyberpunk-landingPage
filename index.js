import './index.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import gsap from 'gsap';
// import LocomotiveScroll from 'locomotive-scroll';

// const locomotiveScroll = new LocomotiveScroll();

// scene
const scene = new THREE.Scene();


// camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4;


// renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;


// post processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0025;
composer.addPass(rgbShiftPass);


// hdri
let model;

const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    scene.environment = texture;


    // gltf loader - load model after HDRI is ready

    const loader = new GLTFLoader();
    loader.load(
        '/DamagedHelmet.gltf',
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error occurred:', error);
        }
    );
});


// mousemove
window.addEventListener("mousemove", (e) => {
    const rotationX = (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.16);
    const rotationY = (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.16);

    gsap.to(model.rotation, {
        x: rotationY,
        y: rotationX * 1,
        duration: 0.9,
        ease: "power2.out"
    });
    camera.lookAt(scene.position);
})


// handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    composer.setSize(window.innerWidth, window.innerHeight);
});


// render
function animate() {
    window.requestAnimationFrame(animate);
    composer.render();
}
animate();