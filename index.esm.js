import{useMemo as r,useRef as e,useReducer as t,useCallback as n,useEffect as c}from"react";import o from"react-use/lib/useKey";import u from"react-use/lib/useVideo";module.exports.useVideo=u;const i=24,a=r=>new Promise((e,t)=>{const n=new Image;n.onload=()=>e({[r]:n}),n.onerror=r=>t(r),n.src=r}),s=(r,e)=>({...r,...e});function l(r){try{const e=r.split("/").pop(),[t]=e.split("."),[n]=/\d+/.exec(t);if(!n)throw Error();return parseInt(n,10)}catch(e){console.error(`"${r}" does not contain a valid frame index`)}}function m(r,e){return l(r)-l(e)}function d({playerId:u="anni-player",audioSrc:l,audioStart:d=0,fps:f=i,frames:g=[]}){const h=r(()=>g.sort(m),[g]),p=e(null),w=e(null),y=e(function(r){try{return parseInt(sessionStorage.getItem(r))||0}catch(r){return 0}}(u)),I=e(),A=e(null),[P,S]=t(s,{isPlaying:!1,htmlImageElements:[]});if(!w.current){const r=document.createElement("audio");r.src=l,r.currentTime=d,w.current=r}const{isPlaying:x}=P,F=n((r=.75)=>{w.current&&(w.current.volume=r)},[w]),b=n(()=>{w.current&&(w.current.muted=!w.current.muted)},[w]),v=n(r=>{if(!h[r]||!A.current)return;const e=p.current[h[r]],{width:t,height:n}=e,c=A.current;c.width=t,c.height=n,c.getContext("2d").drawImage(e,0,0,t,n,0,0,t,n)},[h,A,p]);function E(){const r=p.current&&Object.keys(p.current).length>0&&!x;S({isPlaying:r})}function V(r){S({isPlaying:!1}),y.current=r,v(r)}return c(()=>{A.current&&async function(){const r=await Promise.all(h.map(r=>a(r)));if(!r||0===r.length)return;p.current=r.reduce((r,e)=>({...r,...e}),{});const e=p.current[h[0]];if(!e)return;const{width:t,height:n}=e;S({frameSize:{width:t,height:n}}),v(y.current)}()},[g,A,h,v]),c(()=>{w.current&&(x&&w.current.paused?async function(){await w.current.play()}():x||w.current.paused||async function(){await w.current.pause()}())},[w,x]),c(()=>{if(x){let r,e,t=performance.now();const n=()=>{if(!x)return;r=performance.now(),e=r-t;const c=Math.round(1e3/f);if(e>c){const e=y.current;t=r;const n=e===g.length-1?0:e+1;0===n&&(w.current.currentTime=d),y.current=n,v(y.current)}I.current=requestAnimationFrame(n)};n()}else I.current&&cancelAnimationFrame(I.current);return()=>{I.current&&cancelAnimationFrame(I.current),sessionStorage.setItem(u,y.current)}},[f,g,p,v,u,x]),o(r=>"Space"===r.code,E),o(r=>"ArrowRight"===r.code,function(){const r=y.current;V(r===g.length-1?0:r+1)}),o(r=>"ArrowLeft"===r.code,function(){const r=y.current;V(0===r?g.length-1:r-1)}),{...P,canvasRef:A,togglePlay:E,sortedFrames:h,audio:w.current,toggleMuteAudio:b,setAudioVolume:F}}export{l as extractFrameIndexFromPath,d as useCanvasScrubber};
