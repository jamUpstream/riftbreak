import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const mat=(c:string,emissive='#000000')=>new THREE.MeshStandardMaterial({color:c,emissive,emissiveIntensity:.35,flatShading:true,roughness:.76,metalness:.16});

function part(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number,rx=0,ry=0,rz=0){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);mesh.castShadow=true;return mesh}

function weaponModel(id:string,color:string){
 const g=new THREE.Group(),steel=mat('#d7e2df'),gunmetal=mat('#27343c'),grip=mat('#11191e'),accent=mat(color,color);
 if(id==='rapid-pistol'){
  g.add(part(new THREE.BoxGeometry(.2,.18,.62),gunmetal,.5,1.08,-.34),part(new THREE.BoxGeometry(.13,.38,.18),grip,.5,.88,-.16,.18),part(new THREE.CylinderGeometry(.055,.055,.38,6),steel,.5,1.08,-.82,Math.PI/2),part(new THREE.BoxGeometry(.12,.07,.18),accent,.5,1.22,-.3));
 }
 if(id==='cinder-wand'){
  g.add(part(new THREE.CylinderGeometry(.045,.065,1.08,6),gunmetal,.54,1.06,-.38,-Math.PI/2),part(new THREE.ConeGeometry(.2,.54,5),accent,.54,1.06,-1.12,-Math.PI/2),part(new THREE.TorusGeometry(.18,.045,5,10),steel,.54,1.06,-.84,Math.PI/2),part(new THREE.OctahedronGeometry(.12,0),accent,.54,1.06,-1.42));
 }
 if(id==='scatter-cannon'){
  g.add(part(new THREE.BoxGeometry(.52,.38,.82),gunmetal,.42,1.02,-.42),part(new THREE.BoxGeometry(.36,.25,.38),grip,.42,.88,.02),part(new THREE.CylinderGeometry(.18,.25,.48,7),steel,.42,1.02,-1.05,Math.PI/2));
  for(const x of[-.1,.1])for(const y of[-.09,.09])g.add(part(new THREE.CylinderGeometry(.035,.055,.38,6),accent,.42+x,1.02+y,-1.35,Math.PI/2));
 }
 if(id==='twin-blades'){
  for(const side of[-1,1]){
   g.add(part(new THREE.CylinderGeometry(.055,.065,.3,6),grip,side*.57,.91,-.18,-Math.PI/2),part(new THREE.BoxGeometry(.3,.055,.12),accent,side*.57,.91,-.37,0,0,side*.18));
   const blade=part(new THREE.ConeGeometry(.2,.92,4),steel,side*.57,.93,-.88,-Math.PI/2,0,side*.12);blade.scale.set(1,.9,.32);g.add(blade);
   g.add(part(new THREE.ConeGeometry(.1,.48,4),accent,side*.57,1.01,-.72,-Math.PI/2,0,side*.12));
  }
 }
 if(id==='frost-orb'){
  g.add(part(new THREE.IcosahedronGeometry(.26,1),accent,.62,1.24,-.48),part(new THREE.IcosahedronGeometry(.12,0),steel,.62,1.24,-.48));
  const ring=part(new THREE.TorusGeometry(.36,.035,5,16),steel,.62,1.24,-.48,Math.PI/2,.35);g.add(ring);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;g.add(part(new THREE.ConeGeometry(.065,.3,4),accent,.62+Math.cos(a)*.38,1.24+Math.sin(a)*.18,-.48-Math.sin(a)*.18,0,0,-a));}
 }
 if(id==='longbolt'){
  g.add(part(new THREE.BoxGeometry(.25,.22,1.28),gunmetal,.48,1.04,-.55),part(new THREE.BoxGeometry(.38,.12,.5),steel,.48,1.04,-1.34),part(new THREE.CylinderGeometry(.045,.055,.72,6),accent,.48,1.04,-1.83,Math.PI/2),part(new THREE.BoxGeometry(.18,.18,.46),grip,.48,.89,.02,.22),part(new THREE.BoxGeometry(.18,.14,.32),accent,.48,1.22,-.58),part(new THREE.CylinderGeometry(.07,.07,.22,8),steel,.48,1.23,-.82,Math.PI/2));
 }
 return g;
}

