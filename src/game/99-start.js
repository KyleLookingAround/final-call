/*SIM_HOOK*/
const hot=window.claude?.hot;
if(hot&&typeof hot.ready==='function')hot.ready(start);else start(hot?.data??{});
