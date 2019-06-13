"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var react=require("react");const DEFAULT_FPS=24,preloadImagePromise=e=>new Promise((r,t)=>{const n=new Image;n.onload=()=>r({[e]:n}),n.onerror=e=>t(e),n.src=e}),reducer=(e,r)=>({...e,...r});function extractFrameIndexFromPath(e){try{const r=e.split("/").pop(),[t]=r.split("."),[n]=/\d+/.exec(t);if(!n)throw Error();return parseInt(n,10)}catch(r){console.error(`"${e}" does not contain a valid frame index`)}}function sortFramesAscending(e,r){return extractFrameIndexFromPath(e)-extractFrameIndexFromPath(r)}function getPlayerInitialFrameIndex(e){try{return parseInt(sessionStorage.getItem(e))||0}catch(e){return 0}}function useCanvasScrubber({playerId:e="anni-player",fps:r=DEFAULT_FPS,frames:t=[]}){const n=react.useMemo(()=>t.sort(sortFramesAscending),[t]),a=react.useRef(null),c=react.useRef(getPlayerInitialFrameIndex(e)),s=react.useRef(),o=react.useRef(null),[u,i]=react.useReducer(reducer,{isPlaying:!1,htmlImageElements:[]}),{isPlaying:m}=u,l=react.useCallback(e=>{if(!n[e]||!o.current)return;const r=a.current[n[e]],{width:t,height:c}=r,s=o.current;s.width=t,s.height=c,s.getContext("2d").drawImage(r,0,0,t,c,0,0,t,c)},[n,o,a]);return react.useEffect(()=>{o.current&&async function(){const e=await Promise.all(n.map(e=>preloadImagePromise(e)));if(!e||0===e.length)return;a.current=e.reduce((e,r)=>({...e,...r}),{});const r=a.current[n[0]];if(!r)return;const{width:t,height:s}=r;i({frameSize:{width:t,height:s}}),l(c.current)}()},[t,o,n,l]),react.useEffect(()=>{if(m){let e,n,a=performance.now();const o=()=>{if(!m)return;e=performance.now(),n=e-a;const u=Math.round(1e3/r);if(n>u){const r=c.current;a=e,c.current=r===t.length-1?0:r+1,l(c.current)}s.current=requestAnimationFrame(o)};o()}else s.current&&cancelAnimationFrame(s.current);return()=>{s.current&&cancelAnimationFrame(s.current),sessionStorage.setItem(e,c.current)}},[r,t,a,l,e,m]),{...u,canvasRef:o,togglePlay:function(){const e=a.current&&Object.keys(a.current).length>0&&!m;i({isPlaying:e})},sortedFrames:n}}exports.extractFrameIndexFromPath=extractFrameIndexFromPath,exports.default=useCanvasScrubber;
