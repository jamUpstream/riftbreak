export const stageHP=(base:number,stageMult:number,minute:number)=>base*stageMult*(1+.12*minute);
export const stageATK=(base:number,stageMult:number,minute:number)=>base*stageMult*(1+.08*minute);
export const endlessStat=(base:number,minute:number)=>base*Math.pow(1.15,minute);
