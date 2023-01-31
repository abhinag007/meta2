
import * as THREE from './libs/three/three.module.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from './libs/three/jsm/DRACOLoader.js';
import { RGBELoader } from './libs/three/jsm/RGBELoader.js';
import { Stats } from './libs/stats.module.js';
import { LoadingBar } from './libs/LoadingBar.js';
// import * as SkeletonUtils from '../../three/examples/js/utils/SkeletonUtils.js';
// import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js";
import { VRButton } from './libs/VRButton.js';
import { CanvasUI } from './libs/CanvasUI.js';
// import { JoyStick } from '../../libs/Toon3D.js';
import { XRControllerModelFactory } from './libs/three/jsm/XRControllerModelFactory.js';
const mixers = [];
var model, camera;
let mixer1,mixer2,mixer3, activeAction, actions;
let check1= false;
let check2= true;
let e;




class App{


	constructor(){
        actions = {};
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
		this.scene = new THREE.Scene();

		this.assetsPath = 'Main/assets/';
        
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 500 );
		camera.position.set( 0, 1.6, 6 );


        const loader1 = new GLTFLoader();
        const self = this;

        loader1.load( 'RobotExpressive.glb', function ( gltf ) {

            model = gltf.scene;
             let fileAnimations = gltf.animations;
             camera.add(model);

             model.position.set(0, -1, -2);
             model.rotation.set(0, 3.115, 0);
             model.scale.set(0.3, 0.3, 0.3);




            model.traverse(o => {
                if (o.isMesh) {
                  o.castShadow = true;
                  o.receiveShadow = true;
                }
              });

            mixer1 = new THREE.AnimationMixer( model );
            mixer2 = new THREE.AnimationMixer( model );
            mixer3 = new THREE.AnimationMixer( model );

            // animationChange(2);
            mixer1.clipAction( gltf.animations[ 2 ] ).play(); // Idle
            mixer2.clipAction( gltf.animations[ 6 ] ).play();
            mixer3.clipAction( gltf.animations[ 12 ] ).play();


            // mixer1.clipAction( gltf.animations[ 2 ] ).play(); // Idle

            // actions[0] = mixer1.clipAction( gltf.animations[ 2 ] ).play();
            // console.log("1st");
            // actions['0'].play();
             // Idle

                        // actions[0] = mixer1.clipAction( gltf.animations[ 2 ] );
            // actions[1] = mixer1.clipAction( gltf.animations[ 6 ] );
            

            model.position.x = 0;
            // self.scene.add( model );
            // mixers.push( mixer1);
            // mixers.push(actions);


        }, undefined, function ( e ) {

            console.error( e );

        } );
       
        
        this.dolly = new THREE.Object3D();
        this.dolly.position.set(0, 0, 10);
        this.dolly.add( camera );
        this.dummyCam = new THREE.Object3D();
        // this.dummyCam.add( this.model );
        camera.add( this.dummyCam );


        this.scene.add( this.dolly );

        
		const ambient = new THREE.HemisphereLight(0xFFFFFF, 0xAAAAAA, 0.8);
		this.scene.add(ambient);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild( this.renderer.domElement );
        this.setEnvironment();
	
        window.addEventListener( 'resize', this.resize.bind(this) );


        
        this.clock = new THREE.Clock();
        this.up = new THREE.Vector3(0,1,0);
        this.origin = new THREE.Vector3();
        this.workingVec3 = new THREE.Vector3();
        this.workingQuaternion = new THREE.Quaternion();
        this.raycaster = new THREE.Raycaster();
        
        this.stats = new Stats();
		container.appendChild( this.stats.dom );
        
		this.loadingBar = new LoadingBar();
		
		this.loadCollege();
        
        
        fetch('college.json')
            .then(response => response.json())
            .then(obj =>{
                self.boardShown = '';
                self.boardData = obj;
            });

