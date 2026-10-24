import * as THREE from 'three';
export class FollowCamera{
 camera=new THREE.PerspectiveCamera(40,1,.1,180); private target=new THREE.Vector3();private shake=0;
 constructor(){this.camera.position.set(0,19,13);this.camera.lookAt(0,0,0)}
 resize(w:number,h:number){this.camera.aspect=w/h;this.camera.updateProjectionMatrix()}
 impact(amount=.35){this.shake=Math.min(1,this.shake+amount)}
 update(pos:THREE.Vector3,dt:number){const k=1-Math.exp(-5*dt);this.target.lerp(pos,k);this.camera.position.lerp(new THREE.Vector3(pos.x,19,pos.z+13),k);let sx=0,sz=0;if(this.shake>0){sx=(Math.random()*2-1)*this.shake*.6;sz=(Math.random()*2-1)*this.shake*.6;this.shake=Math.max(0,this.shake-dt*2.5)}this.camera.position.x+=sx;this.camera.position.z+=sz;this.camera.lookAt(this.target.x+sx,0,this.target.z+sz)}
}
