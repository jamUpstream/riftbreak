export const MAX_ENEMIES=300,MAX_BULLETS=600;
export function damage(physical:number,elemental:number,multiplier=1,critical=false,critDamage=1.5){return(physical+elemental)*multiplier*(critical?critDamage:1)}
