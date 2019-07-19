import{useMemo as e,useRef as r,useReducer as t,useCallback as n,useEffect as c}from"react";import u from"react-use/lib/useKey";import o from"react-use/lib/useVideo";module.exports.useVideo=o;const i=24,s=e=>new Promise((r,t)=>{const n=new Image;n.onload=()=>r({[e]:n}),n.onerror=e=>t(e),n.src=e}),a=(e,r)=>({...e,...r});function l(e){try{const r=e.split("/").pop(),[t]=r.split("."),[n]=/\d+/.exec(t);if(!n)throw Error();return parseInt(n,10)}catch(r){console.error(`"${e}" does not contain a valid frame index`)}}function m(e,r){return l(e)-l(r)}function d({playerId:o="anni-player",audioSrc:l,audioStart:d=0,fps:f=i,frames:g=[]}){const h=e(()=>g.sort(m),[g]),p=r(null),w=r(null),y=r(function(e){try{return parseInt(sessionStorage.getItem(e))||0}catch(e){return 0}}(o)),I=r(),A=r(null),[P,S]=t(a,{isPlaying:!1,isMuted:!1,volume:.75,htmlImageElements:[]});if(!w.current){const e=document.createElement("audio");e.src=l,e.currentTime=d,w.current=e}const{isPlaying:v}=P,x=n((e=.75)=>{w.current&&(S({volume:e}),w.current.volume=e)},[w]),F=n(()=>{if(!w.current)return;const e=!w.current.muted;S({isMuted:e}),w.current.muted=e},[w]),M=n(e=>{if(!h[e]||!A.current)return;const r=p.current[h[e]],{width:t,height:n}=r,c=A.current;c.width=t,c.height=n,c.getContext("2d").drawImage(r,0,0,t,n,0,0,t,n)},[h,A,p]);function b(){const e=p.current&&Object.keys(p.current).length>0&&!v;S({isPlaying:e})}function E(e){S({isPlaying:!1}),y.current=e,M(e)}return c(()=>{A.current&&async function(){const e=await Promise.all(h.map(e=>s(e)));if(!e||0===e.length)return;p.current=e.reduce((e,r)=>({...e,...r}),{});const r=p.current[h[0]];if(!r)return;const{width:t,height:n}=r;S({frameSize:{width:t,height:n}}),M(y.current)}()},[g,A,h,M]),c(()=>{w.current&&(v&&w.current.paused?async function(){await w.current.play()}():v||w.current.paused||async function(){await w.current.pause()}())},[w,v]),c(()=>{if(v){let e,r,t=performance.now();const n=()=>{if(!v)return;e=performance.now(),r=e-t;const c=Math.round(1e3/f);if(r>c){const r=y.current;t=e;const n=r===g.length-1?0:r+1;0===n&&(w.current.currentTime=d),y.current=n,M(y.current)}I.current=requestAnimationFrame(n)};n()}else I.current&&cancelAnimationFrame(I.current);return()=>{I.current&&cancelAnimationFrame(I.current),sessionStorage.setItem(o,y.current)}},[f,g,p,M,o,v]),u(e=>"Space"===e.code,b),u(e=>"ArrowRight"===e.code,function(){const e=y.current;E(e===g.length-1?0:e+1)}),u(e=>"ArrowLeft"===e.code,function(){const e=y.current;E(0===e?g.length-1:e-1)}),{...P,canvasRef:A,togglePlay:b,sortedFrames:h,toggleMuteAudio:F,setAudioVolume:x}}export{l as extractFrameIndexFromPath,d as useCanvasScrubber};
