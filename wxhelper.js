(function(window){
	var rProtocol = /^(file\:.+\:\/|[\w\-]+\:\/\/)/,
		uProtocol = window.location.href.match(rProtocol)[1],

		head = document.head || document.getElementsByTagName('head')[0] || document.documentElement,
		script = document.createElement('script'),

		legalApi = ['share'],
		legalTask = [],

		emitList = {},

		baseComponents = {
			isArray : Array.isArray || function(arg){
				return arg instanceof Array;
			},
			isWindow : function(arg){
				return arg !== null && arg === arg.window;
			},
			isString : function(arg){
				return typeof arg === 'string';
			},
			isObject : function(arg){
				return Object.prototype.toString.call(arg).toLowerCase() === '[object object]';
			},
			isFunction : function(arg){
				return Object.prototype.toString.call(arg).toLowerCase() === '[object function]';
			},
			isPlainObject : function(arg){
				return baseComponents.isObject(arg) && !baseComponents.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
			},

			inArray : function(ele,arr,i){
				return Array.prototype.indexOf.call(arr,ele,i) >= 0 ? true : false;
			},
			mergeArray : function(target,source){
				var self = this,
					_target = [];
				if(!this.isArray(target)){
					_target.push(target);
					target = _target;
				}
				if(!this.isArray(source)){
					!this.inArray(source,target) && target.push(source);
				}else{
					source.forEach(function(ele){
						target = self.mergeArray(target,ele);
					});
				}
				return target;
			},
			mergeObject : function(target){
				var deep,
					args = Array.prototype.slice.call(arguments,1),
					extend = function(target,source,deep){
						for(var key in source){
							if(deep && (baseComponents.isPlainObject(source[key]) || baseComponents.isArray(source[key]))){
								if(baseComponents.isPlainObject(source[key]) && !baseComponents.isPlainObject(target[key])){
									target[key] = {};
								}
								if(baseComponents.isArray(source[key]) && !baseComponents.isArray(target[key])){
									target[key] = [];
								}
								extend(target[key],source[key],deep);
							}else if(source[key] !== undefined){
								target[key] = source[key];
							}
						}
					};
				if(typeof target === 'boolean'){
					deep = target;
					target = args.shift();
				}
				args.forEach(function(arg){
					extend(target,arg,deep);
				});
    			return target;
			},

			noop : function(){}
		},

		wxhelper = {
			ready : function(arg){
				if(baseComponents.isFunction(arg)){
					script.onload = function(){
						arg.call(wxhelper);
					};
					if(uProtocol === 'http://'){
						script.src = 'http://res.wx.qq.com/open/js/jweixin-1.1.0.js';
					}else if(uProtocol === 'https://'){
						script.src = 'https://res.wx.qq.com/open/js/jweixin-1.1.0.js';
					}
					head.appendChild(script);
				}else{
					console.warn('Hey,man!Mr Ready just want a function!');
				}
			},
			config : function(options){
				var api = [],
					requires = ['appId','timestamp','nonceStr','signature'],
					requiresError = {
						appId : 'appId : 必填 公众号的唯一标识',
						timestamp : 'timestamp : 必填 生成签名的时间戳',
						nonceStr : 'nonceStr : 必填 生成签名的随机串',
						signature : 'signature : 必填 签名'
					},
					defaults = {
					    debug : false,
					    appId : '',
					    timestamp : '',
					    nonceStr : '',
					    signature : '',
					    api : []
					},
					opts = baseComponents.mergeObject({},defaults,options);
					opts.jsApiList = [];
				requires.forEach(function(ele,index){
					if(!opts[ele]){
						console.warn(requiresError[ele]);
					}
				});
				if((baseComponents.isArray(opts.api) || baseComponents.isString(opts.api)) && opts.api.length){
					api = baseComponents.mergeArray(api,opts.api);
				}else{
					api = baseComponents.mergeArray(api,legalApi);
				}
				api.forEach(function(ele,index){
					if(baseComponents.inArray(ele,legalApi)){
						legalTask.push(ele);
						switch(ele){
							case 'share' :
								baseComponents.mergeArray(opts.jsApiList,['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo','onMenuShareQZone']);
								break;
							default :
								break;
						}
					}
				});
				delete(opts.api);
				wx.config(opts);
				return this;
			},
			share : function(options){
				var tag = 'share',
					item = ['Timeline','AppMessage','QQ','Weibo','QZone'],
					initVals,defaults,opts = {},
					baseOpts = {
						title : '',
						link : '',
						imgUrl : '',
						success : baseComponents.noop,
						cancel : baseComponents.noop
					};
				if(!baseComponents.inArray(tag,legalTask)){
					return false;
				}
				initVals = {
					title : document.title,
					desc : document.title,
					link : window.location.href
				},
				defaults = {
					title : '',
					desc : '',
					link : '',
					imgUrl : '',
					type : '',
					dataUrl : '',
					success : baseComponents.noop,
					cancel : baseComponents.noop
				},
				opts = baseComponents.mergeObject({},defaults,options);
				for(var i in opts){
					if(!opts[i]){
						opts[i] = initVals[i];
					}
				}
				for(var i in baseOpts){
					baseOpts[i] = opts[i];
				}
				item.forEach(function(ele,index){
					switch(ele){
						case 'Timeline' :
							emitList['onMenuShare' + ele] = baseComponents.mergeObject({},baseOpts);
							break;
						case 'AppMessage' :
							emitList['onMenuShare' + ele] = baseComponents.mergeObject({},baseOpts,{
								desc : opts.desc,
								type : opts.type,
								dataUrl : opts.dataUrl
							});
							break;
						case 'QQ' :
						case 'Weibo' :
						case 'QZone' :
							emitList['onMenuShare' + ele] = baseComponents.mergeObject({},baseOpts,{
								desc : opts.desc
							});
							break;
						default :
							break;
					}
				});
				return this;
			},
			emit : function(){
				wx.ready(function(){
					for(var i in emitList){
						wx[i](emitList[i]);
					}
				});
				return this;
			}
		};

	window.wxhelper = wxhelper;

})(window);