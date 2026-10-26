export type Screen='menu'|'stages'|'characters'|'game'|'cards'|'results'|'settings';
export interface Vec2{x:number;z:number}
export type ControlId='move'|'aim'|'dash'|'skill'|'autofire';
export type ControlOrientation='portrait'|'landscape';
export interface ControlPoint{x:number;y:number;size:number;opacity:number}
export type ControlPositions=Record<ControlId,ControlPoint>;
export interface ControlLayout{portrait:ControlPositions;landscape:ControlPositions}
export type GraphicsQuality='low'|'balanced'|'high';
export interface GameSettings{screenShake:boolean;shakeStrength:number;graphics:GraphicsQuality;effects:boolean;shadows:boolean;frameRate:30|60}
export interface CareerStats{runs:number;victories:number;kills:number;bosses:number;coinsCollected:number;timePlayed:number;highestLevel:number;cardsPicked:number}
export const DEFAULT_GAME_SETTINGS:GameSettings={screenShake:true,shakeStrength:.72,graphics:'balanced',effects:true,shadows:true,frameRate:60};
export const DEFAULT_CONTROL_LAYOUT:ControlLayout={
 portrait:{move:{x:.17,y:.82,size:1,opacity:1},aim:{x:.83,y:.82,size:1,opacity:1},dash:{x:.55,y:.82,size:1,opacity:1},skill:{x:.59,y:.62,size:1,opacity:1},autofire:{x:.17,y:.61,size:1,opacity:1}},
 landscape:{move:{x:.08,y:.82,size:1,opacity:1},aim:{x:.92,y:.82,size:1,opacity:1},dash:{x:.82,y:.82,size:1,opacity:1},skill:{x:.82,y:.59,size:1,opacity:1},autofire:{x:.08,y:.59,size:1,opacity:1}}
};
export interface SaveData{coins:number;bestStage:number;endlessTime:number;selectedCharacter:string;characterExp:Record<string,number>;talents:Record<string,string[]>;equipped:Record<string,string[]>;controlLayout:ControlLayout;settings:GameSettings;stats:CareerStats;unlockedAchievements:string[];claimedChallenges:string[]}
export const DEFAULT_SAVE:SaveData={coins:250,bestStage:0,endlessTime:0,selectedCharacter:'vex',characterExp:{vex:0,mira:0,orrin:0,sable:0,juno:0,kade:0},talents:{},equipped:{},controlLayout:structuredClone(DEFAULT_CONTROL_LAYOUT),settings:structuredClone(DEFAULT_GAME_SETTINGS),stats:{runs:0,victories:0,kills:0,bosses:0,coinsCollected:0,timePlayed:0,highestLevel:1,cardsPicked:0},unlockedAchievements:[],claimedChallenges:[]};
