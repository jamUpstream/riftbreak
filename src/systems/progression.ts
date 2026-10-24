export const STAR_THRESHOLDS=[0,500,1500,4000,10000] as const;
export const xpToNext=(level:number)=>10+6*level;
export const starForExp=(xp:number)=>xp>=10000?5:xp>=4000?4:xp>=1500?3:xp>=500?2:1;
export const enemyScale=(stageMult:number,minute:number,endless=false)=>endless?Math.pow(1.15,minute):stageMult*(1+.12*minute);
