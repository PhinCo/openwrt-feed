(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["about"],{"02f4":function(e,t,n){var r=n("4588"),i=n("be13");e.exports=function(e){return function(t,n){var o,a,s=String(i(t)),l=r(n),c=s.length;return l<0||l>=c?e?"":void 0:(o=s.charCodeAt(l),o<55296||o>56319||l+1===c||(a=s.charCodeAt(l+1))<56320||a>57343?e?s.charAt(l):o:e?s.slice(l,l+2):a-56320+(o-55296<<10)+65536)}}},"0390":function(e,t,n){"use strict";var r=n("02f4")(!0);e.exports=function(e,t,n){return t+(n?r(e,t).length:1)}},"0bfb":function(e,t,n){"use strict";var r=n("cb7c");e.exports=function(){var e=r(this),t="";return e.global&&(t+="g"),e.ignoreCase&&(t+="i"),e.multiline&&(t+="m"),e.unicode&&(t+="u"),e.sticky&&(t+="y"),t}},"0ef7":function(e,t,n){"use strict";var r=n("5b4ef"),i=n.n(r);i.a},"1e13":function(e,t,n){},"214f":function(e,t,n){"use strict";n("b0c5");var r=n("2aba"),i=n("32e9"),o=n("79e5"),a=n("be13"),s=n("2b4c"),l=n("520a"),c=s("species"),u=!o(function(){var e=/./;return e.exec=function(){var e=[];return e.groups={a:"7"},e},"7"!=="".replace(e,"$<a>")}),d=function(){var e=/(?:)/,t=e.exec;e.exec=function(){return t.apply(this,arguments)};var n="ab".split(e);return 2===n.length&&"a"===n[0]&&"b"===n[1]}();e.exports=function(e,t,n){var f=s(e),v=!o(function(){var t={};return t[f]=function(){return 7},7!=""[e](t)}),p=v?!o(function(){var t=!1,n=/a/;return n.exec=function(){return t=!0,null},"split"===e&&(n.constructor={},n.constructor[c]=function(){return n}),n[f](""),!t}):void 0;if(!v||!p||"replace"===e&&!u||"split"===e&&!d){var g=/./[f],m=n(a,f,""[e],function(e,t,n,r,i){return t.exec===l?v&&!i?{done:!0,value:g.call(t,n,r)}:{done:!0,value:e.call(n,t,r)}:{done:!1}}),h=m[0],b=m[1];r(String.prototype,e,h),i(RegExp.prototype,f,2==t?function(e,t){return b.call(e,this,t)}:function(e){return b.call(e,this)})}}},"2c27":function(e,t,n){"use strict";var r=n("ac06"),i=n.n(r);i.a},4917:function(e,t,n){"use strict";var r=n("cb7c"),i=n("9def"),o=n("0390"),a=n("5f1b");n("214f")("match",1,function(e,t,n,s){return[function(n){var r=e(this),i=void 0==n?void 0:n[t];return void 0!==i?i.call(n,r):new RegExp(n)[t](String(r))},function(e){var t=s(n,e,this);if(t.done)return t.value;var l=r(e),c=String(this);if(!l.global)return a(l,c);var u=l.unicode;l.lastIndex=0;var d,f=[],v=0;while(null!==(d=a(l,c))){var p=String(d[0]);f[v]=p,""===p&&(l.lastIndex=o(c,i(l.lastIndex),u)),v++}return 0===v?null:f}]})},"520a":function(e,t,n){"use strict";var r=n("0bfb"),i=RegExp.prototype.exec,o=String.prototype.replace,a=i,s="lastIndex",l=function(){var e=/a/,t=/b*/g;return i.call(e,"a"),i.call(t,"a"),0!==e[s]||0!==t[s]}(),c=void 0!==/()??/.exec("")[1],u=l||c;u&&(a=function(e){var t,n,a,u,d=this;return c&&(n=new RegExp("^"+d.source+"$(?!\\s)",r.call(d))),l&&(t=d[s]),a=i.call(d,e),l&&a&&(d[s]=d.global?a.index+a[0].length:t),c&&a&&a.length>1&&o.call(a[0],n,function(){for(u=1;u<arguments.length-2;u++)void 0===arguments[u]&&(a[u]=void 0)}),a}),e.exports=a},"55dd":function(e,t,n){"use strict";var r=n("5ca1"),i=n("d8e8"),o=n("4bf8"),a=n("79e5"),s=[].sort,l=[1,2,3];r(r.P+r.F*(a(function(){l.sort(void 0)})||!a(function(){l.sort(null)})||!n("2f21")(s)),"Array",{sort:function(e){return void 0===e?s.call(o(this)):s.call(o(this),i(e))}})},"573f":function(e,t,n){},5786:function(e,t,n){"use strict";n.r(t);var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("h2",[e._v("WIFI - "+e._s(e.loadingMessage)+" "+e._s(e.networkStatusMessage)+"\n    "),n("refresher",{attrs:{label:"scan"},on:{onrefresh:e.scanForWifiAccessPoints}})],1),e.availableNetworks.length>0?n("h3",[e._v(" Available networks ")]):e._e(),n("ul",{staticClass:"ssidList"},e._l(e.availableNetworks,function(t){return n("li",{key:t.ssid},[n("scanner-result",{attrs:{ssid:t.ssid,current:t.current,rssi:t.rssi,encryption:t.encryption},on:{selectWifi:e.selectWifi}})],1)}),0),e.configuringWifi?n("wifi-configuator",{attrs:{ssid:e.wifiToConfigure.ssid,encryption:e.wifiToConfigure.encryption,current:e.wifiToConfigure.current,errorMessage:e.errorMessage},on:{select:e.configure,cancel:e.cancelConfig}}):e._e()],1)},i=[],o=(n("96cf"),n("3b8d")),a=n("cebc"),s=n("2f62"),l=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("span",{staticClass:"scannerResult",on:{click:e.showWifiSelect}},[n("span",[n("WirelessIcon",{attrs:{signal:Number(e.rssi)}})],1),e.current?n("span",{staticClass:"connected"},[e._v("✓ CONNECTED TO: "+e._s(e.ssid))]):e._e(),e.current?e._e():n("span",[e._v(e._s(e.ssid))])])},c=[],u=n("e2af"),d={name:"ScannerResult",components:{WirelessIcon:u["a"]},props:{ssid:{type:String,required:!0},current:{type:Boolean,required:!1},rssi:{type:String,required:!0},encryption:{type:String,required:!0}},methods:{showWifiSelect:function(){var e=this.ssid,t=this.current,n=this.rssi,r=this.encryption;this.$emit("selectWifi",{ssid:e,current:t,rssi:n,encryption:r})}}},f=d,v=(n("cf3a"),n("2877")),p=Object(v["a"])(f,l,c,!1,null,null,null),g=p.exports,m=n("af23"),h=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"popupFormOverlayContainer"},[n("div",{staticClass:"popUpForm",attrs:{id:"wifiSelectContent"}},[e.current?n("div",{staticClass:"note"},[e._v(" You are currently connected to this network. Use this if you want to change the auth key")]):e._e(),n("ul",[n("li",[e._v(" Connect to  ")]),n("li",[n("strong",[e._v(" "+e._s(e.ssid)+" ")])]),n("li",[e._v(" please enter your network key ")]),n("li",[n("input",{directives:[{name:"model",rawName:"v-model",value:e.key,expression:"key"}],attrs:{name:"wifikey",type:"password"},domProps:{value:e.key},on:{input:function(t){t.target.composing||(e.key=t.target.value)}}})]),n("li",[n("span",{staticClass:"fieldError"},[e._v(" "+e._s(e.errorMessage)+" ")])])]),n("br"),n("div",{staticClass:"buttons"},[n("input",{staticClass:"btn",attrs:{type:"button",value:"Connect"},on:{click:e.selectWifi}}),n("input",{staticClass:"btn",attrs:{type:"button",value:"Cancel"},on:{click:e.cancel}})])])])},b=[],_={name:"WifiConfiguator",props:{ssid:{type:String,required:!0},encryption:{type:String,required:!0},current:{type:Boolean},errorMessage:{type:String,required:!1}},data:function(){return{key:""}},methods:{selectWifi:function(){var e=Math.floor((new Date).getTime()/1e3)+"",t=this.ssid,n=this.encryption,r=this.current,i=this.key;this.$emit("select",{ssid:t,encryption:n,current:r,key:i,epoch:e})},cancel:function(){this.$emit("cancel")}}},w=_,I=Object(v["a"])(w,h,b,!1,null,null,null),S=I.exports,y={name:"WifiScanner",components:{ScannerResult:g,Refresher:m["a"],WifiConfiguator:S},data:function(){return{configuringWifi:!1,loadingMessage:"",errorMessage:"",wifiToConfigure:{}}},computed:Object(a["a"])({},Object(s["c"])({wifiScanner:function(e){return e.wifiScanner},currentNetwork:function(e){return e.currentNetwork},networkStatusMessage:function(e){return e.networkStatusMessage},status:function(e){return e.wifiScanner.status},ssids:function(e){return e.wifiScanner.ssids},availableNetworks:function(e){return e.wifiScanner.availableNetworks}})),methods:Object(a["a"])({},Object(s["b"])(["scanForWifiAccessPoints","configureWifi","getWifiStatus"]),{selectWifi:function(e){var t=e.ssid,n=e.encryption,r=e.current;this.errorMessage="",this.wifiToConfigure={ssid:t,encryption:n,current:r},this.configuringWifi=!0},configure:function(){var e=Object(o["a"])(regeneratorRuntime.mark(function e(t){var n,r,i,o,a,s;return regeneratorRuntime.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return n=t.ssid,r=t.encryption,i=t.current,o=t.key,a=t.epoch,this.errorMessage="",e.next=4,this.configureWifi({ssid:n,encryption:r,current:i,key:o,epoch:a});case 4:s=e.sent,s.success?this.configuringWifi=!1:this.errorMessage="failed to connect to ".concat(n);case 6:case"end":return e.stop()}},e,this)}));function t(t){return e.apply(this,arguments)}return t}(),cancelConfig:function(){this.configuringWifi=!1}}),mounted:function(){var e=Object(o["a"])(regeneratorRuntime.mark(function e(){return regeneratorRuntime.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return this.loadingMessage="loading info...",e.next=3,this.getWifiStatus();case 3:this.loadingMessage="";case 4:case"end":return e.stop()}},e,this)}));function t(){return e.apply(this,arguments)}return t}()},L=y,C=(n("aa92"),Object(v["a"])(L,r,i,!1,null,null,null));t["default"]=C.exports},"5b4ef":function(e,t,n){},"5f1b":function(e,t,n){"use strict";var r=n("23c6"),i=RegExp.prototype.exec;e.exports=function(e,t){var n=e.exec;if("function"===typeof n){var o=n.call(e,t);if("object"!==typeof o)throw new TypeError("RegExp exec method returned something other than an Object or null");return o}if("RegExp"!==r(e))throw new TypeError("RegExp#exec called on incompatible receiver");return i.call(e,t)}},"677d":function(e,t,n){"use strict";var r=n("1e13"),i=n.n(r);i.a},"6ad4":function(e,t,n){"use strict";var r=n("a6ed"),i=n.n(r);i.a},"8c41":function(e,t,n){},9240:function(e,t,n){},"9cc1":function(e,t,n){"use strict";var r=n("573f"),i=n.n(r);i.a},a6ed:function(e,t,n){},aa92:function(e,t,n){"use strict";var r=n("9240"),i=n.n(r);i.a},ab72:function(e,t,n){},ac06:function(e,t,n){},af23:function(e,t,n){"use strict";var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"refresher",attrs:{title:e.label},on:{click:function(t){return e.$emit("onrefresh")}}},[n("span",{staticClass:"refresherIcon"},[e._v("↻")]),n("span",{staticClass:"refreshLabel"},[e._v(e._s(e.label))])])},i=[],o={name:"Refresher",props:{label:{type:String,required:!1}}},a=o,s=(n("9cc1"),n("2877")),l=Object(s["a"])(a,r,i,!1,null,null,null);t["a"]=l.exports},b0c5:function(e,t,n){"use strict";var r=n("520a");n("5ca1")({target:"RegExp",proto:!0,forced:r!==/./.exec},{exec:r})},b587:function(e,t,n){"use strict";var r=n("ab72"),i=n.n(r);i.a},b720:function(e,t,n){"use strict";var r=n("e3f4"),i=n.n(r);i.a},bbae:function(e,t,n){"use strict";n.r(t);var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"logView"},[n("div",[n("refresher",{staticClass:"logRefresher",attrs:{label:"refresh logs"},on:{onrefresh:e.refreshLogs}}),n("label",{attrs:{for:"recordCount"}},[e._v(" Count of records to show: ")]),n("select",{directives:[{name:"model",rawName:"v-model",value:e.recordCount,expression:"recordCount"}],attrs:{name:"recordCount"},on:{change:function(t){var n=Array.prototype.filter.call(t.target.options,function(e){return e.selected}).map(function(e){var t="_value"in e?e._value:e.value;return t});e.recordCount=t.target.multiple?n:n[0]}}},e._l(e.recordCounts,function(t){return n("option",{key:t,domProps:{value:t}},[e._v("\n        "+e._s(t)+"\n      ")])}),0)],1),n("LogSettings"),n("ul",{staticClass:"logData devInfoDetail"},e._l(e.records,function(t,r){return n("li",{key:r},[e._v("\n    "+e._s(t)+"\n  ")])}),0)],1)},i=[],o=n("cebc"),a=n("2f62"),s=n("af23"),l=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"logSettings"},[n("h3",[n("a",{on:{click:e.hide}},[n("span",{domProps:{innerHTML:e._s(e.buttonsymbol)}}),e._v(" Log Module Levels ")])]),n("div",{ref:"logModules",staticClass:"logModules"},e._l(e.sortedLogModules,function(e,t){return n("div",{key:t,staticClass:"logModule"},[n("LogModule",{attrs:{moduleName:e.moduleName,logLevel:e.logLevel}})],1)}),0)])},c=[],u=(n("55dd"),function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"logModule"},[n("label",{attrs:{for:"logLevel"}},[e._v(" "+e._s(e.moduleName)+" ")]),n("select",{directives:[{name:"model",rawName:"v-model",value:e.selectedLevel,expression:"selectedLevel"}],attrs:{name:"logLevel"},on:{change:[function(t){var n=Array.prototype.filter.call(t.target.options,function(e){return e.selected}).map(function(e){var t="_value"in e?e._value:e.value;return t});e.selectedLevel=t.target.multiple?n:n[0]},e.onChange]}},e._l(e.logLevels,function(t){return n("option",{key:t,domProps:{value:t}},[e._v("\n      "+e._s(t)+"\n    ")])}),0)])}),d=[],f={name:"LogModule",data:function(){return{logLevels:["info","debug"],selectedLevel:"",recordCount:100}},props:{logLevel:{type:String,required:!0},moduleName:{type:String,required:!0}},methods:Object(o["a"])({},Object(a["b"])(["setLogModuleLevel"]),{onChange:function(){var e=this.moduleName,t=this.selectedLevel,n=this.setLogModuleLevel;n({logModule:e,level:t})}}),mounted:function(){this.selectedLevel=this.logLevel}},v=f,p=(n("6ad4"),n("2877")),g=Object(p["a"])(v,u,d,!1,null,null,null),m=g.exports,h={name:"LogSettings",components:{LogModule:m},data:function(){return{logLevels:["info","debug"],recordCount:100,buttonsymbol:"&#9655;"}},computed:Object(o["a"])({},Object(a["c"])({logModules:function(e){return e.logs.logModules}}),{sortedLogModules:function(){var e=this.logModules,t=void 0===e?[]:e;return t.sort(function(e,t){return e.moduleName>t.moduleName?1:e.moduleName<t.moduleName?-1:0})}}),methods:Object(o["a"])({},Object(a["b"])(["getLogModules"]),{hide:function(){this.$refs.logModules.style.display="none"===this.$refs.logModules.style.display?"block":"none","none"===this.$refs.logModules.style.display?this.buttonsymbol="&#9655;":this.buttonsymbol="&#9650;"}}),mounted:function(){this.$refs.logModules.style.display="none",this.getLogModules()}},b=h,_=(n("677d"),Object(p["a"])(b,l,c,!1,null,null,null)),w=_.exports,I={name:"Logs",components:{Refresher:s["a"],LogSettings:w},data:function(){return{recordCounts:[100,250,500],recordCount:100}},computed:Object(o["a"])({},Object(a["c"])({logs:function(e){return e.logs},records:function(e){return e.logs.records},logRecordLimit:function(e){return e.logs.logRecordLimit}})),watch:{recordCount:function(e){this.getLogs({logRecordLimit:e})}},methods:Object(o["a"])({},Object(a["b"])(["getLogs"]),{refreshLogs:function(){var e=this.logRecordLimit,t=void 0===e?100:e;this.getLogs({logRecordLimit:t})}}),mounted:function(){var e=this.logRecordLimit,t=void 0===e?100:e;this.getLogs({logRecordLimit:t})}},S=I,y=(n("2c27"),Object(p["a"])(S,r,i,!1,null,null,null));t["default"]=y.exports},beff:function(e,t,n){},cf3a:function(e,t,n){"use strict";var r=n("8c41"),i=n.n(r);i.a},e3f4:function(e,t,n){},e440:function(e,t,n){"use strict";n.r(t);var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"devView"},[n("div",{attrs:{id:"provisioning"}}),n("DeveloperStats"),n("hr",{staticStyle:{clear:"both"}}),e.provisioned?n("configuration"):e._e(),e.provisioned?n("hr"):e._e(),n("sample-generator-form")],1)},i=[],o=n("cebc"),a=n("2f62"),s=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"ipList"},[n("h3",[e._v(" Configuration info ")]),n("ul",[n("li",[e._v(" pHin Bridge Root: "),n("span",{staticClass:"devInfoDetail"},[e._v(" "+e._s(e.phinRoot)+" ")])]),n("li",[e._v(" Samples URL: "),n("span",{staticClass:"devInfoDetail"},[e._v(" "+e._s(e.samplesURL)+" ")])]),n("li",[e._v(" Logging URL: "),n("span",{staticClass:"devInfoDetail"},[e._v(" "+e._s(e.bridgeLogsURL)+" ")])]),n("li",[e._v(" Report Version URL: "),n("span",{staticClass:"devInfoDetail"},[e._v(" "+e._s(e.reportVersionURL)+" ")])])]),n("ul",[n("li",[n("checkin-interval")],1),n("li",[n("log-interval")],1)])])},l=[],c=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("span",[n("label",{attrs:{for:"checkininterval"}},[e._v(" Checkin Interval ")]),n("select",{directives:[{name:"model",rawName:"v-model",value:e.interval,expression:"interval"}],attrs:{name:"checkininterval"},on:{change:[function(t){var n=Array.prototype.filter.call(t.target.options,function(e){return e.selected}).map(function(e){var t="_value"in e?e._value:e.value;return t});e.interval=t.target.multiple?n:n[0]},e.onChange]}},e._l(e.intervalOptions,function(t){return n("option",{key:t,domProps:{value:t}},[e._v("\n      "+e._s(t)+"\n    ")])}),0),e._v("\n  Seconds\n")])},u=[],d={name:"CheckinInterval",data:function(){return{intervalOptions:[600,300,120,60],interval:100}},computed:Object(o["a"])({},Object(a["c"])({checkinInterval:function(e){return e.checkinInterval}})),methods:Object(o["a"])({},Object(a["b"])(["setCheckinInterval"]),{onChange:function(e){this.setCheckinInterval(this.interval)}}),mounted:function(){this.interval=this.checkinInterval}},f=d,v=n("2877"),p=Object(v["a"])(f,c,u,!1,null,null,null),g=p.exports,m=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("span",[n("label",{attrs:{for:"checkininterval"}},[e._v("Remote Log Interval")]),n("select",{directives:[{name:"model",rawName:"v-model",value:e.interval,expression:"interval"}],attrs:{name:"logInterval"},on:{change:[function(t){var n=Array.prototype.filter.call(t.target.options,function(e){return e.selected}).map(function(e){var t="_value"in e?e._value:e.value;return t});e.interval=t.target.multiple?n:n[0]},e.onChange]}},e._l(e.intervalOptions,function(t){return n("option",{key:t,domProps:{value:e.interval}},[e._v(" "+e._s(t)+" ")])}),0),e._v("\n  Seconds\n")])},h=[],b={name:"LogInterval",data:function(){return{intervalOptions:[600,300,120,60],interval:100}},computed:Object(o["a"])({},Object(a["c"])({logInterval:function(e){return e.logInterval}})),methods:Object(o["a"])({},Object(a["b"])(["setRemoteLogInterval"]),{onChange:function(e){this.setRemoteLogInterval(this.interval)}}),mounted:function(){this.interval=this.logInterval}},_=b,w=Object(v["a"])(_,m,h,!1,null,null,null),I=w.exports,S={name:"Configuration",components:{CheckinInterval:g,LogInterval:I},computed:Object(o["a"])({},Object(a["c"])({phinRoot:function(e){return e.phinRoot},configURLs:function(e){return e.configURLs}}),{samplesURL:function(){return this.configURLs?this.configURLs.samplesURL:""},bridgeLogsURL:function(){return this.configURLs?this.configURLs.bridgeLogsURL:""},reportVersionURL:function(){return this.configURLs?this.configURLs.reportVersionURL:""}})},y=S,L=(n("b720"),Object(v["a"])(y,s,l,!1,null,null,null)),C=L.exports,R=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("h3",[e._v("mock a monitor")]),n("ul",[n("li",[n("label",{attrs:{for:"hardwareId"}},[e._v("Hardware Id")]),n("input",{directives:[{name:"model",rawName:"v-model",value:e.hardwareId,expression:"hardwareId"}],staticClass:"txtin",attrs:{name:"hardwareId",placeholder:"enter a monitor id"},domProps:{value:e.hardwareId},on:{input:function(t){t.target.composing||(e.hardwareId=t.target.value)}}}),e.hardwareIdErrorMessage?n("span",[n("span",{staticClass:"fieldError"},[e._v(e._s(e.hardwareIdErrorMessage))])]):e._e(),e.validHardwareId?n("span",[n("span",{staticClass:"fieldGood"},[e._v("✓")])]):e._e()]),n("li",[n("label",{attrs:{for:"interval"}},[e._v("Sample Send Interval")]),n("select",{directives:[{name:"model",rawName:"v-model",value:e.sampleInterval,expression:"sampleInterval"}],on:{change:function(t){var n=Array.prototype.filter.call(t.target.options,function(e){return e.selected}).map(function(e){var t="_value"in e?e._value:e.value;return t});e.sampleInterval=t.target.multiple?n:n[0]}}},[n("option",{attrs:{value:"10"}},[e._v("10")]),n("option",{attrs:{value:"5"}},[e._v("5")]),n("option",{attrs:{value:"3"}},[e._v("3")]),n("option",{attrs:{value:"1"}},[e._v("1")])])]),n("li",[n("label",{attrs:{for:"advertisements"}},[e._v("Advertisements Per Sample")]),n("select",{directives:[{name:"model",rawName:"v-model",value:e.advertisementsPerSample,expression:"advertisementsPerSample"}],on:{change:function(t){var n=Array.prototype.filter.call(t.target.options,function(e){return e.selected}).map(function(e){var t="_value"in e?e._value:e.value;return t});e.advertisementsPerSample=t.target.multiple?n:n[0]}}},[n("option",{attrs:{value:"1"}},[e._v("1")]),n("option",{attrs:{value:"3"}},[e._v("3")]),n("option",{attrs:{value:"5"}},[e._v("5")]),n("option",{attrs:{value:"10"}},[e._v("10")])])]),n("li",[n("button",{staticClass:"btn btn-sm",attrs:{name:"addSampleGenerator",disabled:!e.validHardwareId},on:{click:e.create}},[e._v("Add Sample Generator")])])]),n("div",{attrs:{id:"virtualMonitors"}},[n("ul",e._l(e.sampleGenerators,function(t){return n("li",{key:t},[e._v(e._s(t))])}),0)])])},k=[],O=(n("4917"),n("7514"),{name:"SampleGeneratorForm",data:function(){return{hardwareId:"",sampleInterval:10,advertisementsPerSample:1,validHardwareId:!1,hardwareIdErrorMessage:null}},computed:Object(o["a"])({},Object(a["c"])({sampleGenerators:function(e){return e.sampleGenerators}})),watch:{hardwareId:function(e){var t=/^[0-9A-Fa-f]{16}/;this.hardwareIdErrorMessage=null,this.validHardwareId=!1,e.length>0&&(this.hardwareId=e.toUpperCase(),this.sampleGenerators.find(function(t){return t===e})?this.hardwareIdErrorMessage="Duplicate monitor id":this.hardwareId.match(t)&&16===e.length?this.validHardwareId=!0:this.hardwareIdErrorMessage="Invalid hardware id (must be 16 hex characters)")}},methods:Object(o["a"])({},Object(a["b"])(["createSampleGenerator"]),{create:function(){var e=this.hardwareId,t=this.sampleInterval,n=this.advertisementsPerSample,r=this.createSampleGenerator;r({hardwareId:e,sampleInterval:t,advertisementsPerSample:n})}})}),x=O,j=Object(v["a"])(x,R,k,!1,null,null,null),M=j.exports,N=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"developerStats"},[n("h3",[e._v(e._s(e.provisioned))]),n("provisioner"),n("stat-row",{attrs:{label:"Serial Number:",stat:e.serialNumber}}),n("stat-row",{attrs:{label:"Software Version:",stat:e.bridgeInfo.softwareVersion}}),n("stat-row",{attrs:{label:"Software Revision:",stat:e.bridgeInfo.softwareRevision}}),n("stat-row",{attrs:{label:"Device Name:",stat:e.bridgeInfo.deviceName}}),n("stat-row",{attrs:{label:"Started at:",stat:e.bridgeStartTime}}),e.ssid?n("stat-row",{attrs:{label:"Wifi SSID:",stat:e.ssid}}):e._e(),e.ssid?e._e():n("stat-row",{attrs:{label:"Wifi:",stat:"Not connected"}}),e.processInfo?n("div",[n("stat-row",{attrs:{label:"Operation System:",stat:e.processInfo.osversion}}),n("stat-row",{attrs:{label:"Process ID:",stat:e.processInfo.pid}}),n("stat-row",{attrs:{label:"Active Memory:",stat:e.processInfo.activeMem}}),n("stat-row",{attrs:{label:"Total Memory:",stat:e.processInfo.totalMem}}),n("stat-row",{attrs:{label:"CPU Load:",stat:e.processInfo.cpuLoad}}),n("stat-row",{attrs:{label:"CPU Usage Time:",stat:e.processInfo.cpuUsageTimeSinceBoot}}),n("stat-row",{attrs:{label:"Mode",stat:e.mode}})],1):e._e(),e.bridgeInfo.provisioned?n("div",[e.workerStarted?n("stat-row",{attrs:{label:"Sample Listener Start Time:",stat:e.workerStartTime}}):e._e(),e.workerStarted?e._e():n("stat-row",{attrs:{label:"Sample Listener Stop Time:",stat:e.workerStopTime}}),n("stat-row",{attrs:{label:"Samples Received:",stat:e.bridgeInfo.samplesReceived}}),n("stat-row",{attrs:{label:"Samples Sent:",stat:e.bridgeInfo.samplesSent}}),e.bridgeInfo.samplesReceived>0?n("stat-row",{attrs:{label:"Last Received At:",stat:e.lastSampleReceivedAt}}):e._e(),e.bridgeInfo.samplesSent>0?n("stat-row",{attrs:{label:"Last Sent At:",stat:e.lastSampleSentAt}}):e._e(),n("stat-row",{attrs:{label:"Bridge Send Variance:",stat:e.bridgeInfo.bridgeSendVariance}})],1):e._e()],1)},U=[],E=n("69d9"),T=n("bb41"),A=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e.provisioned?e._e():n("ul",[n("li",[n("label",{attrs:{for:"provisionUrl"}},[e._v("Provision Url")]),n("input",{directives:[{name:"model",rawName:"v-model",value:e.identifyURL,expression:"identifyURL"}],staticClass:"txtin txtin-lg",attrs:{name:"provisionUrl"},domProps:{value:e.identifyURL},on:{input:function(t){t.target.composing||(e.identifyURL=t.target.value)}}})]),n("li",[n("button",{staticClass:"btn btn-sm",attrs:{disabled:e.identifyURL.length<3},on:{click:e.provision}},[e._v("Provision")])])]),e.provisioned?n("div",{staticClass:"deprovisionButton"},[n("button",{staticClass:"btn btn-sm",on:{click:e.deprovisionBridge}},[e._v(" deprovision ")])]):e._e()])},W=[],P=(n("96cf"),n("3b8d")),$={name:"Provisioner",data:function(){return{identifyURL:""}},computed:Object(o["a"])({},Object(a["c"])({provisioned:function(e){return e.provisioned}})),methods:Object(o["a"])({},Object(a["b"])(["provisionBridge","deprovisionBridge","popToast"]),{provision:function(){var e=Object(P["a"])(regeneratorRuntime.mark(function e(){var t,n,r,i;return regeneratorRuntime.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return t=this.identifyURL,n=this.provisionBridge,r=this.popToast,e.next=3,n({identifyURL:t});case 3:i=e.sent,i.success||r({show:!0,message:"Failed to provision"});case 5:case"end":return e.stop()}},e,this)}));function t(){return e.apply(this,arguments)}return t}()})},D=$,B=(n("b587"),Object(v["a"])(D,A,W,!1,null,"4754c74a",null)),G=B.exports,q={name:"DeveloperStats",components:{StatRow:T["a"],Provisioner:G},computed:Object(o["a"])({},Object(a["c"])({serialNumber:function(e){return e.serialNumber},bridgeInfo:function(e){return e.bridgeInfo},developmentMode:function(e){return e.developmentMode}}),{ssid:function(){return this.bridgeInfo&&this.bridgeInfo.ssid&&this.bridgeInfo.ssid.length?this.bridgeInfo.ssid:null},provisioned:function(){var e=this.bridgeInfo&&this.bridgeInfo.provisioned?"":"not";return"Bridge is ".concat(e," provisioned")},bridgeStartTime:function(){return this.bridgeInfo&&this.bridgeInfo.bridgeStartTime?Object(E["a"])(this.bridgeInfo.bridgeStartTime):"Not started"},workerStarted:function(){return!!this.bridgeInfo&&this.bridgeInfo.workerStarted},workerStartTime:function(){return this.bridgeInfo&&this.bridgeInfo.workerStartTime?Object(E["a"])(this.bridgeInfo.workerStartTime):"Not started"},workerStopTime:function(){return this.bridgeInfo&&this.bridgeInfo.workerStopTime?Object(E["a"])(this.bridgeInfo.workerStopTime):"Never started"},lastSampleReceivedAt:function(){return this.bridgeInfo&&this.bridgeInfo.lastSampleReceivedAt?Object(E["a"])(this.bridgeInfo.lastSampleReceivedAt):"None received"},lastSampleSentAt:function(){return this.bridgeInfo&&this.bridgeInfo.lastSampleSentAt?Object(E["a"])(this.bridgeInfo.lastSampleSentAt):"None received"},processInfo:function(){var e=this.bridgeInfo.processInfo;return e},mode:function(){var e=this.developmentMode,t=void 0!==e&&e;return t?"Development":"Production"}}),methods:Object(o["a"])({},Object(a["b"])(["getBridgeInfo","popToast"]),{refreshStats:function(){this.getBridgeInfo()}}),mounted:function(){this.getBridgeInfo()}},F=q,V=(n("0ef7"),Object(v["a"])(F,N,U,!1,null,null,null)),H=V.exports,J={name:"Development",components:{Configuration:C,SampleGeneratorForm:M,DeveloperStats:H},computed:Object(o["a"])({},Object(a["c"])({serialNumber:function(e){return e.serialNumber},provisioned:function(e){return e.provisioned},sampleGenerators:function(e){return e.sampleGenerators},checkinInterval:function(e){return e.logs.checkinInterval},logInterval:function(e){return e.logs.logInterval}})),methods:Object(o["a"])({},Object(a["b"])(["getDevelopmentInfo"])),mounted:function(){this.getDevelopmentInfo()}},Y=J,z=(n("ead3"),Object(v["a"])(Y,r,i,!1,null,null,null));t["default"]=z.exports},ead3:function(e,t,n){"use strict";var r=n("beff"),i=n.n(r);i.a}}]);