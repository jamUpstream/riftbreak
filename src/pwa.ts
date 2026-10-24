interface BeforeInstallPromptEvent extends Event{
 prompt:()=>Promise<void>;
 userChoice:Promise<{outcome:'accepted'|'dismissed';platform:string}>;
}

let installPrompt:BeforeInstallPromptEvent|undefined;

export function isPwaInstalled(){
 return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;
}

export function canPromptInstall(){return !!installPrompt}

export async function promptPwaInstall(){
 if(isPwaInstalled())return 'installed' as const;
 if(!installPrompt)return 'unavailable' as const;
 const prompt=installPrompt;
 installPrompt=undefined;
 await prompt.prompt();
 const choice=await prompt.userChoice;
 window.dispatchEvent(new Event('pwa-install-state'));
 return choice.outcome;
}

export function registerPwa(){
 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  installPrompt=event as BeforeInstallPromptEvent;
  window.dispatchEvent(new Event('pwa-install-state'));
 });
 window.addEventListener('appinstalled',()=>{
  installPrompt=undefined;
  window.dispatchEvent(new Event('pwa-install-state'));
 });
 if(import.meta.env.PROD&&'serviceWorker' in navigator){
  window.addEventListener('load',()=>{
   const serviceWorkerUrl=new URL('sw.js',document.baseURI);
   navigator.serviceWorker.register(serviceWorkerUrl,{scope:'./'}).catch(error=>console.warn('Offline mode could not start.',error));
  },{once:true});
 }
}