            // this.renderer.render(this.scene, camera);

	}

    animationChange(number){
        mixer1.clipAction( gltf.animations[ number ] ).play(); // Idle
        mixers.push(actions);
    }
    
    
	
    setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( './assets/hdr/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( 'An error occurred setting the environment');
        } );
    }
    
    resize(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	loadCollege(){

        const self = this;
        
		const loader = new GLTFLoader( ).setPath(this.assetsPath);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( './libs/three/js/draco/' );
        loader.setDRACOLoader( dracoLoader );
        
		// Load a glTF resource
		loader.load(
			// resource URL
			'../../college.glb',
			// called when the resource is loaded
			function ( gltf ) {

                const college = gltf.scene.children[0];
				self.scene.add( college );
				
				college.traverse(function (child) {
    				if (child.isMesh){
						if (child.name.indexOf("PROXY")!=-1){
							child.material.visible = false;
							self.proxy = child;
						}else if (child.material.name.indexOf('Glass')!=-1){
                            child.material.opacity = 0.1;
                            child.material.transparent = true;
                        }else if (child.material.name.indexOf("SkyBox")!=-1){
                            const mat1 = child.material;
                            const mat2 = new THREE.MeshBasicMaterial({map: mat1.map});
                            child.material = mat2;
                            mat1.dispose();
                        }
					}
				});
                       
                const door1 = college.getObjectByName("LobbyShop_Door__1_");
                const door2 = college.getObjectByName("LobbyShop_Door__2_");
                const pos = door1.position.clone().sub(door2.position).multiplyScalar(0.5).add(door2.position);
                const obj = new THREE.Object3D();
                obj.name = "LobbyShop";
                obj.position.copy(pos);
                college.add( obj );
                
                self.loadingBar.visible = false;
			
                self.setupXR();
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );

			}
		);
	}
    
    setupXR(){
        this.renderer.xr.enabled = true;

        const self = this;
   
        function onSelectStart( event ) {

            this.userData.selectPressed = true;

        }

        function onSelectEnd( event ) {

            this.userData.selectPressed = false;

        }

        function onSqueezeStart( event ){
            this.userData.squeezePressed = true;
        }

        function onSqueezeEnd( event ){
            this.userData.squeezePressed = false;
        }

        self.controllers = self.buildControllers( self.dolly );

        self.controllers.forEach( ( controller ) =>{
            controller.addEventListener( 'selectstart', onSelectStart );
            controller.addEventListener( 'selectend', onSelectEnd );
            controller.addEventListener( 'squeezestart', onSqueezeStart );
            controller.addEventListener( 'squeezeend', onSqueezeEnd );
        });          
        
        const btn = new VRButton( this.renderer );
        
        const config = {
            panelSize: { height: 0.5 },
            height: 256,
            name: { fontSize: 50, height: 70 },
            info: { position:{ top: 70, backgroundColor: "#ccc", fontColor:"#000" } }
        }
        const content = {
            name: "name",
            info: "info"
        }
        
        this.ui = new CanvasUI( content, config );
        this.scene.add( this.ui.mesh );
        
        this.renderer.setAnimationLoop( this.render.bind(this) );
    }
    
    buildControllers( parent = this.scene ){
        const controllerModelFactory = new XRControllerModelFactory();

        const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -1 ) ] );

        const line = new THREE.Line( geometry );
        line.scale.z = 0;
        
        const controllers = [];
        
        for(let i=0; i<=1; i++){
            const controller = this.renderer.xr.getController( i );
            controller.add( line.clone() );
            controller.userData.selectPressed = false;
            controller.userData.squeezePressed = false;
            parent.add( controller );
            controllers.push( controller );
            
            const grip = this.renderer.xr.getControllerGrip( i );
            grip.add( controllerModelFactory.createControllerModel( grip ) );
            parent.add( grip );
        }
        
        return controllers;
    }

    // handleController( controller ){
    //     if (controller.userData.squeezePressed ){
    //         mixer3.update();
    //     }
    // }

    moveDolly(dt){
        if (this.proxy === undefined) return;
        
        const wallLimit = 2.4;
        const speed = 2;
		let pos = this.dolly.position.clone();

        pos.y += 1;

		let dir = new THREE.Vector3();
        
        //Store original dolly rotation
        const quaternion = this.dolly.quaternion.clone();
        //Get rotation for movement from the headset pose
        this.dolly.quaternion.copy( this.dummyCam.getWorldQuaternion() );
        
        this.dolly.getWorldDirection(dir);

        dir.negate();
        
  		this.raycaster.set(pos, dir);

		
        let blocked = false;
		
		let intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length>0){
            if (intersect[0].distance < wallLimit) blocked = true;
        }
		
        check1 = true;

		if (!blocked){
            this.dolly.translateZ(-dt*speed);
            pos = this.dolly.getWorldPosition( this.origin );
            // check1 = true;
            // if(check1==true){
            // mixers.push( mixer2);
            // check1 = false;
            // }
            // model.translateZ(dt*speed);
            // mixer3.update(dt);
            // mixer3.update(dt);
            
		} 

        mixer2.update(dt);
 
 
    //     check1 = false;
    //     check2 = true;
    // if(check1==check2){
        // mixers.push( mixer1);

    // }
        //cast left
        dir.set(-1,0,0);
        dir.applyMatrix4(this.dolly.matrix);
        dir.normalize();
        this.raycaster.set(pos, dir);

        intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length>0){
            if (intersect[0].distance<wallLimit) {
                this.dolly.translateX(wallLimit-intersect[0].distance);
                // model.rotation.set(0,-this.dolly.rotation.y,0);

                // model.translateX(dt*-1);
            }
        }

        //cast right
        dir.set(1,0,0);
        dir.applyMatrix4(this.dolly.matrix);
        dir.normalize();
        this.raycaster.set(pos, dir);

        intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length>0){
            if (intersect[0].distance<wallLimit){
                 this.dolly.translateX(intersect[0].distance-wallLimit);

                //  model.translateX(dt);

                }
        }

        //cast down
        dir.set(0,-1,0);
        pos.y += 1.5;
        this.raycaster.set(pos, dir);
        
        intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length>0){
            this.dolly.position.copy( intersect[0].point );


            // model.translateZ(intersect[0].point);

        }

        //Restore the original rotation
        if (this.joystick === undefined) this.dolly.quaternion.copy( quaternion );
	}

    moveDolly2(dt){
        if (this.proxy === undefined) return;
        
        const wallLimit = 2.4;
        const speed = 2;
		let pos = this.dolly.position.clone();

        pos.y += 1;

        model.rotation.set(0, 6.315, 0);

		let dir = new THREE.Vector3();
        
        //Store original dolly rotation
        const quaternion = this.dolly.quaternion.clone();
        //Get rotation for movement from the headset pose
        this.dolly.quaternion.copy( this.dummyCam.getWorldQuaternion() );
        
        this.dolly.getWorldDirection(dir);

        dir.negate();
        
  		this.raycaster.set(pos, dir);

		
        let blocked = false;
		
		let intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length>0){
            if (intersect[0].distance < wallLimit) blocked = true;
        }
		
        check1 = true;

		if (!blocked){
            // this.dolly.translateZ(-dt*speed);
            pos = this.dolly.getWorldPosition( this.origin );
            // check1 = true;
            // if(check1==true){
            // mixers.push( mixer2);
            // check1 = false;
            // }
            // model.translateZ(dt*speed);
            // mixer3.update(dt);
            // mixer3.update(dt);
            
		} 

        mixer3.update(dt);
 
 
        //cast left
        dir.set(-1,0,0);
        dir.applyMatrix4(this.dolly.matrix);
        dir.normalize();
        this.raycaster.set(pos, dir);

        intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length>0){
            if (intersect[0].distance<wallLimit) {
                // this.dolly.translateX(wallLimit-intersect[0].distance);
                // model.rotation.set(0,-this.dolly.rotation.y,0);

                // model.translateX(dt*-1);
            }
        }

        //cast right
        dir.set(1,0,0);
        dir.applyMatrix4(this.dolly.matrix);
        dir.normalize();
        this.raycaster.set(pos, dir);

        intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length>0){
            if (intersect[0].distance<wallLimit){
                //  this.dolly.translateX(intersect[0].distance-wallLimit);

                //  model.translateX(dt);

                }
        }

        //cast down
        dir.set(0,-1,0);
        pos.y += 1.5;
        this.raycaster.set(pos, dir);
        
        intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length>0){
            this.dolly.position.copy( intersect[0].point );


            // model.translateZ(intersect[0].point);

        }

        //Restore the original rotation
        if (this.joystick === undefined) this.dolly.quaternion.copy( quaternion );
	}
		
    get selectPressed(){
        return ( this.controllers !== undefined && (this.controllers[0].userData.selectPressed || this.controllers[1].userData.selectPressed) );    
    }

    get squeezePressed(){
        return (this.controllers !== undefined && (this.controllers[0].userData.squeezePressed || this.controllers[1].userData.squeezePressed));
    }
    
    showInfoboard( name, info, pos ){
        if (this.ui === undefined ) return;
        this.ui.position.copy(pos).add( this.workingVec3.set( 0, 1.3, 0 ) );
        const camPos = this.dummyCam.getWorldPosition( this.workingVec3 );
        this.ui.updateElement( 'name', info.name );
        this.ui.updateElement( 'info', info.info );
        this.ui.update();
        this.ui.lookAt( camPos )
        this.ui.visible = true;
        this.boardShown = name;
    }

	render( timestamp, frame ){
        const dt = this.clock.getDelta();
        
        let moved = false;

        // activeAction = actions[1];
        // activeAction.play();
        
        if (this.renderer.xr.isPresenting && this.selectPressed){
            this.moveDolly(dt);
            moved = true;
        }

        if (this.renderer.xr.isPresenting && this.squeezePressed){
            this.moveDolly2(dt);
            // moved = true;
        }

        if (this.renderer.xr.isPresenting && !this.squeezePressed){
            model.rotation.set(0, 3.115, 0);
            // moved = true;
        }
        
        if (this.boardData && moved){
            const scene = this.scene;
            const dollyPos = this.dolly.getWorldPosition( new THREE.Vector3() );
            let boardFound = false;
            Object.entries(this.boardData).forEach(([name, info]) => {
                const obj = scene.getObjectByName( name );
                if (obj !== undefined){
                    const pos = obj.getWorldPosition( new THREE.Vector3(0, 0,) );
                    if (dollyPos.distanceTo( pos ) < 3){
                        boardFound = true;
                        if ( this.boardShown !== name) this.showInfoboard( name, info, pos );
                    }
                }
            });
            if (!boardFound){
                this.boardShown = "";
                this.ui.visible = false;
            }
        }


        for ( const mixer of mixers ) mixer.update( dt );
        
        this.stats.update();
		this.renderer.render(this.scene, camera);
	}
}

export { App };
