const navigator = require('navigator')
const Window = require('window')
const window = new Window()
const screen = require('screen')
const document = window.document

const CryptoJS = require('./tripledes')


//浏览器指纹模块，与官方第二版本有所区别，经过修改
const BrowserFinger = {
	get : function(options){
		var ua = navigator.userAgent.toLowerCase();
		if (ua.indexOf("jsmcc") > -1 || ua.indexOf("ua=jsapp") > -1 || window.clientObject){
			document.cookie = "mywaytoopen=0;domain=.js.10086.cn;path=/";
		}
		else{
			var defaultOptions = {
				swfContainerId: "fingerprintjs2",
				swfPath: "flash/compiled/FontList.swf",
				detectScreenOrientation: true,
				sortPluginsFor: [/palemoon/i],
				userDefinedFonts: []
			};
			this.options = this.extend(options, defaultOptions);
			this.nativeForEach = Array.prototype.forEach;
			this.nativeMap = Array.prototype.map;
			var keys = [];
			keys = this.userAgentKey(keys);
			keys = this.languageKey(keys);
			keys = this.colorDepthKey(keys);
			keys = this.pixelRatioKey(keys);
			keys = this.hardwareConcurrencyKey(keys);
			keys = this.screenResolutionKey(keys);
			keys = this.availableScreenResolutionKey(keys);
			keys = this.timezoneOffsetKey(keys);
			keys = this.sessionStorageKey(keys);
			keys = this.localStorageKey(keys);
			keys = this.indexedDbKey(keys);
			keys = this.addBehaviorKey(keys);//
			keys = this.openDatabaseKey(keys);
			keys = this.cpuClassKey(keys);
			keys = this.platformKey(keys);
			keys = this.doNotTrackKey(keys);
			// keys = this.canvasKey(keys);
			// keys = this.webglKey(keys);
			// keys = this.adBlockKey(keys);
			keys = this.hasLiedLanguagesKey(keys);
			keys = this.hasLiedResolutionKey(keys);
			keys = this.hasLiedOsKey(keys);
			keys = this.hasLiedBrowserKey(keys);
			keys = this.touchSupportKey(keys);
			keys = this.customEntropyFunction(keys);//
			var that = this;
			var values = [];
			this.fontsKey(keys, function(newKeys){
				that.each(newKeys, function(pair) {
					var value = pair.value;
					if (typeof pair.value.join !== "undefined") {
						value = pair.value.join(";");
					}
					values.push(value);
				});
			});
			var browserFinger = that.x64hash128(values.join("~~~"), 31);
			if("" == browserFinger || null == browserFinger){
				document.cookie = "mywaytoopen=-1;domain=.js.10086.cn;path=/";
			}else{
				document.cookie = "mywaytoopen="+ browserFinger +";domain=.js.10086.cn;path=/";
			}
		}

	},
	extend: function(source, target) {
		if (source == null) { return target; }
		for (var k in source) {
			if(source[k] != null && target[k] !== source[k]) {
				target[k] = source[k];
			}
		}
		return target;
	},
	customEntropyFunction: function (keys) {
		if (typeof this.options.customFunction === "function") {
			keys.push({key: "custom", value: this.options.customFunction()});
		}
		return keys;
	},
	userAgentKey: function(keys) {
		if(!this.options.excludeUserAgent) {
			keys.push({key: "user_agent", value: this.getUserAgent()});
		}
		return keys;
	},
	getUserAgent: function(){
		return navigator.userAgent;
	},
	languageKey: function(keys) {
		if(!this.options.excludeLanguage) {
			keys.push({ key: "language", value: navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || "" });
		}
		return keys;
	},
	colorDepthKey: function(keys) {
		if(!this.options.excludeColorDepth) {
			keys.push({key: "color_depth", value: screen.colorDepth || -1});
		}
		return keys;
	},
	pixelRatioKey: function(keys) {
		if(!this.options.excludePixelRatio) {
			keys.push({key: "pixel_ratio", value: this.getPixelRatio()});
		}
		return keys;
	},
	getPixelRatio: function() {
		return window.devicePixelRatio || "";
	},
	screenResolutionKey: function(keys) {
		if(!this.options.excludeScreenResolution) {
			return this.getScreenResolution(keys);
		}
		return keys;
	},
	getScreenResolution: function(keys) {
		var resolution;
		if(this.options.detectScreenOrientation) {
			resolution = (screen.height > screen.width) ? [screen.height, screen.width] : [screen.width, screen.height];
		} else {
			resolution = [screen.width, screen.height];
		}
		if(typeof resolution !== "undefined") {
			keys.push({key: "resolution", value: resolution});
		}
		return keys;
	},
	availableScreenResolutionKey: function(keys) {
		if (!this.options.excludeAvailableScreenResolution) {
			return this.getAvailableScreenResolution(keys);
		}
		return keys;
	},
	getAvailableScreenResolution: function(keys) {
		var available;
		if(screen.availWidth && screen.availHeight) {
			if(this.options.detectScreenOrientation) {
				available = (screen.availHeight > screen.availWidth) ? [screen.availHeight, screen.availWidth] : [screen.availWidth, screen.availHeight];
			} else {
				available = [screen.availHeight, screen.availWidth];
			}
		}
		if(typeof available !== "undefined") {
			keys.push({key: "available_resolution", value: available});
		}
		return keys;
	},
	timezoneOffsetKey: function(keys) {
		if(!this.options.excludeTimezoneOffset) {
			keys.push({key: "timezone_offset", value: new Date().getTimezoneOffset()});
		}
		return keys;
	},
	sessionStorageKey: function(keys) {
		if(!this.options.excludeSessionStorage && this.hasSessionStorage()) {
			keys.push({key: "session_storage", value: 1});
		}
		return keys;
	},
	localStorageKey: function(keys) {
		if(!this.options.excludeSessionStorage && this.hasLocalStorage()) {
			keys.push({key: "local_storage", value: 1});
		}
		return keys;
	},
	indexedDbKey: function(keys) {
		if(!this.options.excludeIndexedDB && this.hasIndexedDB()) {
			keys.push({key: "indexed_db", value: 1});
		}
		return keys;
	},
	addBehaviorKey: function(keys) {
		// body might not be defined at this point or removed programmatically
		if(document.body && !this.options.excludeAddBehavior && document.body.addBehavior) {
			keys.push({key: "add_behavior", value: 1});
		}
		return keys;
	},
	openDatabaseKey: function(keys) {
		if(!this.options.excludeOpenDatabase && window.openDatabase) {
			keys.push({key: "open_database", value: 1});
		}
		return keys;
	},
	cpuClassKey: function(keys) {
		if(!this.options.excludeCpuClass) {
			keys.push({key: "cpu_class", value: this.getNavigatorCpuClass()});
		}
		return keys;
	},
	platformKey: function(keys) {
		if(!this.options.excludePlatform) {
			keys.push({key: "navigator_platform", value: this.getNavigatorPlatform()});
		}
		return keys;
	},
	doNotTrackKey: function(keys) {
		if(!this.options.excludeDoNotTrack) {
			keys.push({key: "do_not_track", value: this.getDoNotTrack()});
		}
		return keys;
	},
	canvasKey: function(keys) {
		if(!this.options.excludeCanvas && this.isCanvasSupported()) {
			keys.push({key: "canvas", value: this.getCanvasFp()});
		}
		return keys;
	},
	webglKey: function(keys) {
		if(this.options.excludeWebGL) {
			return keys;
		}
		if(!this.isWebGlSupported()) {
			return keys;
		}
		keys.push({key: "webgl", value: this.getWebglFp()});
		return keys;
	},
	adBlockKey: function(keys){
		if(!this.options.excludeAdBlock) {
			keys.push({key: "adblock", value: this.getAdBlock()});
		}
		return keys;
	},
	hasLiedLanguagesKey: function(keys){
		if(!this.options.excludeHasLiedLanguages){
			keys.push({key: "has_lied_languages", value: this.getHasLiedLanguages()});
		}
		return keys;
	},
	hasLiedResolutionKey: function(keys){
		if(!this.options.excludeHasLiedResolution){
			keys.push({key: "has_lied_resolution", value: this.getHasLiedResolution()});
		}
		return keys;
	},
	hasLiedOsKey: function(keys){
		if(!this.options.excludeHasLiedOs){
			keys.push({key: "has_lied_os", value: this.getHasLiedOs()});
		}
		return keys;
	},
	hasLiedBrowserKey: function(keys){
		if(!this.options.excludeHasLiedBrowser){
			keys.push({key: "has_lied_browser", value: this.getHasLiedBrowser()});
		}
		return keys;
	},
	fontsKey: function(keys, done) {
		return this.flashFontsKey(keys, done);
	},
	// flash fonts (will increase fingerprinting time 20X to ~ 130-150ms)
	flashFontsKey: function(keys, done) {
		if(this.options.excludeFlashFonts) {
			return done(keys);
		}
		// we do flash if swfobject is loaded
		if(!this.hasSwfObjectLoaded()){
			return done(keys);
		}
		if(!this.hasMinFlashInstalled()){
			return done(keys);
		}
		if(typeof this.options.swfPath === "undefined"){
			return done(keys);
		}
		this.loadSwfAndDetectFonts(function(fonts){
			keys.push({key: "swf_fonts", value: fonts.join(";")});
			done(keys);
		});
	},
	touchSupportKey: function (keys) {
		if(!this.options.excludeTouchSupport){
			keys.push({key: "touch_support", value: this.getTouchSupport()});
		}
		return keys;
	},
	hardwareConcurrencyKey: function(keys){
		if(!this.options.excludeHardwareConcurrency){
			keys.push({key: "hardware_concurrency", value: this.getHardwareConcurrency()});
		}
		return keys;
	},
	hasSessionStorage: function () {
		try {
			return !!window.sessionStorage;
		} catch(e) {
			return true;
		}
	},
	hasLocalStorage: function () {
		try {
			return !!window.localStorage;
		} catch(e) {
			return true;
		}
	},
	hasIndexedDB: function (){
		try {
			return !!window.indexedDB;
		} catch(e) {
			return true;
		}
	},
	getHardwareConcurrency: function(){
		if(navigator.hardwareConcurrency){
			return navigator.hardwareConcurrency;
		}
		return "unknown";
	},
	getNavigatorCpuClass: function () {
		if(navigator.cpuClass){
			return navigator.cpuClass;
		} else {
			return "unknown";
		}
	},
	getNavigatorPlatform: function () {
		if(navigator.platform) {
			return navigator.platform;
		} else {
			return "unknown";
		}
	},
	getDoNotTrack: function () {
		if(navigator.doNotTrack) {
			return navigator.doNotTrack;
		} else if (navigator.msDoNotTrack) {
			return navigator.msDoNotTrack;
		} else if (window.doNotTrack) {
			return window.doNotTrack;
		} else {
			return "unknown";
		}
	},
	getTouchSupport: function () {
		var maxTouchPoints = 0;
		var touchEvent = false;
		if(typeof navigator.maxTouchPoints !== "undefined") {
			maxTouchPoints = navigator.maxTouchPoints;
		} else if (typeof navigator.msMaxTouchPoints !== "undefined") {
			maxTouchPoints = navigator.msMaxTouchPoints;
		}
		try {
			document.createEvent("TouchEvent");
			touchEvent = true;
		} catch(_) { }
		var touchStart = "ontouchstart" in window;
		return [maxTouchPoints, touchEvent, touchStart];
	},
	getCanvasFp: function() {
		var result = [];
		var canvas = document.createElement("canvas");
		canvas.width = 2000;
		canvas.height = 200;
		canvas.style.display = "inline";
		var ctx = canvas.getContext("2d");
		ctx.rect(0, 0, 10, 10);
		ctx.rect(2, 2, 6, 6);
		result.push("canvas winding:" + ((ctx.isPointInPath(5, 5, "evenodd") === false) ? "yes" : "no"));

		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#f60";
		ctx.fillRect(125, 1, 62, 20);
		ctx.fillStyle = "#069";
		if(this.options.dontUseFakeFontInCanvas) {
			ctx.font = "11pt Arial";
		} else {
			ctx.font = "11pt no-real-font-123";
		}
		ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
		ctx.fillStyle = "rgba(102, 204, 0, 0.2)";
		ctx.font = "18pt Arial";
		ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);

		ctx.globalCompositeOperation = "multiply";
		ctx.fillStyle = "rgb(255,0,255)";
		ctx.beginPath();
		ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "rgb(0,255,255)";
		ctx.beginPath();
		ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "rgb(255,255,0)";
		ctx.beginPath();
		ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "rgb(255,0,255)";
		ctx.arc(75, 75, 75, 0, Math.PI * 2, true);
		ctx.arc(75, 75, 25, 0, Math.PI * 2, true);
		ctx.fill("evenodd");

		result.push("canvas fp:" + canvas.toDataURL());
		return result.join("~");
	},

	getWebglFp: function() {
		var gl;
		var fa2s = function(fa) {
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			return "[" + fa[0] + ", " + fa[1] + "]";
		};
		var maxAnisotropy = function(gl) {
			var anisotropy, ext = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
			return ext ? (anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT), 0 === anisotropy && (anisotropy = 2), anisotropy) : null;
		};
		gl = this.getWebglCanvas();
		if(!gl) { return null; }
		var result = [];
		var vShaderTemplate = "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}";
		var fShaderTemplate = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}";
		var vertexPosBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
		var vertices = new Float32Array([-.2, -.9, 0, .4, -.26, 0, 0, .732134444, 0]);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		vertexPosBuffer.itemSize = 3;
		vertexPosBuffer.numItems = 3;
		var program = gl.createProgram(), vshader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vshader, vShaderTemplate);
		gl.compileShader(vshader);
		var fshader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fshader, fShaderTemplate);
		gl.compileShader(fshader);
		gl.attachShader(program, vshader);
		gl.attachShader(program, fshader);
		gl.linkProgram(program);
		gl.useProgram(program);
		program.vertexPosAttrib = gl.getAttribLocation(program, "attrVertex");
		program.offsetUniform = gl.getUniformLocation(program, "uniformOffset");
		gl.enableVertexAttribArray(program.vertexPosArray);
		gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, !1, 0, 0);
		gl.uniform2f(program.offsetUniform, 1, 1);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
		if (gl.canvas != null) { result.push(gl.canvas.toDataURL()); }
		result.push("extensions:" + gl.getSupportedExtensions().join(";"));
		result.push("webgl aliased line width range:" + fa2s(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)));
		result.push("webgl aliased point size range:" + fa2s(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)));
		result.push("webgl alpha bits:" + gl.getParameter(gl.ALPHA_BITS));
		result.push("webgl antialiasing:" + (gl.getContextAttributes().antialias ? "yes" : "no"));
		result.push("webgl blue bits:" + gl.getParameter(gl.BLUE_BITS));
		result.push("webgl depth bits:" + gl.getParameter(gl.DEPTH_BITS));
		result.push("webgl green bits:" + gl.getParameter(gl.GREEN_BITS));
		result.push("webgl max anisotropy:" + maxAnisotropy(gl));
		result.push("webgl max combined texture image units:" + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
		result.push("webgl max cube map texture size:" + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
		result.push("webgl max fragment uniform vectors:" + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
		result.push("webgl max render buffer size:" + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
		result.push("webgl max texture image units:" + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
		result.push("webgl max texture size:" + gl.getParameter(gl.MAX_TEXTURE_SIZE));
		result.push("webgl max varying vectors:" + gl.getParameter(gl.MAX_VARYING_VECTORS));
		result.push("webgl max vertex attribs:" + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
		result.push("webgl max vertex texture image units:" + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
		result.push("webgl max vertex uniform vectors:" + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
		result.push("webgl max viewport dims:" + fa2s(gl.getParameter(gl.MAX_VIEWPORT_DIMS)));
		result.push("webgl red bits:" + gl.getParameter(gl.RED_BITS));
		result.push("webgl renderer:" + gl.getParameter(gl.RENDERER));
		result.push("webgl shading language version:" + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
		result.push("webgl stencil bits:" + gl.getParameter(gl.STENCIL_BITS));
		result.push("webgl vendor:" + gl.getParameter(gl.VENDOR));
		result.push("webgl version:" + gl.getParameter(gl.VERSION));

		try {
			var extensionDebugRendererInfo = gl.getExtension("WEBGL_debug_renderer_info");
			if (extensionDebugRendererInfo) {
				result.push("webgl unmasked vendor:" + gl.getParameter(extensionDebugRendererInfo.UNMASKED_VENDOR_WEBGL));
				result.push("webgl unmasked renderer:" + gl.getParameter(extensionDebugRendererInfo.UNMASKED_RENDERER_WEBGL));
			}
		} catch(e) {  }

		if (!gl.getShaderPrecisionFormat) {
			return result.join("~");
		}

		result.push("webgl vertex shader high float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision);
		result.push("webgl vertex shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT ).rangeMin);
		result.push("webgl vertex shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT ).rangeMax);
		result.push("webgl vertex shader medium float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).precision);
		result.push("webgl vertex shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).rangeMin);
		result.push("webgl vertex shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).rangeMax);
		result.push("webgl vertex shader low float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT ).precision);
		result.push("webgl vertex shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT ).rangeMin);
		result.push("webgl vertex shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT ).rangeMax);
		result.push("webgl fragment shader high float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision);
		result.push("webgl fragment shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).rangeMin);
		result.push("webgl fragment shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).rangeMax);
		result.push("webgl fragment shader medium float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).precision);
		result.push("webgl fragment shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).rangeMin);
		result.push("webgl fragment shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).rangeMax);
		result.push("webgl fragment shader low float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT ).precision);
		result.push("webgl fragment shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT ).rangeMin);
		result.push("webgl fragment shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT ).rangeMax);
		result.push("webgl vertex shader high int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT ).precision);
		result.push("webgl vertex shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT ).rangeMin);
		result.push("webgl vertex shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT ).rangeMax);
		result.push("webgl vertex shader medium int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT ).precision);
		result.push("webgl vertex shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT ).rangeMin);
		result.push("webgl vertex shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT ).rangeMax);
		result.push("webgl vertex shader low int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT ).precision);
		result.push("webgl vertex shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT ).rangeMin);
		result.push("webgl vertex shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT ).rangeMax);
		result.push("webgl fragment shader high int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT ).precision);
		result.push("webgl fragment shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT ).rangeMin);
		result.push("webgl fragment shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT ).rangeMax);
		result.push("webgl fragment shader medium int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT ).precision);
		result.push("webgl fragment shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT ).rangeMin);
		result.push("webgl fragment shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT ).rangeMax);
		result.push("webgl fragment shader low int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT ).precision);
		result.push("webgl fragment shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT ).rangeMin);
		result.push("webgl fragment shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT ).rangeMax);
		return result.join("~");
	},
	getAdBlock: function(){
		var ads = document.createElement("div");
		ads.innerHTML = "&nbsp;";
		ads.className = "adsbox";
		var result = false;
		try {
			document.body.appendChild(ads);
			result = document.getElementsByClassName("adsbox")[0].offsetHeight === 0;
			document.body.removeChild(ads);
		} catch (e) {
			result = false;
		}
		return result;
	},
	getHasLiedLanguages: function(){
		if(typeof navigator.languages !== "undefined"){
			try {
				var firstLanguages = navigator.languages[0].substr(0, 2);
				if(firstLanguages !== navigator.language.substr(0, 2)){
					return true;
				}
			} catch(err) {
				return true;
			}
		}
		return false;
	},
	getHasLiedResolution: function(){
		if(screen.width < screen.availWidth){
			return true;
		}
		if(screen.height < screen.availHeight){
			return true;
		}
		return false;
	},
	getHasLiedOs: function(){
		var userAgent = navigator.userAgent.toLowerCase();
		var oscpu = navigator.oscpu;
		var platform = navigator.platform.toLowerCase();
		var os;
		if(userAgent.indexOf("windows phone") >= 0){
			os = "Windows Phone";
		} else if(userAgent.indexOf("win") >= 0){
			os = "Windows";
		} else if(userAgent.indexOf("android") >= 0){
			os = "Android";
		} else if(userAgent.indexOf("linux") >= 0){
			os = "Linux";
		} else if(userAgent.indexOf("iphone") >= 0 || userAgent.indexOf("ipad") >= 0 ){
			os = "iOS";
		} else if(userAgent.indexOf("mac") >= 0){
			os = "Mac";
		} else{
			os = "Other";
		}
		var mobileDevice;
		if (("ontouchstart" in window) ||
			(navigator.maxTouchPoints > 0) ||
			(navigator.msMaxTouchPoints > 0)) {
			mobileDevice = true;
		} else{
			mobileDevice = false;
		}

		if(mobileDevice && os !== "Windows Phone" && os !== "Android" && os !== "iOS" && os !== "Other"){
			return true;
		}

		if(typeof oscpu !== "undefined"){
			oscpu = oscpu.toLowerCase();
			if(oscpu.indexOf("win") >= 0 && os !== "Windows" && os !== "Windows Phone"){
				return true;
			} else if(oscpu.indexOf("linux") >= 0 && os !== "Linux" && os !== "Android"){
				return true;
			} else if(oscpu.indexOf("mac") >= 0 && os !== "Mac" && os !== "iOS"){
				return true;
			} else if(oscpu.indexOf("win") === 0 && oscpu.indexOf("linux") === 0 && oscpu.indexOf("mac") >= 0 && os !== "other"){
				return true;
			}
		}

		if(platform.indexOf("win") >= 0 && os !== "Windows" && os !== "Windows Phone"){
			return true;
		} else if((platform.indexOf("linux") >= 0 || platform.indexOf("android") >= 0 || platform.indexOf("pike") >= 0) && os !== "Linux" && os !== "Android"){
			return true;
		} else if((platform.indexOf("mac") >= 0 || platform.indexOf("ipad") >= 0 || platform.indexOf("ipod") >= 0 || platform.indexOf("iphone") >= 0) && os !== "Mac" && os !== "iOS"){
			return true;
		} else if(platform.indexOf("win") === 0 && platform.indexOf("linux") === 0 && platform.indexOf("mac") >= 0 && os !== "other"){
			return true;
		}

		if(typeof navigator.plugins === "undefined" && os !== "Windows" && os !== "Windows Phone"){
			return true;
		}

		return false;
	},
	getHasLiedBrowser: function () {
		var userAgent = navigator.userAgent.toLowerCase();
		var productSub = navigator.productSub;
		var browser;
		if(userAgent.indexOf("firefox") >= 0){
			browser = "Firefox";
		} else if(userAgent.indexOf("opera") >= 0 || userAgent.indexOf("opr") >= 0){
			browser = "Opera";
		} else if(userAgent.indexOf("chrome") >= 0){
			browser = "Chrome";
		} else if(userAgent.indexOf("safari") >= 0){
			browser = "Safari";
		} else if(userAgent.indexOf("trident") >= 0){
			browser = "Internet Explorer";
		} else{
			browser = "Other";
		}

		if((browser === "Chrome" || browser === "Safari" || browser === "Opera") && productSub !== "20030107"){
			return true;
		}

		var tempRes = eval.toString().length;
		if(tempRes === 37 && browser !== "Safari" && browser !== "Firefox" && browser !== "Other"){
			return true;
		} else if(tempRes === 39 && browser !== "Internet Explorer" && browser !== "Other"){
			return true;
		} else if(tempRes === 33 && browser !== "Chrome" && browser !== "Opera" && browser !== "Other"){
			return true;
		}

		var errFirefox;
		try {
			throw "a";
		} catch(err){
			try{
				err.toSource();
				errFirefox = true;
			} catch(errOfErr){
				errFirefox = false;
			}
		}
		if(errFirefox && browser !== "Firefox" && browser !== "Other"){
			return true;
		}
		return false;
	},
	isCanvasSupported: function () {
		var elem = document.createElement("canvas");
		return !!(elem.getContext && elem.getContext("2d"));
	},
	isWebGlSupported: function() {
		if (!this.isCanvasSupported()) {
			return false;
		}

		var canvas = document.createElement("canvas"),
			glContext;

		try {
			glContext = canvas.getContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
		} catch(e) {
			glContext = false;
		}

		return !!window.WebGLRenderingContext && !!glContext;
	},
	isIE: function () {
		if(navigator.appName === "Microsoft Internet Explorer") {
			return true;
		} else if(navigator.appName === "Netscape" && /Trident/.test(navigator.userAgent)) { // IE
			// 11
			return true;
		}
		return false;
	},
	hasSwfObjectLoaded: function(){
		return typeof window.swfobject !== "undefined";
	},
	hasMinFlashInstalled: function () {
		return swfobject.hasFlashPlayerVersion("9.0.0");
	},
	addFlashDivNode: function() {
		var node = document.createElement("div");
		node.setAttribute("id", this.options.swfContainerId);
		document.body.appendChild(node);
	},
	loadSwfAndDetectFonts: function(done) {
		var hiddenCallback = "___fp_swf_loaded";
		window[hiddenCallback] = function(fonts) {
			done(fonts);
		};
		var id = this.options.swfContainerId;
		this.addFlashDivNode();
		var flashvars = { onReady: hiddenCallback};
		var flashparams = { allowScriptAccess: "always", menu: "false" };
		swfobject.embedSWF(this.options.swfPath, id, "1", "1", "9.0.0", false, flashvars, flashparams, {});
	},
	getWebglCanvas: function() {
		var canvas = document.createElement("canvas");
		var gl = null;
		try {
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		} catch(e) {  }
		if (!gl) { gl = null; }
		return gl;
	},
	each: function (obj, iterator, context) {
		if (obj === null) {
			return;
		}
		if (this.nativeForEach && obj.forEach === this.nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (iterator.call(context, obj[i], i, obj) === {}) { return; }
			}
		} else {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (iterator.call(context, obj[key], key, obj) === {}) { return; }
				}
			}
		}
	},

	map: function(obj, iterator, context) {
		var results = [];
		if (obj == null) { return results; }
		if (this.nativeMap && obj.map === this.nativeMap) { return obj.map(iterator, context); }
		this.each(obj, function(value, index, list) {
			results[results.length] = iterator.call(context, value, index, list);
		});
		return results;
	},

	x64Add: function(m, n) {
		m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
		n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
		var o = [0, 0, 0, 0];
		o[3] += m[3] + n[3];
		o[2] += o[3] >>> 16;
		o[3] &= 0xffff;
		o[2] += m[2] + n[2];
		o[1] += o[2] >>> 16;
		o[2] &= 0xffff;
		o[1] += m[1] + n[1];
		o[0] += o[1] >>> 16;
		o[1] &= 0xffff;
		o[0] += m[0] + n[0];
		o[0] &= 0xffff;
		return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
	},

	x64Multiply: function(m, n) {
		m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
		n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
		var o = [0, 0, 0, 0];
		o[3] += m[3] * n[3];
		o[2] += o[3] >>> 16;
		o[3] &= 0xffff;
		o[2] += m[2] * n[3];
		o[1] += o[2] >>> 16;
		o[2] &= 0xffff;
		o[2] += m[3] * n[2];
		o[1] += o[2] >>> 16;
		o[2] &= 0xffff;
		o[1] += m[1] * n[3];
		o[0] += o[1] >>> 16;
		o[1] &= 0xffff;
		o[1] += m[2] * n[2];
		o[0] += o[1] >>> 16;
		o[1] &= 0xffff;
		o[1] += m[3] * n[1];
		o[0] += o[1] >>> 16;
		o[1] &= 0xffff;
		o[0] += (m[0] * n[3]) + (m[1] * n[2]) + (m[2] * n[1]) + (m[3] * n[0]);
		o[0] &= 0xffff;
		return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
	},
	x64Rotl: function(m, n) {
		n %= 64;
		if (n === 32) {
			return [m[1], m[0]];
		}
		else if (n < 32) {
			return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))];
		}
		else {
			n -= 32;
			return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))];
		}
	},
	x64LeftShift: function(m, n) {
		n %= 64;
		if (n === 0) {
			return m;
		}
		else if (n < 32) {
			return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
		}
		else {
			return [m[1] << (n - 32), 0];
		}
	},
	x64Xor: function(m, n) {
		return [m[0] ^ n[0], m[1] ^ n[1]];
	},
	x64Fmix: function(h) {
		h = this.x64Xor(h, [0, h[0] >>> 1]);
		h = this.x64Multiply(h, [0xff51afd7, 0xed558ccd]);
		h = this.x64Xor(h, [0, h[0] >>> 1]);
		h = this.x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
		h = this.x64Xor(h, [0, h[0] >>> 1]);
		return h;
	},
	x64hash128: function (key, seed) {
		key = key || "";
		seed = seed || 0;
		var remainder = key.length % 16;
		var bytes = key.length - remainder;
		var h1 = [0, seed];
		var h2 = [0, seed];
		var k1 = [0, 0];
		var k2 = [0, 0];
		var c1 = [0x87c37b91, 0x114253d5];
		var c2 = [0x4cf5ad43, 0x2745937f];
		for (var i = 0; i < bytes; i = i + 16) {
			k1 = [((key.charCodeAt(i + 4) & 0xff)) | ((key.charCodeAt(i + 5) & 0xff) << 8) | ((key.charCodeAt(i + 6) & 0xff) << 16) | ((key.charCodeAt(i + 7) & 0xff) << 24), ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(i + 1) & 0xff) << 8) | ((key.charCodeAt(i + 2) & 0xff) << 16) | ((key.charCodeAt(i + 3) & 0xff) << 24)];
			k2 = [((key.charCodeAt(i + 12) & 0xff)) | ((key.charCodeAt(i + 13) & 0xff) << 8) | ((key.charCodeAt(i + 14) & 0xff) << 16) | ((key.charCodeAt(i + 15) & 0xff) << 24), ((key.charCodeAt(i + 8) & 0xff)) | ((key.charCodeAt(i + 9) & 0xff) << 8) | ((key.charCodeAt(i + 10) & 0xff) << 16) | ((key.charCodeAt(i + 11) & 0xff) << 24)];
			k1 = this.x64Multiply(k1, c1);
			k1 = this.x64Rotl(k1, 31);
			k1 = this.x64Multiply(k1, c2);
			h1 = this.x64Xor(h1, k1);
			h1 = this.x64Rotl(h1, 27);
			h1 = this.x64Add(h1, h2);
			h1 = this.x64Add(this.x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
			k2 = this.x64Multiply(k2, c2);
			k2 = this.x64Rotl(k2, 33);
			k2 = this.x64Multiply(k2, c1);
			h2 = this.x64Xor(h2, k2);
			h2 = this.x64Rotl(h2, 31);
			h2 = this.x64Add(h2, h1);
			h2 = this.x64Add(this.x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
		}
		k1 = [0, 0];
		k2 = [0, 0];
		switch(remainder) {
			case 15:
				k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 14)], 48));
			case 14:
				k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 13)], 40));
			case 13:
				k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 12)], 32));
			case 12:
				k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 11)], 24));
			case 11:
				k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 10)], 16));
			case 10:
				k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 9)], 8));
			case 9:
				k2 = this.x64Xor(k2, [0, key.charCodeAt(i + 8)]);
				k2 = this.x64Multiply(k2, c2);
				k2 = this.x64Rotl(k2, 33);
				k2 = this.x64Multiply(k2, c1);
				h2 = this.x64Xor(h2, k2);
			case 8:
				k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 7)], 56));
			case 7:
				k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 6)], 48));
			case 6:
				k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 5)], 40));
			case 5:
				k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 4)], 32));
			case 4:
				k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 3)], 24));
			case 3:
				k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 2)], 16));
			case 2:
				k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 1)], 8));
			case 1:
				k1 = this.x64Xor(k1, [0, key.charCodeAt(i)]);
				k1 = this.x64Multiply(k1, c1);
				k1 = this.x64Rotl(k1, 31);
				k1 = this.x64Multiply(k1, c2);
				h1 = this.x64Xor(h1, k1);
		}
		h1 = this.x64Xor(h1, [0, key.length]);
		h2 = this.x64Xor(h2, [0, key.length]);
		h1 = this.x64Add(h1, h2);
		h2 = this.x64Add(h2, h1);
		h1 = this.x64Fmix(h1);
		h2 = this.x64Fmix(h2);
		h1 = this.x64Add(h1, h2);
		h2 = this.x64Add(h2, h1);
		return ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8);
	},
	desKey : "jsyd100866",
	encryptByDES:function(message) {
		var keyHex = CryptoJS.enc.Utf8.parse(BrowserFinger.desKey);
		var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		});
		return encrypted.toString();
	},
	decryptByDES:function (message) {
	    var keyHex = CryptoJS.enc.Utf8.parse(BrowserFinger.desKey);
	    var decrypted = CryptoJS.DES.decrypt({
	        ciphertext: CryptoJS.enc.Base64.parse(message)
	    }, keyHex, {
	        mode: CryptoJS.mode.ECB,
	        padding: CryptoJS.pad.Pkcs7
	    });

	    return decrypted.toString(CryptoJS.enc.Utf8);
	},
	tmAndDecryptByDES:function (message) {
	    var keyHex = CryptoJS.enc.Utf8.parse(BrowserFinger.desKey);
	    var decrypted = CryptoJS.DES.decrypt({
	        ciphertext: CryptoJS.enc.Base64.parse(message)
	    }, keyHex, {
	        mode: CryptoJS.mode.ECB,
	        padding: CryptoJS.pad.Pkcs7
	    });
	    var mobile=decrypted.toString(CryptoJS.enc.Utf8);
	    return mobile.substring(0,3)+"****"+mobile.substring(7);
	},
	tmMobile:function (mobile) {
	    if(mobile && mobile.length==11){
	    	return mobile.substring(0,3)+"****"+mobile.substring(7);
	    }
	    return "";
	}

}

module.exports = BrowserFinger