import * as THREE from 'three';
export class FollowCamera{
 camera=new THREE.PerspectiveCamera(40,1,.1,180); private target=new THREE.Vector3();private shake=0;private shakeEnabled=true;private shakeStrength=.72;
 constructor(){this.camera.position.set(0,19,13);this.camera.lookAt(0,0,0)}
 resize(w:number,h:number){this.camera.aspect=w/h;this.camera.updateProjectionMatrix()}
 configureShake(enabled:boolean,strength:number){this.shakeEnabled=enabled;this.shakeStrength=Math.max(0,Math.min(1,strength));if(!enabled)this.shake=0}
 // Rapid hits replace the current shake instead of stacking it. This prevents
 // high fire-rate weapons and multi-wave boss attacks from shaking to the cap.
 impact(amount=.28){if(!this.shakeEnabled)return;this.shake=Math.min(.62,Math.max(this.shake,amount*this.shakeStrength))}
 update(pos:THREE.Vector3,dt:number){const k=1-Math.exp(-5*dt);this.target.lerp(pos,k);this.camera.position.lerp(new THREE.Vector3(pos.x,19,pos.z+13),k);let sx=0,sz=0;if(this.shake>0){sx=(Math.random()*2-1)*this.shake*.48;sz=(Math.random()*2-1)*this.shake*.48;this.shake=Math.max(0,this.shake-dt*3.25)}this.camera.position.x+=sx;this.camera.position.z+=sz;this.camera.lookAt(this.target.x+sx,0,this.target.z+sz)}
}
