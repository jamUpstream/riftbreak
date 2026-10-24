type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: 'landscape' | 'landscape-primary') => Promise<void>;
};

export function isPortraitViewport(){
  return matchMedia('(orientation: portrait)').matches;
}

export async function requestLandscape(options:{fullscreen?:boolean}={}){
  try{
    if(options.fullscreen&&!document.fullscreenElement&&document.documentElement.requestFullscreen){
      await document.documentElement.requestFullscreen({navigationUI:'hide'});
    }
  }catch{
    // Fullscreen is optional. Installed PWAs are already fullscreen.
  }
  try{
    const orientation=screen.orientation as LockableOrientation;
    await orientation.lock?.('landscape-primary');
    return !isPortraitViewport();
  }catch{
    return !isPortraitViewport();
  }
}

export function bindLandscapeGate(){
  const query=matchMedia('(orientation: portrait)');
  const sync=()=>document.documentElement.classList.toggle('portrait-viewport',query.matches);
  sync();
  query.addEventListener('change',sync);
  window.addEventListener('resize',sync,{passive:true});
  void requestLandscape();
}