export function playerModel(color:string,weaponId='rapid-pistol'){
 const g=new THREE.Group(),dark=mat('#152129'),accent=mat(color,color);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.7,3,6),dark);body.name='body';body.position.y=.82;g.add(body);
 const head=new THREE.Mesh(new THREE.IcosahedronGeometry(.32,1),accent);head.name='head';head.position.y=1.65;g.add(head);
 for(const s of[-1,1]){const side=s<0?'left':'right',arm=new THREE.Mesh(new THREE.BoxGeometry(.18,.65,.2),accent);arm.name=`arm-${side}`;arm.position.set(s*.52,.86,0);arm.rotation.z=s*.2;g.add(arm);const leg=new THREE.Mesh(new THREE.BoxGeometry(.22,.72,.25),dark);leg.name=`leg-${side}`;leg.position.set(s*.22,.25,0);g.add(leg)}
 const weapon=weaponModel(weaponId,color);weapon.name=`weapon-${weaponId}`;weapon.position.y=-.26;weapon.userData.baseY=-.26;g.add(weapon);return g;
}

type Primitive=THREE.BufferGeometry;
const placed=(geometry:Primitive,x:number,y:number,z:number,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{
 const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));
 const compatible=geometry.index?geometry.toNonIndexed():geometry;
 if(compatible!==geometry)geometry.dispose();
 return compatible.applyMatrix4(matrix);
};
const merged=(parts:Primitive[])=>{
 const geometry=mergeGeometries(parts,false);
 if(!geometry)throw new Error('Unable to merge procedural enemy geometry');
 for(const part of parts)part.dispose();
 geometry.computeBoundingSphere();
 return geometry;
};
const box=(x:number,y:number,z:number,sx:number,sy:number,sz:number,rx=0,ry=0,rz=0)=>placed(new THREE.BoxGeometry(1,1,1),x,y,z,sx,sy,sz,rx,ry,rz);
const ico=(x:number,y:number,z:number,sx:number,sy=sx,sz=sx)=>placed(new THREE.IcosahedronGeometry(.5,0),x,y,z,sx,sy,sz);
const oct=(x:number,y:number,z:number,sx:number,sy=sx,sz=sx,rx=0,ry=0,rz=0)=>placed(new THREE.OctahedronGeometry(.5,0),x,y,z,sx,sy,sz,rx,ry,rz);
const cyl=(x:number,y:number,z:number,r:number,h:number,rx=0,ry=0,rz=0)=>placed(new THREE.CylinderGeometry(r,r*.82,h,5),x,y,z,1,1,1,rx,ry,rz);
const cone=(x:number,y:number,z:number,r:number,h:number,rx=0,ry=0,rz=0)=>placed(new THREE.ConeGeometry(r,h,5),x,y,z,1,1,1,rx,ry,rz);
const torus=(x:number,y:number,z:number,r:number,t:number,rx=0,ry=0,rz=0)=>placed(new THREE.TorusGeometry(r,t,5,12),x,y,z,1,1,1,rx,ry,rz);
const limb=(ax:number,ay:number,az:number,bx:number,by:number,bz:number,r:number)=>{
 const start=new THREE.Vector3(ax,ay,az),end=new THREE.Vector3(bx,by,bz),direction=end.clone().sub(start),length=direction.length(),geometry=new THREE.CylinderGeometry(r,r*.72,length,5),rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()),matrix=new THREE.Matrix4().compose(start.add(end).multiplyScalar(.5),rotation,new THREE.Vector3(1,1,1));
 const compatible=geometry.index?geometry.toNonIndexed():geometry;if(compatible!==geometry)geometry.dispose();return compatible.applyMatrix4(matrix);
};

/** Distinct, low-poly silhouettes while retaining a single instanced draw per archetype. */
function enemyGeometryDetailed(shape:string){
 const p:Primitive[]=[];
 if(shape==='husk'){
  p.push(ico(0,.68,.12,.9,.55,1.25),ico(0,.82,-.82,.58,.48,.68),cone(-.26,.76,-1.3,.13,.65,-Math.PI/2,0,-.25),cone(.26,.76,-1.3,.13,.65,-Math.PI/2,0,.25));
  for(const s of[-1,1])for(const z of[-.55,0,.55])p.push(cyl(s*(.58+Math.abs(z)*.18),.3,z,.09,.72,0,0,s*(.72+Math.abs(z)*.22)));
 }else if(shape==='darter'){
  p.push(ico(0,.62,0,.95,.55,1.35),cone(0,.72,-1.05,.48,.92,Math.PI/2),cone(0,.93,.48,.2,.75,-Math.PI/2));
  for(const s of[-1,1])for(const z of[-.62,0,.62])p.push(cyl(s*(.58+Math.abs(z)*.12),.26,z,.1,.78,0,0,s*.78));
 }else if(shape==='caster'){
  p.push(ico(0,1.42,0,.82,.72,.82),torus(0,1.42,0,.92,.08,Math.PI/2),oct(0,1.48,-.48,.4,.34,.28));
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;p.push(cone(Math.sin(a)*.46,.62,Math.cos(a)*.38,.12,1.18,0,0,-Math.sin(a)*.55));}
 }else if(shape==='hulk'){
  p.push(ico(0,.92,.2,1.55,.92,1.55),box(0,1.28,.35,1.28,.42,1.28),ico(0,1.02,-1.05,.78,.62,.72),cone(-.46,.98,-1.62,.22,.95,-Math.PI/2,0,-.28),cone(.46,.98,-1.62,.22,.95,-Math.PI/2,0,.28));
  for(const s of[-1,1])for(const z of[-.72,0,.72])p.push(cyl(s*(1+Math.abs(z)*.15),.36,z,.15,1.05,0,0,s*.82));
 }else if(shape==='aegis'){
  p.push(ico(0,.72,.2,1.18,.55,1.08),box(0,.92,-.58,1.7,1.24,.24,.12),cone(-.62,.72,-1.12,.18,.92,-Math.PI/2,0,-.4),cone(.62,.72,-1.12,.18,.92,-Math.PI/2,0,.4));
  for(const s of[-1,1])for(const z of[-.42,.38])p.push(cyl(s*.82,.28,z,.11,.78,0,0,s*.8));
 }else if(shape==='lure'){
  p.push(oct(0,.92,0,.9,1.15,.9),torus(0,.98,0,.72,.08,Math.PI/2),cone(-.2,1.62,-.08,.08,.72,0,0,-.22),cone(.2,1.62,-.08,.08,.72,0,0,.22),cone(-.68,1.02,.05,.22,.85,0,0,-Math.PI/2),cone(.68,1.02,.05,.22,.85,0,0,Math.PI/2));
 }else if(shape==='spitter'){
  p.push(ico(0,.72,.2,1.08,.8,1.02),ico(0,.98,.75,.66,.62,.74),cone(0,.76,-.92,.45,.88,-Math.PI/2),ico(-.42,1.24,.55,.38),ico(.42,1.24,.55,.38));
  for(const s of[-1,1])for(const z of[-.45,.15,.65])p.push(cyl(s*.62,.27,z,.1,.68,0,0,s*.72));
 }else if(shape==='walker'){
  p.push(box(0,.82,0,1.38,.58,1.02),box(0,1.24,.15,.72,.36,.72),cyl(0,1.36,-.78,.16,1.35,Math.PI/2));
  for(const s of[-1,1])for(const z of[-.55,0,.55])p.push(cyl(s*.82,.32,z,.12,.88,0,0,s*.78));
 }else if(shape==='splitter'){
  p.push(ico(-.4,.72,0,.82,.72,1.02),ico(.4,.72,0,.82,.72,1.02),oct(0,1.22,-.45,.42,.52,.42),cone(-.32,.75,-1.0,.13,.62,-Math.PI/2),cone(.32,.75,-1.0,.13,.62,-Math.PI/2));
  for(const s of[-1,1])for(const z of[-.42,.24,.64])p.push(cyl(s*.7,.25,z,.09,.62,0,0,s*.76));
 }else{
  p.push(ico(0,1.22,.1,1.28,.28,1.08),oct(0,1.35,-.72,.58,.42,.5),cone(-.92,1.22,.12,.35,1.18,0,0,-Math.PI/2),cone(.92,1.22,.12,.35,1.18,0,0,Math.PI/2));
  for(let i=0;i<5;i++){const a=(i/4-.5)*1.7;p.push(cone(Math.sin(a)*.62,.52,.3+Math.cos(a)*.38,.1,.98,0,0,-Math.sin(a)*.5));}
 }
 return merged(p);
}

/**
 * Regular enemies use the original game's clean primitive language: one bold
 * read at gameplay distance, with only a few secondary pieces to identify the
 * archetype. This keeps a single merged geometry (and one instanced draw) per
 * type without making the whole roster share the same many-legged body plan.
 */
export function enemyGeometry(shape:string){
 const p:Primitive[]=[];
 if(shape==='husk'){
  // The classic rounded starter: one clear faceted orb and a small center core.
  p.push(ico(0,.68,0,1.12,.88,1.12),oct(0,.72,-.54,.4,.34,.3));
 }else if(shape==='darter'){
  // Fast arrowhead: narrow from the front and visibly directional.
  p.push(cone(0,.68,0,.5,1.45,Math.PI/2),cone(-.38,.68,.25,.22,.7,0,0,-Math.PI/2),cone(.38,.68,.25,.22,.7,0,0,Math.PI/2));
 }else if(shape==='caster'){
  // Floating spell orb surrounded by a low-poly halo.
  p.push(ico(0,1.08,0,1.0,1.0,1.0),torus(0,1.08,0,.78,.09,Math.PI/2),oct(0,1.08,-.5,.38,.34,.28));
 }else if(shape==='hulk'){
  // Oversized rounded polyhedron; mass alone communicates the tank role.
  p.push(placed(new THREE.DodecahedronGeometry(.72,0),0,.82,0,1.65,1.42,1.65),box(0,.84,-.72,.72,.42,.3));
 }else if(shape==='aegis'){
  // Circular shield puck with a gem at its protected front face.
  p.push(placed(new THREE.CylinderGeometry(.72,.82,.36,8),0,.82,0,1,1,1,Math.PI/2),torus(0,.82,-.24,.55,.08,Math.PI/2),oct(0,.82,-.34,.34,.34,.2));
 }else if(shape==='lure'){
  // A hovering diamond pickup-like decoy with two orbit bands.
  p.push(oct(0,1.0,0,1.18,1.35,1.18),torus(0,1.0,0,.72,.065,Math.PI/2),torus(0,1.0,0,.58,.05,.45,0,Math.PI/2));
 }else if(shape==='spitter'){
  // Flattened round reservoir with a short geometric nozzle.
  p.push(ico(0,.68,.18,1.3,.82,1.16),cone(0,.68,-.76,.34,.72,-Math.PI/2),ico(-.34,1.02,.38,.32),ico(.32,1.08,.34,.26));
 }else if(shape==='walker'){
  // The roster's mechanical cube, capped by a circular artillery barrel.
  p.push(box(0,.74,.06,1.28,1.12,1.16),box(0,1.32,.1,.68,.28,.68),cyl(0,1.34,-.68,.16,1.18,Math.PI/2));
 }else if(shape==='splitter'){
  // Two touching geometric cells clearly preview its split-on-death behavior.
  p.push(oct(-.4,.72,0,.94,.94,1.08),oct(.4,.72,0,.94,.94,1.08),torus(0,.72,0,.42,.07,Math.PI/2));
 }else{
  // Hollow ring with a suspended diamond core for the teleporting unit.
  p.push(torus(0,1.06,0,.72,.18,Math.PI/2),oct(0,1.06,-.02,.72,1.0,.34),torus(0,1.06,0,.43,.055,.35,0,Math.PI/2));
 }
 return merged(p);
}

/** Every named boss receives a unique primitive-built silhouette. */
export function bossGeometry(id:string){
 const p:Primitive[]=[];
 const legs=(count:number,rx:number,rz:number,y:number,length:number,thick=.13)=>{for(let i=0;i<count;i++){const a=i/count*Math.PI*2,sx=Math.sin(a),sz=Math.cos(a),hipX=sx*rx*.58,hipZ=sz*rz*.58,kneeX=sx*(rx+length*.54),kneeZ=sz*(rz+length*.42),footX=sx*(rx+length),footZ=sz*(rz+length*.82);p.push(limb(hipX,y,hipZ,kneeX,y*.72,kneeZ,thick*1.18),limb(kneeX,y*.72,kneeZ,footX,.12,footZ,thick),oct(footX,.12,footZ,thick*2.5,thick*1.35,thick*3.2));}};
 const armoredBeast=()=>{p.push(ico(0,1.02,.15,1.65,.88,1.55),box(0,1.42,.25,1.38,.38,1.38),ico(0,1.03,-1.12,.82,.62,.72));legs(6,1.2,.72,.4,1.18,.16)};
 switch(id){
  case 'scrap-brute': armoredBeast();p.push(box(-.48,1.78,.05,.62,.34,.82,0,0,.18),box(.42,1.7,.12,.9,.3,.66,0,0,-.12),cone(-.42,1.05,-1.72,.22,.94,-Math.PI/2,0,-.22),cone(.42,1.05,-1.72,.22,.94,-Math.PI/2,0,.22));break;
  case 'wire-stalker': p.push(ico(0,.92,0,1.2,.6,1.55),ico(0,1.35,-1.12,.62,.55,.8),cone(0,1.36,-1.82,.34,.88,-Math.PI/2),torus(0,1.02,.1,.88,.08,Math.PI/2));legs(8,1.15,.86,.38,1.45,.11);break;
  case 'crane-colossus': p.push(ico(0,1.0,.2,1.55,.7,1.45),ico(0,1.12,-1.08,.72,.58,.78),box(0,1.72,.7,.48,.48,1.15),box(0,2.18,1.4,.38,.38,1.25,Math.PI*.18),cyl(0,2.35,2.15,.1,1.15,.35),oct(0,1.78,2.45,.42,.62,.42));legs(6,1.18,.72,.38,1.2,.15);p.push(cone(-.45,1.05,-1.7,.18,.85,-Math.PI/2,0,-.22),cone(.45,1.05,-1.7,.18,.85,-Math.PI/2,0,.22));break;
  case 'bog-hurler': p.push(ico(0,.95,.2,1.62,1.0,1.36),ico(0,1.25,-1.05,.8,.62,.82),ico(-.65,1.65,.55,.72),ico(.62,1.78,.5,.62),cone(0,1.15,-1.72,.42,.82,-Math.PI/2));legs(6,1.15,.72,.34,1.15,.16);break;
  case 'spore-matron': p.push(ico(0,.82,.05,1.05,.58,1.0),cyl(0,1.5,0,.45,.9),placed(new THREE.CylinderGeometry(1.42,.68,.58,9),0,2.02,0),ico(-1.02,1.25,.32,.42),ico(1.0,1.38,.2,.48),ico(0,1.05,.9,.38));legs(8,1.0,.62,.32,.92,.11);break;
  case 'mire-leviathan': p.push(ico(0,.7,.85,1.15,.78,1.2),ico(0,.88,0,1.0,.82,1.2),ico(0,1.14,-.85,.86,.78,1.05),ico(0,1.5,-1.6,.72,.72,.9),cone(0,1.48,-2.35,.48,1.1,-Math.PI/2),cone(-.72,1.32,-1.15,.28,1.05,0,0,-Math.PI/2),cone(.72,1.32,-1.15,.28,1.05,0,0,Math.PI/2));break;
  case 'frost-warden': p.push(ico(0,.88,.18,1.35,.62,1.18),box(0,1.05,-.72,1.82,1.42,.24,.1),oct(0,1.22,-1.24,.62,.52,.55),cone(-.62,1.78,-.5,.18,.9,0,0,-.35),cone(0,1.98,-.38,.2,1.1),cone(.62,1.78,-.5,.18,.9,0,0,.35));legs(6,1.05,.62,.32,1.02,.13);break;
  case 'shard-weaver': p.push(oct(0,1.12,0,1.35,.8,1.35),oct(0,1.52,-.98,.7,.62,.82));legs(8,1.26,.9,.42,1.62,.12);for(let i=0;i<5;i++){const a=(i/4-.5)*1.7;p.push(cone(Math.sin(a)*.72,1.92,.15+Math.cos(a)*.42,.14,.82,0,0,-Math.sin(a)*.45));}break;
  case 'avalanche-titan': p.push(ico(0,1.18,.15,1.92,1.35,1.72),ico(0,1.36,-1.38,1.02,.82,.9),cone(-.62,1.72,-1.82,.3,1.0,-Math.PI/2,0,-.28),cone(.62,1.72,-1.82,.3,1.0,-Math.PI/2,0,.28));legs(6,1.38,.82,.42,1.45,.2);p.push(cone(-.75,2.25,.12,.26,.92,0,0,-.4),cone(0,2.52,.1,.3,1.18),cone(.75,2.25,.12,.26,.92,0,0,.4));break;
  case 'slag-golem': armoredBeast();p.push(ico(-.58,1.52,-.5,.55),ico(.56,1.38,-.52,.46),cone(0,1.96,.22,.5,.92),cone(-.52,1.0,-1.62,.22,.82,-Math.PI/2,0,-.25),cone(.52,1.0,-1.62,.22,.82,-Math.PI/2,0,.25));break;
  case 'furnace-priest': p.push(ico(0,1.52,0,.86,1.0,.72),torus(0,1.62,0,1.18,.12,Math.PI/2),cone(-1.0,1.48,.18,.52,1.55,0,0,-Math.PI/2),cone(1.0,1.48,.18,.52,1.55,0,0,Math.PI/2),oct(0,1.62,-.55,.48,.42,.35));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;p.push(cone(Math.sin(a)*.55,.55,Math.cos(a)*.46,.1,1.22,0,0,-Math.sin(a)*.5));}break;
  case 'forge-tyrant': p.push(ico(0,.92,.78,1.42,.72,1.05),ico(0,1.02,-.18,1.3,.76,1.08),ico(0,1.22,-1.12,1.08,.68,.92),box(0,1.62,-.15,1.5,.32,.92),cone(-.5,1.18,-1.82,.24,1.0,-Math.PI/2,0,-.28),cone(.5,1.18,-1.82,.24,1.0,-Math.PI/2,0,.28));legs(8,1.18,.9,.36,1.25,.15);break;
  case 'echo-knight': p.push(ico(0,1.04,.18,1.0,.62,1.25),ico(0,1.38,-.92,.62,.58,.72),cone(-.76,1.02,-1.05,.22,1.65,-.35,0,-.68),cone(.76,1.02,-1.05,.22,1.65,-.35,0,.68));legs(6,.82,.65,.32,.95,.11);p.push(cone(-.3,1.92,-.66,.12,.72,0,0,-.28),cone(.3,1.92,-.66,.12,.72,0,0,.28));break;
  case 'gravity-seer': p.push(ico(0,1.65,0,1.18),ico(0,1.65,0,.54),torus(0,1.65,0,1.5,.12,Math.PI/2,.35),torus(0,1.65,0,1.15,.1,.3,0,Math.PI/2));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;p.push(cone(Math.sin(a)*.68,.55,Math.cos(a)*.62,.1,1.3,0,0,-Math.sin(a)*.48));}break;
  case 'hollow-crown': p.push(ico(0,1.48,0,1.08,.78,1.02),torus(0,1.72,0,1.18,.15,Math.PI/2));for(let i=0;i<7;i++){const a=i/7*Math.PI*2;p.push(cone(Math.sin(a)*.96,2.42,Math.cos(a)*.96,.22,1.35,0,0,-a));p.push(cone(Math.sin(a)*.62,.52,Math.cos(a)*.55,.1,1.18,0,0,-Math.sin(a)*.5));}p.push(oct(0,1.48,-.58,.48));break;
  case 'chrono-widow': p.push(placed(new THREE.DodecahedronGeometry(.72,0),0,1.18,.48,1.9,1.28,2.2),ico(0,1.48,-1.32,.92,.72,1.02),oct(0,1.5,-1.96,.72,.5,.82),torus(0,1.28,.35,1.52,.16,Math.PI/2),torus(0,1.28,.35,1.12,.1,.35,0,Math.PI/2),torus(0,1.28,.35,.76,.08,-.35,0,Math.PI/2),cone(-.38,1.44,-2.58,.22,1.25,-Math.PI/2,0,-.18),cone(.38,1.44,-2.58,.22,1.25,-Math.PI/2,0,.18));legs(8,1.58,1.15,.62,2.05,.18);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;p.push(cone(Math.sin(a)*1.48,2.05,Math.cos(a)*1.1+.35,.16,.92,0,0,-a));}break;
  default: armoredBeast();
 }
 return merged(p);
}
export function bossModel(color:string){const g=new THREE.Group(),m=mat(color,color),d=mat('#10171b');const core=new THREE.Mesh(new THREE.DodecahedronGeometry(1.15,0),m);core.position.y=1.3;g.add(core);for(let i=0;i<6;i++){const a=i/6*Math.PI*2,limb=new THREE.Mesh(new THREE.CylinderGeometry(.16,.28,1.9,5),d);limb.position.set(Math.cos(a)*1.2,.7,Math.sin(a)*1.2);limb.rotation.z=Math.PI/2;limb.rotation.y=-a;g.add(limb)}const crown=new THREE.Mesh(new THREE.ConeGeometry(.8,1.25,5,1,true),m);crown.position.y=2.55;g.add(crown);return g}
export function arena(scene:THREE.Scene,primary:string,accent:string,ground:string){scene.background=new THREE.Color('#101819');scene.fog=new THREE.Fog('#101819',25,58);const floor=new THREE.Mesh(new THREE.CylinderGeometry(24,24,.45,32),mat(ground));floor.position.y=-.3;floor.receiveShadow=true;scene.add(floor);const ring=new THREE.Mesh(new THREE.TorusGeometry(20,.12,5,48),mat(accent,accent));ring.rotation.x=Math.PI/2;ring.position.y=.01;scene.add(ring);for(let i=0;i<28;i++){const a=i/28*Math.PI*2,r=11+(i%4)*2.2,box=new THREE.Mesh(new THREE.BoxGeometry(.5+(i%3),.5+(i%4)*.35,.6),mat(i%3===0?primary:'#26332e'));box.position.set(Math.cos(a)*r,(box.geometry.parameters.height||1)/2,Math.sin(a)*r);box.rotation.y=-a+i*.3;box.castShadow=true;scene.add(box)}const grid=new THREE.GridHelper(40,20,new THREE.Color(primary),new THREE.Color('#283832'));(grid.material as THREE.Material).transparent=true;(grid.material as THREE.Material).opacity=.12;scene.add(grid)}
