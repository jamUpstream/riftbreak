import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

type StageTheme={ground:string;sky:string;primary:string;accent:string;endless?:boolean};
type Obstacle={x:number;z:number;r:number;kind:number;h:number;rot:number;biome:number};
const CHUNK=16,VIEW=3,CLEAR=7,CAP=500;
const PALETTES=[
 ['#76513a','#b05f31','#352c27'],['#335b43','#75a94b','#243a2e'],['#557b8d','#91dbea','#233943'],['#642f29','#d75631','#34201d'],['#463767','#a16bda','#201a32']
];
function rng(seed:number){return()=>{seed|=0;seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function material(){return new THREE.MeshStandardMaterial({color:'#ffffff',flatShading:true,roughness:.82,metalness:.08})}
function mesh(geo:THREE.BufferGeometry){const m=new THREE.InstancedMesh(geo,material(),CAP);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.setColorAt(0,new THREE.Color());m.instanceColor!.setUsage(THREE.DynamicDrawUsage);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;return m}
function structure(parts:Array<[number,number,number,number,number,number,number?]>){const geometries=parts.map(([x,y,z,sx,sy,sz,rz=0])=>{const g=new THREE.BoxGeometry(sx,sy,sz);g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,rz)),new THREE.Vector3(1,1,1)));return g});const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!merged)throw new Error('Unable to build map structure');merged.computeBoundingSphere();return merged}

export class ProceduralMap{
 private floor:THREE.Mesh;private grid:THREE.GridHelper;private chunks=new Map<string,Obstacle[]>();private active:Obstacle[]=[];private cx=99999;private cz=99999;private dummy=new THREE.Object3D();
 private meshes:THREE.InstancedMesh[];private rock=mesh(new THREE.DodecahedronGeometry(1,0));private column=mesh(new THREE.CylinderGeometry(.45,.55,1,7));private block=mesh(new THREE.BoxGeometry(1,1,1));private spire=mesh(new THREE.ConeGeometry(.7,1,6));private ring=mesh(new THREE.TorusGeometry(.8,.14,6,12));private crown=mesh(new THREE.IcosahedronGeometry(1,0));private beam=mesh(new THREE.CylinderGeometry(.3,.35,1,6));
 private arch=mesh(structure([[-.72,1,0,.42,2,.48],[.72,1,0,.42,2,.48],[0,2.05,0,1.86,.42,.55]]));
 private barricade=mesh(structure([[0,.35,0,2.25,.28,.42,.12],[0,.92,0,2.1,.25,.36,-.1],[-.72,.62,0,.22,1.5,.38,.16],[.72,.62,0,.22,1.5,.38,-.16]]));
 private ruin=mesh(structure([[-.62,.75,0,.42,1.5,1.85],[.18,.42,.7,1.25,.84,.42],[.15,.18,-.52,1.15,.36,.42]]));
 private watch=mesh(structure([[0,.28,0,1.7,.55,1.7],[0,1.05,0,1.15,1.05,1.15],[-.48,1.75,-.48,.34,.48,.34],[.48,1.75,-.48,.34,.48,.34],[-.48,1.75,.48,.34,.48,.34],[.48,1.75,.48,.34,.48,.34]]));
 private shrine=mesh(structure([[0,.18,0,1.9,.36,1.45],[0,.48,0,1.35,.25,1.05],[0,1.1,0,.42,1.25,.42],[0,1.82,0,.82,.22,.82]]));
 constructor(private scene:THREE.Scene,private stageIndex:number,private stage:StageTheme){
  scene.background=new THREE.Color(stage.sky);scene.fog=new THREE.Fog(stage.sky,34,76);
  const tex=this.groundTexture(),mat=new THREE.MeshStandardMaterial({color:stage.ground,map:tex,flatShading:true,roughness:1});this.floor=new THREE.Mesh(new THREE.PlaneGeometry(180,180),mat);this.floor.rotation.x=-Math.PI/2;this.floor.position.y=-.04;this.floor.receiveShadow=true;scene.add(this.floor);
  this.grid=new THREE.GridHelper(160,40,new THREE.Color(stage.primary),new THREE.Color(stage.accent));this.grid.position.y=-.015;(this.grid.material as THREE.Material).transparent=true;(this.grid.material as THREE.Material).opacity=.055;scene.add(this.grid);
  this.meshes=[this.rock,this.column,this.block,this.spire,this.ring,this.crown,this.beam,this.arch,this.barricade,this.ruin,this.watch,this.shrine];this.meshes.forEach(m=>scene.add(m));this.update(0,0);
 }
 private groundTexture(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d')!;g.fillStyle='#ffffff';g.fillRect(0,0,256,256);g.fillStyle='#e5e5e5';for(let z=0;z<4;z++)for(let x=0;x<4;x++)if((x+z)%2===0)g.fillRect(x*64,z*64,64,64);g.strokeStyle='rgba(0,0,0,.12)';g.lineWidth=2;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,256);g.stroke();g.beginPath();g.moveTo(0,i*64);g.lineTo(256,i*64);g.stroke()}g.fillStyle='rgba(255,255,255,.08)';g.fillRect(122,0,12,256);g.fillStyle='rgba(0,0,0,.055)';g.fillRect(0,120,256,18);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(22.5,22.5);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
 private chunk(x:number,z:number){const key=`${x},${z}`;const known=this.chunks.get(key);if(known)return known;const r=rng((x*73856093)^(z*19349663)^((this.stageIndex+1)*7919)),out:Obstacle[]=[];const biome=this.stage.endless?Math.abs(x*17+z*31)%5:Math.min(this.stageIndex,4),count=2+Math.floor(r()*3);
  for(let i=0;i<count;i++)for(let tries=0;tries<8;tries++){const ox=(x+r())*CHUNK,oz=(z+r())*CHUNK,roll=r(),structureRoll=r();let kind=0;if(biome===0)kind=roll<.32?2:roll<.54?6:roll<.72?1:0;if(biome===1)kind=roll<.34?5:roll<.62?1:roll<.82?6:0;if(biome===2)kind=roll<.62?3:roll<.82?0:5;if(biome===3)kind=roll<.34?1:roll<.65?2:roll<.84?6:0;if(biome===4)kind=roll<.4?3:roll<.7?4:roll<.86?2:0;if(structureRoll<.34)kind=7+((biome+Math.floor(r()*3))%5);const rad=kind>=7?1.15+r()*.8:.65+r()*.72;if(Math.hypot(ox,oz)<CLEAR+rad)continue;let okay=true;for(const o of out)if(Math.hypot(ox-o.x,oz-o.z)<rad+o.r+1.5){okay=false;break}if(!okay)continue;out.push({x:ox,z:oz,r:rad,kind,h:r(),rot:r()*Math.PI*2,biome});break}
  this.chunks.set(key,out);return out}
 update(px:number,pz:number){const cx=Math.floor(px/CHUNK),cz=Math.floor(pz/CHUNK);this.floor.position.set(Math.round(px/8)*8,-.04,Math.round(pz/8)*8);this.grid.position.set(Math.round(px/8)*8,-.015,Math.round(pz/8)*8);if(cx===this.cx&&cz===this.cz)return;this.cx=cx;this.cz=cz;if(this.chunks.size>700)this.chunks.clear();this.active=[];for(let x=-VIEW;x<=VIEW;x++)for(let z=-VIEW;z<=VIEW;z++)this.active.push(...this.chunk(cx+x,cz+z));this.draw()}
 private draw(){const counts=new Array(this.meshes.length).fill(0),color=new THREE.Color();for(const o of this.active){const idx=counts[o.kind]++;if(idx>=CAP)continue;const p=PALETTES[o.biome],m=this.meshes[o.kind],d=this.dummy;d.rotation.set(0,o.rot,0);let sx=o.r,sy=o.r,sz=o.r,y=o.r*.6;
   if(o.kind===0){sx=o.r*1.15;sy=o.r*(.7+o.h*.55);sz=o.r;y=sy*.7}
   if(o.kind===1){sx=o.r*.65;sy=2.2+o.h*2.1;sz=o.r*.65;y=sy/2}
   if(o.kind===2){sx=o.r*(1.3+o.h);sy=.7+o.h*1.1;sz=o.r*(.75+o.h*.3);y=sy/2;d.rotation.z=(o.h-.5)*.16}
   if(o.kind===3){sx=o.r*(.8+o.h*.3);sy=2.4+o.h*2.4;sz=sx;y=sy/2;d.rotation.z=(o.h-.5)*.18}
   if(o.kind===4){sx=sy=sz=o.r*(1.2+o.h*.35);y=sy+.2;d.rotation.x=Math.PI/2}
   if(o.kind===5){sx=o.r*(1.1+o.h*.35);sy=o.r*(1.5+o.h);sz=sx;y=1.7+o.h}
   if(o.kind===6){sx=o.r*.48;sy=2.5+o.h*1.7;sz=o.r*.48;y=sy/2;d.rotation.z=Math.PI/2;d.rotation.y=o.rot}
   if(o.kind>=7){const scale=.72+o.r*.34;sx=scale;sy=scale*(.9+o.h*.18);sz=scale;y=0;d.rotation.y=o.rot}
   d.position.set(o.x,y,o.z);d.scale.set(sx,sy,sz);d.updateMatrix();m.setMatrixAt(idx,d.matrix);color.set(p[o.kind%3]).multiplyScalar(.78+o.h*.28);m.setColorAt(idx,color)
  }for(let i=0;i<this.meshes.length;i++){const m=this.meshes[i];m.count=Math.min(CAP,counts[i]);m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}}
 resolve(x:number,z:number,r:number){const cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(const o of this.chunk(cx+a,cz+b)){const dx=x-o.x,dz=z-o.z,min=o.r+r,d2=dx*dx+dz*dz;if(d2<min*min){const d=Math.sqrt(d2)||.001,push=min-d;x+=(d2>1e-8?dx/d:1)*push;z+=(d2>1e-8?dz/d:0)*push}}return{x,z}}
 blocks(x:number,z:number,r:number){const p=this.resolve(x,z,r);return Math.abs(p.x-x)>.001||Math.abs(p.z-z)>.001}
}
