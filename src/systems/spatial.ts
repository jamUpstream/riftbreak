export class SpatialHash{
 private cells=new Map<string,number[]>(); constructor(private size=3){}
 clear(){this.cells.clear()}
 insert(id:number,x:number,z:number){const k=this.key(x,z);let a=this.cells.get(k);if(!a)this.cells.set(k,a=[]);a.push(id)}
 query(x:number,z:number,r:number){const out:number[]=[];const n=Math.ceil(r/this.size),cx=Math.floor(x/this.size),cz=Math.floor(z/this.size);for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++){const ids=this.cells.get(`${cx+a},${cz+b}`);if(ids)out.push(...ids)}return out}
 private key(x:number,z:number){return `${Math.floor(x/this.size)},${Math.floor(z/this.size)}`}
}
