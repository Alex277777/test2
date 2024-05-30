import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


class Sketch {
    constructor() {
        this.body = document.querySelector('body');
        this.doorScale = {
            high:1,
            with: 1,
        }

        this.loader = new THREE.TextureLoader()
        this.createScene();
        this.createCamera();
        this.createMesh();
        this.downloadModel();
        this.initRenderer();
        this.createLight()
        this.initCameraControls();
        this.initInviroment();
        this.addGUI()
        this.render();        
    }

  get viewport() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    return { width, height, aspectRatio };
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createCamera() {
    const perspective = 5;
    const fov = 45;
    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.aspectRatio, 1, 1000)
    this.camera.position.set(0, 3, perspective);
  }

  initCameraControls(){
    const controls =new  OrbitControls( this.camera, this.renderer.domElement );
    controls.target.set( 0, 0.5, 0 );
    controls.update();
  }

  addGUI(){
    const gui = new GUI()
    gui.addFolder('Дверь')
    gui.add(this.doorScale, "with").min(0.1).max(1).listen().onChange((val)=>{
      this.door.scale.set(0.1 * this.doorScale.with, 0.1  * this.doorScale.high, 0.1)
            this.door.position.y = - 0.39 + this.doorScale.high/2
        })
    gui.add(this.doorScale, "high").min(0).max(1).listen().onChange((val)=>{
        this.door.scale.set(0.1 * this.doorScale.with, 0.1  * this.doorScale.high, 0.1)
        this.door.position.y = - 0.39 + this.doorScale.high/2
    })
    gui.open();
  }

  initInviroment(){
    const environmentMap = new RGBELoader().load('textures/venice_sunset_1k.hdr', () => {
        environmentMap.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = environmentMap;
        this.scene.environment = environmentMap;
    }); 
  }

  createLight(){
    const dirLight = new THREE.DirectionalLight( 0xffffff, 2 );
    dirLight.position.set( - 3, 10, 14);
    dirLight.castShadow = true;
    this.scene.add( dirLight );
  }

  async createMesh() {
    const geometry = new THREE.PlaneGeometry( 3, 3, 3 );
    const [map, normalMap, roughnessMap] = await Promise.all([
        this.loader.load('textures/tiles/tiles_0116_color_1k.jpg'),
        this.loader.load('textures/tiles/tiles_0116_normal_opengl_1k.png'),
        this.loader.load('textures/tiles/tiles_0116_roughness_1k.jpg'), 
    ]);
    const material = new THREE.MeshStandardMaterial({ 
        map,
        normalMap,
        roughnessMap,        
     });
    material.side = THREE.DoubleSide;
    const plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = - 0.39;
    plane.receiveShadow = true;
    this.scene.add(plane);
  }

  downloadModel(){
    const loader = new GLTFLoader();
    loader.load(`models/door/scene.gltf`, (gltf) => {
        const model = gltf.scene;
        this.door = gltf.scene
    model.traverse(( object )=> {
            if ( object.isMesh ) object.castShadow = true;
        });
        this.door.scale.set(0.1 ,0.1 ,0.1)
        this.scene.add(this.door);
    });
  }

  onWindowResize() {
    this.camera.aspect = this.viewport.aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  initRenderer() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.body.appendChild(this.renderer.domElement);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch()