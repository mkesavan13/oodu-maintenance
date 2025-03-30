(()=>{var e={7020:()=>{self.addEventListener("message",(function(e){console.log("Worker received message:",e.data),"start"===e.data&&setInterval((function(){self.postMessage("keepAlive"),console.log("Worker sent keepAlive message")}),3e5)}))}},r={};function n(t){var o=r[t];if(void 0!==o){if(void 0!==o.error)throw o.error;return o.exports}var i=r[t]={exports:{}};try{var c={id:t,module:i,factory:e[t],require:n};n.i.forEach((function(e){e(c)})),i=c.module,c.factory.call(i.exports,i,i.exports,c.require)}catch(e){throw i.error=e,e}return i.exports}n.m=e,n.c=r,n.i=[],n.hu=e=>e+"."+n.h()+".hot-update.js",n.hmrF=()=>"0c4d27a2b526cb33e1fb."+n.h()+".hot-update.json",n.h=()=>"431a64f4da8221750fb9",n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r),(()=>{var e,r,t,o={},i=n.c,c=[],d=[],a="idle",s=0,u=[];function l(e){a=e;for(var r=[],n=0;n<d.length;n++)r[n]=d[n].call(null,e);return Promise.all(r).then((function(){}))}function f(){0==--s&&l("ready").then((function(){if(0===s){var e=u;u=[];for(var r=0;r<e.length;r++)e[r]()}}))}function p(e){if("idle"!==a)throw new Error("check() is only allowed in idle status");return l("check").then(n.hmrM).then((function(t){return t?l("prepare").then((function(){var o=[];return r=[],Promise.all(Object.keys(n.hmrC).reduce((function(e,i){return n.hmrC[i](t.c,t.r,t.m,e,r,o),e}),[])).then((function(){return r=function(){return e?v(e):l("ready").then((function(){return o}))},0===s?r():new Promise((function(e){u.push((function(){e(r())}))}));var r}))})):l(m()?"ready":"idle").then((function(){return null}))}))}function h(e){return"ready"!==a?Promise.resolve().then((function(){throw new Error("apply() is only allowed in ready status (state: "+a+")")})):v(e)}function v(e){e=e||{},m();var n=r.map((function(r){return r(e)}));r=void 0;var o=n.map((function(e){return e.error})).filter(Boolean);if(o.length>0)return l("abort").then((function(){throw o[0]}));var i=l("dispose");n.forEach((function(e){e.dispose&&e.dispose()}));var c,d=l("apply"),a=function(e){c||(c=e)},s=[];return n.forEach((function(e){if(e.apply){var r=e.apply(a);if(r)for(var n=0;n<r.length;n++)s.push(r[n])}})),Promise.all([i,d]).then((function(){return c?l("fail").then((function(){throw c})):t?v(e).then((function(e){return s.forEach((function(r){e.indexOf(r)<0&&e.push(r)})),e})):l("idle").then((function(){return s}))}))}function m(){if(t)return r||(r=[]),Object.keys(n.hmrI).forEach((function(e){t.forEach((function(t){n.hmrI[e](t,r)}))})),t=void 0,!0}n.hmrD=o,n.i.push((function(u){var v,m,y,g,w=u.module,E=function(r,n){var t=i[n];if(!t)return r;var o=function(o){if(t.hot.active){if(i[o]){var d=i[o].parents;-1===d.indexOf(n)&&d.push(n)}else c=[n],e=o;-1===t.children.indexOf(o)&&t.children.push(o)}else console.warn("[HMR] unexpected require("+o+") from disposed module "+n),c=[];return r(o)},d=function(e){return{configurable:!0,enumerable:!0,get:function(){return r[e]},set:function(n){r[e]=n}}};for(var u in r)Object.prototype.hasOwnProperty.call(r,u)&&"e"!==u&&Object.defineProperty(o,u,d(u));return o.e=function(e,n){return function(e){switch(a){case"ready":l("prepare");case"prepare":return s++,e.then(f,f),e;default:return e}}(r.e(e,n))},o}(u.require,u.id);w.hot=(v=u.id,m=w,g={_acceptedDependencies:{},_acceptedErrorHandlers:{},_declinedDependencies:{},_selfAccepted:!1,_selfDeclined:!1,_selfInvalidated:!1,_disposeHandlers:[],_main:y=e!==v,_requireSelf:function(){c=m.parents.slice(),e=y?void 0:v,n(v)},active:!0,accept:function(e,r,n){if(void 0===e)g._selfAccepted=!0;else if("function"==typeof e)g._selfAccepted=e;else if("object"==typeof e&&null!==e)for(var t=0;t<e.length;t++)g._acceptedDependencies[e[t]]=r||function(){},g._acceptedErrorHandlers[e[t]]=n;else g._acceptedDependencies[e]=r||function(){},g._acceptedErrorHandlers[e]=n},decline:function(e){if(void 0===e)g._selfDeclined=!0;else if("object"==typeof e&&null!==e)for(var r=0;r<e.length;r++)g._declinedDependencies[e[r]]=!0;else g._declinedDependencies[e]=!0},dispose:function(e){g._disposeHandlers.push(e)},addDisposeHandler:function(e){g._disposeHandlers.push(e)},removeDisposeHandler:function(e){var r=g._disposeHandlers.indexOf(e);r>=0&&g._disposeHandlers.splice(r,1)},invalidate:function(){switch(this._selfInvalidated=!0,a){case"idle":r=[],Object.keys(n.hmrI).forEach((function(e){n.hmrI[e](v,r)})),l("ready");break;case"ready":Object.keys(n.hmrI).forEach((function(e){n.hmrI[e](v,r)}));break;case"prepare":case"check":case"dispose":case"apply":(t=t||[]).push(v)}},check:p,apply:h,status:function(e){if(!e)return a;d.push(e)},addStatusHandler:function(e){d.push(e)},removeStatusHandler:function(e){var r=d.indexOf(e);r>=0&&d.splice(r,1)},data:o[v]},e=void 0,g),w.parents=c,w.children=[],c=[],u.require=E})),n.hmrC={},n.hmrI={}})(),(()=>{var e;n.g.importScripts&&(e=n.g.location+"");var r=n.g.document;if(!e&&r&&(r.currentScript&&"SCRIPT"===r.currentScript.tagName.toUpperCase()&&(e=r.currentScript.src),!e)){var t=r.getElementsByTagName("script");if(t.length)for(var o=t.length-1;o>-1&&(!e||!/^http(s?):/.test(e));)e=t[o--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/^blob:/,"").replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),n.p=e})(),(()=>{var e,r,t,o,i=n.hmrS_importScripts=n.hmrS_importScripts||{20:1,639:1};function c(e,t){var i=!1;if(self.webpackHotUpdateoodu_maintenance=(e,c,d)=>{for(var a in c)n.o(c,a)&&(r[a]=c[a],t&&t.push(a));d&&o.push(d),i=!0},importScripts(n.p+n.hu(e)),!i)throw new Error("Loading update chunk failed for unknown reason")}function d(c){function d(e){for(var r=[e],t={},o=r.map((function(e){return{chain:[e],id:e}}));o.length>0;){var i=o.pop(),c=i.id,d=i.chain,s=n.c[c];if(s&&(!s.hot._selfAccepted||s.hot._selfInvalidated)){if(s.hot._selfDeclined)return{type:"self-declined",chain:d,moduleId:c};if(s.hot._main)return{type:"unaccepted",chain:d,moduleId:c};for(var u=0;u<s.parents.length;u++){var l=s.parents[u],f=n.c[l];if(f){if(f.hot._declinedDependencies[c])return{type:"declined",chain:d.concat([l]),moduleId:c,parentId:l};-1===r.indexOf(l)&&(f.hot._acceptedDependencies[c]?(t[l]||(t[l]=[]),a(t[l],[c])):(delete t[l],r.push(l),o.push({chain:d.concat([l]),id:l})))}}}}return{type:"accepted",moduleId:e,outdatedModules:r,outdatedDependencies:t}}function a(e,r){for(var n=0;n<r.length;n++){var t=r[n];-1===e.indexOf(t)&&e.push(t)}}n.f&&delete n.f.importScriptsHmr,e=void 0;var s={},u=[],l={},f=function(e){console.warn("[HMR] unexpected require("+e.id+") to disposed module")};for(var p in r)if(n.o(r,p)){var h=r[p],v=h?d(p):{type:"disposed",moduleId:p},m=!1,y=!1,g=!1,w="";switch(v.chain&&(w="\nUpdate propagation: "+v.chain.join(" -> ")),v.type){case"self-declined":c.onDeclined&&c.onDeclined(v),c.ignoreDeclined||(m=new Error("Aborted because of self decline: "+v.moduleId+w));break;case"declined":c.onDeclined&&c.onDeclined(v),c.ignoreDeclined||(m=new Error("Aborted because of declined dependency: "+v.moduleId+" in "+v.parentId+w));break;case"unaccepted":c.onUnaccepted&&c.onUnaccepted(v),c.ignoreUnaccepted||(m=new Error("Aborted because "+p+" is not accepted"+w));break;case"accepted":c.onAccepted&&c.onAccepted(v),y=!0;break;case"disposed":c.onDisposed&&c.onDisposed(v),g=!0;break;default:throw new Error("Unexception type "+v.type)}if(m)return{error:m};if(y)for(p in l[p]=h,a(u,v.outdatedModules),v.outdatedDependencies)n.o(v.outdatedDependencies,p)&&(s[p]||(s[p]=[]),a(s[p],v.outdatedDependencies[p]));g&&(a(u,[v.moduleId]),l[p]=f)}r=void 0;for(var E,_=[],b=0;b<u.length;b++){var I=u[b],D=n.c[I];D&&(D.hot._selfAccepted||D.hot._main)&&l[I]!==f&&!D.hot._selfInvalidated&&_.push({module:I,require:D.hot._requireSelf,errorHandler:D.hot._selfAccepted})}return{dispose:function(){var e;t.forEach((function(e){delete i[e]})),t=void 0;for(var r,o=u.slice();o.length>0;){var c=o.pop(),d=n.c[c];if(d){var a={},l=d.hot._disposeHandlers;for(b=0;b<l.length;b++)l[b].call(null,a);for(n.hmrD[c]=a,d.hot.active=!1,delete n.c[c],delete s[c],b=0;b<d.children.length;b++){var f=n.c[d.children[b]];f&&(e=f.parents.indexOf(c))>=0&&f.parents.splice(e,1)}}}for(var p in s)if(n.o(s,p)&&(d=n.c[p]))for(E=s[p],b=0;b<E.length;b++)r=E[b],(e=d.children.indexOf(r))>=0&&d.children.splice(e,1)},apply:function(e){for(var r in l)n.o(l,r)&&(n.m[r]=l[r]);for(var t=0;t<o.length;t++)o[t](n);for(var i in s)if(n.o(s,i)){var d=n.c[i];if(d){E=s[i];for(var a=[],f=[],p=[],h=0;h<E.length;h++){var v=E[h],m=d.hot._acceptedDependencies[v],y=d.hot._acceptedErrorHandlers[v];if(m){if(-1!==a.indexOf(m))continue;a.push(m),f.push(y),p.push(v)}}for(var g=0;g<a.length;g++)try{a[g].call(null,E)}catch(r){if("function"==typeof f[g])try{f[g](r,{moduleId:i,dependencyId:p[g]})}catch(n){c.onErrored&&c.onErrored({type:"accept-error-handler-errored",moduleId:i,dependencyId:p[g],error:n,originalError:r}),c.ignoreErrored||(e(n),e(r))}else c.onErrored&&c.onErrored({type:"accept-errored",moduleId:i,dependencyId:p[g],error:r}),c.ignoreErrored||e(r)}}}for(var w=0;w<_.length;w++){var b=_[w],I=b.module;try{b.require(I)}catch(r){if("function"==typeof b.errorHandler)try{b.errorHandler(r,{moduleId:I,module:n.c[I]})}catch(n){c.onErrored&&c.onErrored({type:"self-accept-error-handler-errored",moduleId:I,error:n,originalError:r}),c.ignoreErrored||(e(n),e(r))}else c.onErrored&&c.onErrored({type:"self-accept-errored",moduleId:I,error:r}),c.ignoreErrored||e(r)}}return u}}}n.hmrI.importScripts=function(e,i){r||(r={},o=[],t=[],i.push(d)),n.o(r,e)||(r[e]=n.m[e])},n.hmrC.importScripts=function(a,s,u,l,f,p){f.push(d),e={},t=s,r=u.reduce((function(e,r){return e[r]=!1,e}),{}),o=[],a.forEach((function(r){n.o(i,r)&&void 0!==i[r]?(l.push(c(r,p)),e[r]=!0):e[r]=!1})),n.f&&(n.f.importScriptsHmr=function(r,t){e&&n.o(e,r)&&!e[r]&&(t.push(c(r)),e[r]=!0)})},n.hmrM=()=>{if("undefined"==typeof fetch)throw new Error("No browser support: need fetch API");return fetch(n.p+n.hmrF()).then((e=>{if(404!==e.status){if(!e.ok)throw new Error("Failed to fetch update manifest "+e.statusText);return e.json()}}))}})(),n(7020)})();