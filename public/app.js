
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }var raf = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : (function(blk) { return setTimeout(blk,1000 / 60); });

// Scheduler
class Scheduler {
	
	constructor(){
		var self = this;
		
		this.queue = [];
		this.stage = -1;
		this.batch = 0;
		this.scheduled = false;
		this.listeners = {};
		
		this.__ticker = function(e) {
			
			self.scheduled = false;
			return self.tick(e);
		};
	}
	
	add(item,force){
		
		if (force || this.queue.indexOf(item) == -1) {
			
			this.queue.push(item);
		}		
		if (!(this.scheduled)) { return this.schedule() }	}
	
	listen(ns,item){
		
		this.listeners[ns] || (this.listeners[ns] = new Set());
		return this.listeners[ns].add(item);
	}
	
	unlisten(ns,item){
		
		return this.listeners[ns] && this.listeners[ns].delete(item);
	}
	
	get promise(){
		var self = this;
		
		return new Promise(function(resolve) { return self.add(resolve); });
	}
	
	tick(timestamp){
		var self = this;
		
		var items = this.queue;
		if (!(this.ts)) { this.ts = timestamp; }		this.dt = timestamp - this.ts;
		this.ts = timestamp;
		this.queue = [];
		this.stage = 1;
		this.batch++;
		
		if (items.length) {
			
			for (let i = 0, ary = iter$(items), len = ary.length; i < len; i++) {
				let item = ary[i];
				
				if (typeof item === 'string' && this.listeners[item]) {
					
					this.listeners[item].forEach(function(item) {
						
						if (item.tick instanceof Function) {
							
							return item.tick(self);
						} else if (item instanceof Function) {
							
							return item(self);
						}					});
				} else if (item instanceof Function) {
					
					item(this.dt,this);
				} else if (item.tick) {
					
					item.tick(this.dt,this);
				}			}		}		this.stage = 2;
		this.stage = this.scheduled ? 0 : -1;
		return this;
	}
	
	schedule(){
		
		if (!(this.scheduled)) {
			
			this.scheduled = true;
			if (this.stage == -1) {
				
				this.stage = 0;
			}			raf(this.__ticker);
		}		return this;
	}
}

function iter$$1(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function extend$(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
}const keyCodes = {
	esc: [27],
	tab: [9],
	enter: [13],
	space: [32],
	up: [38],
	down: [40],
	del: [8,46]
};



// only for web?
extend$(Event,{
	
	
	wait$mod(state,params){
		
		return new Promise(function(resolve) {
			
			return setTimeout(resolve,((params[0] instanceof Number) ? params[0] : 1000));
		});
	},
	
	sel$mod(state,params){
		
		return state.event.target.closest(params[0]) || false;
	},
	
	throttle$mod({handler,element,event},params){
		
		if (handler.throttled) { return false }		handler.throttled = true;
		let name = params[0];
		if (!((name instanceof String))) {
			
			name = ("in-" + (event.type || 'event'));
		}		let cl = element.classList;
		cl.add(name);
		handler.once('idle',function() {
			
			cl.remove(name);
			return handler.throttled = false;
		});
		return true;
	},
});


// could cache similar event handlers with the same parts
class EventHandler {
	
	constructor(params,closure){
		
		this.params = params;
		this.closure = closure;
	}
	
	getHandlerForMethod(el,name){
		
		if (!(el)) { return null }		return el[name] ? el : this.getHandlerForMethod(el.parentNode,name);
	}
	
	emit(name,...params){
		return imba.emit(this,name,params);
	}
	on(name,...params){
		return imba.listen(this,name,...params);
	}
	once(name,...params){
		return imba.once(this,name,...params);
	}
	un(name,...params){
		return imba.unlisten(this,name,...params);
	}
	
	async handleEvent(event){
		
		var target = event.target;
		var element = event.currentTarget;
		var mods = this.params;
		let commit = true;// @params.length == 0
		
		// console.log 'handle event',event.type,@params
		this.currentEvents || (this.currentEvents = new Set());
		this.currentEvents.add(event);
		
		let state = {
			element: element,
			event: event,
			modifiers: mods,
			handler: this
		};
		
		for (let j = 0, keys = Object.keys(mods), l = keys.length, handler, val; j < l; j++){
			handler = keys[j];val = mods[handler];
			// let handler = part
			if (handler.indexOf('~') > 0) {
				
				handler = handler.split('~')[0];
			}			
			let args = [event,this];
			let res = undefined;
			let context = null;
			
			if (handler[0] == '$' && handler[1] == '_' && (val[0] instanceof Function)) {
				
				handler = val[0];
				args = [event,state].concat(val.slice(1));
				context = element;
			} else if (val instanceof Array) {
				
				args = val.slice();
				
				for (let i = 0, items = iter$$1(args), len = items.length; i < len; i++) {
					let par = items[i];
					
					// what about fully nested arrays and objects?
					// ought to redirect this
					if (typeof par == 'string' && par[0] == '~' && par[1] == '$') {
						
						let name = par.slice(2);
						let chain = name.split('.');
						let value = state[chain.shift()] || event;
						
						for (let i = 0, ary = iter$$1(chain), len = ary.length; i < len; i++) {
							let part = ary[i];
							
							value = value ? value[part] : undefined;
						}						
						args[i] = value;
					}				}			}			
			// console.log "handle part",i,handler,event.currentTarget
			// check if it is an array?
			if (handler == 'stop') {
				
				event.stopImmediatePropagation();
			} else if (handler == 'prevent') {
				
				event.preventDefault();
			} else if (handler == 'ctrl') {
				
				if (!(event.ctrlKey)) { break; }			} else if (handler == 'commit') {
				
				commit = true;
			} else if (handler == 'silence') {
				
				commit = false;
			} else if (handler == 'alt') {
				
				if (!(event.altKey)) { break; }			} else if (handler == 'shift') {
				
				if (!(event.shiftKey)) { break; }			} else if (handler == 'meta') {
				
				if (!(event.metaKey)) { break; }			} else if (handler == 'self') {
				
				if (target != element) { break; }			} else if (handler == 'once') {
				
				// clean up bound data as well
				element.removeEventListener(event.type,this);
			} else if (handler == 'options') {
				
				continue;
			} else if (keyCodes[handler]) {
				
				if (keyCodes[handler].indexOf(event.keyCode) < 0) {
					
					break;
				}			} else if (handler == 'trigger' || handler == 'emit') {
				
				let name = args[0];
				let detail = args[1];// is custom event if not?
				let e = new CustomEvent(name,{bubbles: true,detail: detail});// : Event.new(name)
				e.originalEvent = event;
				let customRes = element.dispatchEvent(e);
			} else if (typeof handler == 'string') {
				
				let mod = handler + '$mod';
				
				if (event[mod] instanceof Function) {
					
					// console.log "found modifier!",mod
					handler = mod;
					context = event;
					args = [state,args];
				} else if (handler[0] == '_') {
					
					handler = handler.slice(1);
					context = this.closure;
				} else {
					
					context = this.getHandlerForMethod(element,handler);
				}			}			
			if (handler instanceof Function) {
				
				res = handler.apply(context || element,args);
			} else if (context) {
				
				res = context[handler].apply(context,args);
			}			
			if (res && (res.then instanceof Function)) {
				
				if (commit) { imba.commit(); }				// TODO what if await fails?
				res = await res;
			}			
			if (res === false) {
				
				break;
			}			
			state.value = res;
		}		
		if (commit) { imba.commit(); }		this.currentEvents.delete(event);
		if (this.currentEvents.size == 0) {
			
			this.emit('idle');
		}		// what if the result is a promise
		return;
	}
}

var {Document: Document,Node: Node$1,Text: Text$1,Comment: Comment$1,Element: Element$1,SVGElement: SVGElement,HTMLElement: HTMLElement$1,DocumentFragment: DocumentFragment,ShadowRoot: ShadowRoot$1,Event: Event$1,CustomEvent: CustomEvent$1,MouseEvent: MouseEvent,document: document$1} = window;

function iter$$2(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function extend$$1(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
}
extend$$1(DocumentFragment,{
	
	
	get parentContext(){
		
		return this.up$ || this.__parent;
	},
	
	// Called to make a documentFragment become a live fragment
	setup$(flags,options){
		
		this.__start = imba.document.createComment('start');
		this.__end = imba.document.createComment('end');
		
		this.__end.replaceWith$ = function(other) {
			
			this.parentNode.insertBefore(other,this);
			return other;
		};
		
		this.appendChild(this.__start);
		return this.appendChild(this.__end);
	},
	
	// when we for sure know that the only content should be
	// a single text node
	text$(item){
		
		if (!(this.__text)) {
			
			this.__text = this.insert$(item);
		} else {
			
			this.__text.textContent = item;
		}		return;
	},
	
	insert$(item,options,toReplace){
		
		if (this.__parent) {
			
			// if the fragment is attached to a parent
			// we can just proxy the call through
			return this.__parent.insert$(item,options,toReplace || this.__end);
		} else {
			
			return Element$1.prototype.insert$.call(this,item,options,toReplace || this.__end);
		}	},
	
	insertInto$(parent,before){
		
		if (!(this.__parent)) {
			
			this.__parent = parent;
			// console.log 'insertFrgment into',parent,Array.from(@childNodes)
			parent.appendChild$(this);
		}		return this;
	},
	
	replaceWith$(other,parent){
		
		this.__start.insertBeforeBegin$(other);
		var el = this.__start;
		while (el){
			
			let next = el.nextSibling;
			this.appendChild(el);
			if (el == this.__end) { break; }			el = next;
			
		}		return other;
	},
	
	appendChild$(child){
		
		this.__end ? this.__end.insertBeforeBegin$(child) : this.appendChild(child);
		return child;
	},
	
	removeChild$(child){
		
		child.parentNode && child.parentNode.removeChild(child);
		return this;
	},
	
	isEmpty$(){
		
		let el = this.__start;
		let end = this.__end;
		
		while (el = el.nextSibling){
			
			if (el == end) { break; }			if ((el instanceof Element$1) || (el instanceof Text$1)) { return false }		}		return true;
	},
});


extend$$1(ShadowRoot$1,{
	
	get parentContext(){
		
		return this.host;
	},
});

class TagCollection {
	
	constructor(f,parent){
		
		this.__f = f;
		this.__parent = parent;
		
		if (!((f & 128)) && (this instanceof KeyedTagFragment)) {
			
			this.__start = document$1.createComment('start');
			if (parent) { parent.appendChild$(this.__start); }		}		
		if (!(f & 256)) {
			
			this.__end = document$1.createComment('end');
			if (parent) { parent.appendChild$(this.__end); }		}		
		this.setup();
	}
	
	get parentContext(){
		
		return this.__parent;
	}
	
	appendChild$(item,index){
		
		// we know that these items are dom elements
		if (this.__end && this.__parent) {
			
			this.__end.insertBeforeBegin$(item);
		} else if (this.__parent) {
			
			this.__parent.appendChild$(item);
		}		return;
	}
	
	replaceWith$(other){
		
		this.detachNodes();
		this.__end.insertBeforeBegin$(other);
		this.__parent.removeChild$(this.__end);
		this.__parent = null;
		return;
	}
	
	joinBefore$(before){
		
		return this.insertInto$(before.parentNode,before);
	}
	
	insertInto$(parent,before){
		
		if (!(this.__parent)) {
			
			this.__parent = parent;
			before ? before.insertBeforeBegin$(this.__end) : parent.appendChild$(this.__end);
			this.attachNodes();
		}		return this;
	}
	
	replace$(other){
		
		if (!(this.__parent)) {
			
			this.__parent = other.parentNode;
		}		other.replaceWith$(this.__end);
		this.attachNodes();
		return this;
		
	}
	setup(){
		
		return this;
	}
}
class KeyedTagFragment extends TagCollection {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	
	setup(){
		
		this.array = [];
		this.changes = new Map();
		this.dirty = false;
		return this.$ = {};
	}
	
	push(item,idx){
		
		// on first iteration we can merely run through
		if (!(this.__f & 1)) {
			
			this.array.push(item);
			this.appendChild$(item);
			return;
		}		
		let toReplace = this.array[idx];
		
		if (toReplace === item) ; else {
			
			this.dirty = true;
			// if this is a new item
			let prevIndex = this.array.indexOf(item);
			let changed = this.changes.get(item);
			
			if (prevIndex === -1) {
				
				// should we mark the one currently in slot as removed?
				this.array.splice(idx,0,item);
				this.insertChild(item,idx);
			} else if (prevIndex === idx + 1) {
				
				if (toReplace) {
					
					this.changes.set(toReplace,-1);
				}				this.array.splice(idx,1);
			} else {
				
				if (prevIndex >= 0) { this.array.splice(prevIndex,1); }				this.array.splice(idx,0,item);
				this.insertChild(item,idx);
			}			
			if (changed == -1) {
				
				this.changes.delete(item);
			}		}		return;
	}
	
	insertChild(item,index){
		
		if (index > 0) {
			
			let other = this.array[index - 1];
			// will fail with text nodes
			other.insertAfterEnd$(item);
		} else if (this.__start) {
			
			this.__start.insertAfterEnd$(item);
		} else {
			
			this.__parent.insertAfterBegin$(item);
		}		return;
	}
	
	removeChild(item,index){
		
		// @map.delete(item)
		// what if this is a fragment or virtual node?
		if (item.parentNode == this.__parent) {
			
			this.__parent.removeChild(item);
		}		return;
	}
	
	attachNodes(){
		
		for (let i = 0, items = iter$$2(this.array), len = items.length; i < len; i++) {
			let item = items[i];
			
			this.__end.insertBeforeBegin$(item);
		}		return;
	}
	
	detachNodes(){
		
		for (let i = 0, items = iter$$2(this.array), len = items.length; i < len; i++) {
			let item = items[i];
			
			this.__parent.removeChild(item);
		}		return;
	}
	
	end$(index){
		var self = this;
		
		if (!(this.__f & 1)) {
			
			this.__f |= 1;
			return;
		}		
		if (this.dirty) {
			
			this.changes.forEach(function(pos,item) {
				
				if (pos == -1) {
					
					return self.removeChild(item);
				}			});
			this.changes.clear();
			this.dirty = false;
		}		
		// there are some items we should remove now
		if (this.array.length > index) {
			
			
			// remove the children below
			while (this.array.length > index){
				
				let item = this.array.pop();
				this.removeChild(item);
			}			// @array.length = index
		}		return;
	}
} KeyedTagFragment.init$();
class IndexedTagFragment extends TagCollection {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	
	
	setup(){
		
		this.$ = [];
		return this.length = 0;
	}
	
	end$(len){
		
		let from = this.length;
		if (from == len || !(this.__parent)) { return }		let array = this.$;
		let par = this.__parent;
		
		if (from > len) {
			
			while (from > len){
				
				par.removeChild$(array[--from]);
			}		} else if (len > from) {
			
			while (len > from){
				
				this.appendChild$(array[from++]);
			}		}		this.length = len;
		return;
	}
	
	attachNodes(){
		
		for (let i = 0, items = iter$$2(this.$), len = items.length; i < len; i++) {
			let item = items[i];
			
			if (i == this.length) { break; }			this.__end.insertBeforeBegin$(item);
		}		return;
	}
	
	detachNodes(){
		
		let i = 0;
		while (i < this.length){
			
			let item = this.$[i++];
			this.__parent.removeChild$(item);
		}		return;
	}
} IndexedTagFragment.init$();
function createLiveFragment(bitflags,options,par){
	
	var el = document$1.createDocumentFragment();
	el.setup$(bitflags,options);
	if (par) { el.up$ = par; }	return el;
}
function createIndexedFragment(bitflags,parent){
	
	return new IndexedTagFragment(bitflags,parent);
}
function createKeyedFragment(bitflags,parent){
	
	return new KeyedTagFragment(bitflags,parent);
}

function extend$$2(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
}


extend$$2(SVGElement,{
	
	
	flag$(str){
		
		this.className.baseVal = str;
		return;
	},
	
	flagSelf$(str){
		var self = this;
		
		// if a tag receives flags from inside <self> we need to
		// redefine the flag-methods to later use both
		this.flag$ = function(str) { return self.flagSync$(self.__extflags = str); };
		this.flagSelf$ = function(str) { return self.flagSync$(self.__ownflags = str); };
		this.className.baseVal = (this.className.baseVal || '') + ' ' + (this.__ownflags = str);
		return;
	},
	
	flagSync$(){
		
		return this.className.baseVal = ((this.__extflags || '') + ' ' + (this.__ownflags || ''));
	},
});

function iter$$3(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function extend$$3(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
}var customElements_;
var root = ((typeof window !== 'undefined') ? window : (((typeof global !== 'undefined') ? global : null)));

var imba$1 = {
	version: '2.0.0',
	global: root,
	ctx: null,
	document: root.document
};

root.imba = imba$1;

(customElements_ = root.customElements) || (root.customElements = {
	define: function() { return true; },// console.log('no custom elements')
	get: function() { return true; }// console.log('no custom elements')
});

imba$1.setTimeout = function(fn,ms) {
	
	return setTimeout(function() {
		
		fn();
		return imba$1.commit();
	},ms);
};

imba$1.setInterval = function(fn,ms) {
	
	return setInterval(function() {
		
		fn();
		return imba$1.commit();
	},ms);
};

imba$1.clearInterval = root.clearInterval;
imba$1.clearTimeout = root.clearTimeout;

imba$1.q$ = function (query,ctx){
	
	return ((ctx instanceof Element) ? ctx : document).querySelector(query);
};

imba$1.q$$ = function (query,ctx){
	
	return ((ctx instanceof Element) ? ctx : document).querySelectorAll(query);
};

imba$1.inlineStyles = function (styles){
	
	var el = document.createElement('style');
	el.textContent = styles;
	document.head.appendChild(el);
	return;
};

var dashRegex = /-./g;

imba$1.toCamelCase = function (str){
	
	if (str.indexOf('-') >= 0) {
		
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		
		return str;
	}};

// Basic events - move to separate file?
var emit__ = function(event,args,node) {
	
	var prev;
	var cb;
	var ret;
	
	while ((prev = node) && (node = node.next)){
		
		if (cb = node.listener) {
			
			if (node.path && cb[node.path]) {
				
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
			} else {
				
				// check if it is a method?
				ret = args ? cb.apply(node,args) : cb.call(node);
			}		}		
		if (node.times && --node.times <= 0) {
			
			prev.next = node.next;
			node.listener = null;
		}	}	return;
};

// method for registering a listener on object
imba$1.listen = function (obj,event,listener,path){
	var __listeners___;
	
	var cbs;
	var list;
	var tail;
	cbs = (__listeners___ = obj.__listeners__) || (obj.__listeners__ = {});
	list = cbs[event] || (cbs[event] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.listener = listener;
	tail.path = path;
	list.tail = tail.next = {};
	return tail;
};

// register a listener once
imba$1.once = function (obj,event,listener){
	
	var tail = imba$1.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};

// remove a listener
imba$1.unlisten = function (obj,event,cb,meth){
	
	var node;
	var prev;
	var meta = obj.__listeners__;
	if (!(meta)) { return }	
	if (node = meta[event]) {
		
		while ((prev = node) && (node = node.next)){
			
			if (node == cb || node.listener == cb) {
				
				prev.next = node.next;
				// check for correct path as well?
				node.listener = null;
				break;
			}		}	}	return;
};

// emit event
imba$1.emit = function (obj,event,params){
	var cb;
	
	if (cb = obj.__listeners__) {
		
		if (cb[event]) { emit__(event,params,cb[event]); }		if (cb.all) { emit__(event,[event,params],cb.all); }	}	return;
};

imba$1.scheduler = new Scheduler();
imba$1.commit = function() { return imba$1.scheduler.add('render'); };
imba$1.tick = function() {
	
	imba$1.commit();
	return imba$1.scheduler.promise;
};

/*
DOM
*/


imba$1.mount = function (element,into){
	
	// automatic scheduling of element - even before
	element.__schedule = true;
	return (into || document.body).appendChild(element);
};


const CustomTagConstructors = {};

class ImbaElementRegistry {
	
	
	constructor(){
		
		this.__types = {};
	}
	
	lookup(name){
		
		return this.__types[name];
	}
	
	get(name,klass){
		
		if (!(name) || name == 'component') { return ImbaElement }		if (this.__types[name]) { return this.__types[name] }		if (klass && root[klass]) { return root[klass] }		return root.customElements.get(name) || ImbaElement;
	}
	
	create(name){
		
		if (this.__types[name]) {
			
			// TODO refactor
			return this.__types[name].create$();
		} else {
			
			return document.createElement(name);
		}	}
	
	define(name,klass,options){
		
		this.__types[name] = klass;
		
		
		let proto = klass.prototype;
		if (proto.render && proto.end$ == Element.prototype.end$) {
			
			proto.end$ = proto.render;
		}		
		if (options && options.extends) {
			
			CustomTagConstructors[name] = klass;
		} else {
			
			root.customElements.define(name,klass);
		}		return klass;
	}
}
imba$1.tags = new ImbaElementRegistry();

var proxyHandler = {
	get(target,name){
		
		let ctx = target;
		let val = undefined;
		while (ctx && val == undefined){
			
			if (ctx = ctx.parentContext) {
				
				val = ctx[name];
			}		}		return val;
	}
};

extend$$3(Node,{
	
	
	get __context(){
		var context$_;
		
		return (context$_ = this.context$) || (this.context$ = new Proxy(this,proxyHandler));
	},
	
	get parentContext(){
		
		return this.up$ || this.parentNode;
	},
	
	init$(){
		
		return this;
	},
	
	// replace this with something else
	replaceWith$(other){
		
		if (!((other instanceof Node)) && other.replace$) {
			
			other.replace$(this);
		} else {
			
			this.parentNode.replaceChild(other,this);
		}		return other;
	},
	
	insertInto$(parent){
		
		parent.appendChild$(this);
		return this;
	},
	
	insertBefore$(el,prev){
		
		return this.insertBefore(el,prev);
	},
	
	insertBeforeBegin$(other){
		
		return this.parentNode.insertBefore(other,this);
	},
	
	insertAfterEnd$(other){
		
		if (this.nextSibling) {
			
			return this.nextSibling.insertBeforeBegin$(other);
		} else {
			
			return this.parentNode.appendChild(other);
		}	},
	
	insertAfterBegin$(other){
		
		if (this.childNodes[0]) {
			
			return this.childNodes[0].insertBeforeBegin$(other);
		} else {
			
			return this.appendChild(other);
		}	},
});

extend$$3(Comment,{
	
	// replace this with something else
	replaceWith$(other){
		
		if (other && other.joinBefore$) {
			
			other.joinBefore$(this);
		} else {
			
			this.parentNode.insertBefore$(other,this);
		}		// other.insertBeforeBegin$(this)
		this.parentNode.removeChild(this);
		// @parentNode.replaceChild(other,this)
		return other;
	},
});

// what if this is in a webworker?
extend$$3(Element,{
	
	
	emit(name,detail,o = {bubbles: true}){
		
		if (detail != undefined) { o.detail = detail; }		let event = new CustomEvent(name,o);
		let res = this.dispatchEvent(event);
		return event;
	},
	
	slot$(name,ctx){
		
		return this;
	},
	
	on$(type,mods,scope){
		
		
		var check = 'on$' + type;
		var handler;
		
		// check if a custom handler exists for this type?
		if (this[check] instanceof Function) {
			
			handler = this[check](mods,scope);
		}		
		handler = new EventHandler(mods,scope);
		var capture = mods.capture;
		var passive = mods.passive;
		
		var o = capture;
		
		if (passive) {
			
			o = {passive: passive,capture: capture};
		}		
		this.addEventListener(type,handler,o);
		return handler;
	},
	
	// inline in files or remove all together?
	text$(item){
		
		this.textContent = item;
		return this;
	},
	
	insert$(item,f,prev){
		
		let type = typeof item;
		
		if (type === 'undefined' || item === null) {
			
			// what if the prev value was the same?
			if (prev && (prev instanceof Comment)) {
				
				return prev;
			}			
			let el = document.createComment('');
			prev ? prev.replaceWith$(el) : el.insertInto$(this);
			return el;
		}		
		// dont reinsert again
		if (item === prev) {
			
			return item;
		} else if (type !== 'object') {
			
			let res;
			let txt = item;
			
			if ((f & 128) && (f & 256)) {
				
				// FIXME what if the previous one was not text? Possibly dangerous
				// when we set this on a fragment - it essentially replaces the whole
				// fragment?
				this.textContent = txt;
				return;
			}			
			if (prev) {
				
				if (prev instanceof Text) {
					
					prev.textContent = txt;
					return prev;
				} else {
					
					res = document.createTextNode(txt);
					prev.replaceWith$(res,this);
					return res;
				}			} else {
				
				this.appendChild$(res = document.createTextNode(txt));
				return res;
			}		} else {
			
			prev ? prev.replaceWith$(item,this) : item.insertInto$(this);
			return item;
		}	},
	
	flag$(str){
		
		this.className = str;
		return;
	},
	
	flagSelf$(str){
		var self = this;
		
		// if a tag receives flags from inside <self> we need to
		// redefine the flag-methods to later use both
		let existing = (this.__extflags || (this.__extflags = this.className));
		this.flag$ = function(str) { return self.flagSync$(self.__extflags = str); };
		this.flagSelf$ = function(str) { return self.flagSync$(self.__ownflags = str); };
		this.className = (existing ? (existing + ' ') : '') + (this.__ownflags = str);
		return;
	},
	
	flagSync$(){
		
		return this.className = ((this.__extflags || '') + ' ' + (this.__ownflags || ''));
	},
	
	open$(){
		
		return this;
	},
	
	close$(){
		
		return this;
	},
	
	end$(){
		
		if (this.render) { this.render(); }		return;
	},
	
	css$(key,value,mods){
		
		return this.style[key] = value;
	},
});

Element.prototype.appendChild$ = Element.prototype.appendChild;
Element.prototype.removeChild$ = Element.prototype.removeChild;
Element.prototype.insertBefore$ = Element.prototype.insertBefore;
Element.prototype.replaceChild$ = Element.prototype.replaceChild;
Element.prototype.set$ = Element.prototype.setAttribute;
Element.prototype.setns$ = Element.prototype.setAttributeNS;

ShadowRoot.prototype.insert$ = Element.prototype.insert$;
ShadowRoot.prototype.appendChild$ = Element.prototype.appendChild$;

imba$1.createLiveFragment = createLiveFragment;
imba$1.createIndexedFragment = createIndexedFragment;
imba$1.createKeyedFragment = createKeyedFragment;

// Create custom tag with support for scheduling and unscheduling etc

var mountedQueue;
var mountedFlush = function() {
	
	let items = mountedQueue;
	mountedQueue = null;
	if (items) {
		
		for (let i = 0, ary = iter$$3(items), len = ary.length; i < len; i++) {
			let item = ary[i];
			
			item.mounted$();
		}	}	return;
};


class ImbaElement extends HTMLElement {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	
	constructor(){
		
		super();
		this.setup$();
		if (this.build) { this.build(); }	}
	
	setup$(){
		
		this.__slots = {};
		return this.__f = 0;
	}
	
	init$(){
		
		this.__f |= 1;
		return this;
	}
	
	// returns the named slot - for context
	slot$(name,ctx){
		var slots_;
		
		if (name == '__' && !(this.render)) {
			
			return this;
		}		
		return (slots_ = this.__slots)[name] || (slots_[name] = imba$1.createLiveFragment(0,null,this));
	}
	
	schedule(){
		
		imba$1.scheduler.listen('render',this);
		this.__f |= 64;
		return this;
	}
	
	unschedule(){
		
		imba$1.scheduler.unlisten('render',this);
		this.__f &= ~64;
		return this;
	}
	
	
	connectedCallback(){
		
		let flags = this.__f;
		
		if (flags & 16) {
			
			return;
		}		
		if (this.mounted instanceof Function) {
			
			if (!(mountedQueue)) {
				
				mountedQueue = [];
				Promise.resolve().then(mountedFlush);
			}			mountedQueue.unshift(this);
		}		
		if (!(flags & 1)) {
			
			this.init$();
		}		
		if (!(flags & 8)) {
			
			this.__f |= 8;
			if (this.awaken) { this.awaken(); }		}		
		if (!(flags)) {
			
			if (this.render) { this.render(); }		}		
		this.mount$();
		return this;
	}
	
	mount$(){
		
		this.__f |= 16;
		
		if (this.__schedule) { this.schedule(); }		
		if (this.mount instanceof Function) {
			
			let res = this.mount();
			if (res && (res.then instanceof Function)) {
				
				res.then(imba$1.commit);
			}		}		return this;
	}
	
	mounted$(){
		
		if (this.mounted instanceof Function) { this.mounted(); }		return this;
	}
	
	disconnectedCallback(){
		
		this.__f &= ~16;
		if (this.__f & 64) { this.unschedule(); }		if (this.unmount instanceof Function) { return this.unmount() }	}
	
	tick(){
		
		return this.render && this.render();
	}
	
	awaken(){
		
		return this.__schedule = true;
		
	}
} ImbaElement.init$();
root.customElements.define('imba-element',ImbaElement);


imba$1.createElement = function (name,bitflags,parent,flags,text,sfc){
	
	var el = document.createElement(name);
	
	if (flags) { el.className = flags; }	
	if (sfc) {
		
		el.setAttribute('data-' + sfc,'');
	}	
	if (text !== null) {
		
		el.text$(text);
	}	
	if (parent && (parent instanceof Node)) {
		
		el.insertInto$(parent);
	}	
	return el;
};

imba$1.createComponent = function (name,bitflags,parent,flags,text,sfc){
	
	// the component could have a different web-components name?
	var el;
	
	if (CustomTagConstructors[name]) {
		
		el = CustomTagConstructors[name].create$(el);
		el.slot$ = ImbaElement.prototype.slot$;
		el.__slots = {};
	} else {
		
		el = document.createElement(name);
	}	
	el.up$ = parent;
	el.__f = bitflags;
	el.init$();
	
	if (text !== null) {
		
		el.slot$('__').text$(text);
	}	
	if (flags) { el.className = flags; }	
	if (sfc) {
		
		el.setAttribute('data-' + sfc,'');
	}	
	return el;
};

imba$1.createSVGElement = function (name,bitflags,parent,flags,text,sfc){
	
	var el = document.createElementNS("http://www.w3.org/2000/svg",name);
	if (flags) {
		
		{
			
			el.className.baseVal = flags;
		}	}	if (parent && (parent instanceof Node)) {
		
		el.insertInto$(parent);
	}	return el;
};

// import './intersect'

function iter$$4(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function extend$$4(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
}var isGroup = function(obj) {
	
	return (obj instanceof Array) || (obj && (obj.has instanceof Function));
};

var bindHas = function(object,value) {
	
	if (object instanceof Array) {
		
		return object.indexOf(value) >= 0;
	} else if (object && (object.has instanceof Function)) {
		
		return object.has(value);
	} else if (object && (object.contains instanceof Function)) {
		
		return object.contains(value);
	} else if (object == value) {
		
		return true;
	} else {
		
		return false;
	}};

var bindAdd = function(object,value) {
	
	if (object instanceof Array) {
		
		return object.push(value);
	} else if (object && (object.add instanceof Function)) {
		
		return object.add(value);
	}};

var bindRemove = function(object,value) {
	
	if (object instanceof Array) {
		
		let idx = object.indexOf(value);
		if (idx >= 0) { return object.splice(idx,1) }	} else if (object && (object.delete instanceof Function)) {
		
		return object.delete(value);
	}};

function createProxyProperty(target){
	
	function getter(){
		
		return target[0] ? target[0][target[1]] : undefined;
	}	
	function setter(v){
		
		return target[0] ? ((target[0][target[1]] = v)) : null;
	}	
	return {
		get: getter,
		set: setter
	};
}
/*
Data binding
*/

extend$$4(Element,{
	
	getRichValue(){
		
		return this.value;
	},
	
	setRichValue(value){
		
		return this.value = value;
	},
	
	bind$(key,value){
		
		let o = value || [];
		
		if (key == 'model') {
			
			if (!(this.__f & 16384)) {
				
				this.__f |= 16384;
				if (this.change$) { this.on$('change',{_change$: true},this); }				if (this.input$) { this.on$('input',{capture: true,_input$: true},this); }			}		}		
		Object.defineProperty(this,key,(o instanceof Array) ? createProxyProperty(o) : o);
		return o;
	},
});

Object.defineProperty(Element.prototype,'richValue',{
	get(){
		
		return this.getRichValue();
	},
	set(v){
		
		return this.setRichValue(v);
	}
});

extend$$4(HTMLSelectElement,{
	
	
	change$(e){
		
		if (!(this.__f & 16384)) { return }		
		let model = this.model;
		let prev = this.__richValue;
		this.__richValue = undefined;
		let values = this.getRichValue();
		
		if (this.multiple) {
			
			if (prev) {
				
				for (let i = 0, items = iter$$4(prev), len = items.length; i < len; i++) {
					let value = items[i];
					if (values.indexOf(value) != -1) { continue; }					
					bindRemove(model,value);
				}			}			
			for (let i = 0, items = iter$$4(values), len = items.length; i < len; i++) {
				let value = items[i];
				
				if (!(prev) || prev.indexOf(value) == -1) {
					
					bindAdd(model,value);
				}			}		} else {
			
			this.model = values[0];
		}		return this;
	},
	
	getRichValue(){
		var res;
		
		if (this.__richValue) {
			
			return this.__richValue;
		}		
		res = [];
		for (let i = 0, items = iter$$4(this.selectedOptions), len = items.length; i < len; i++) {
			let o = items[i];
			
			res.push(o.richValue);
		}		return this.__richValue = res;
	},
	
	syncValue(){
		
		let model = this.model;
		
		if (this.multiple) {
			
			let vals = [];
			for (let i = 0, items = iter$$4(this.options), len = items.length; i < len; i++) {
				let option = items[i];
				
				let val = option.richValue;
				let sel = bindHas(model,val);
				option.selected = sel;
				if (sel) { vals.push(val); }			}			this.__richValue = vals;
		} else {
			
			for (let i = 0, items = iter$$4(this.options), len = items.length; i < len; i++) {
				let option = items[i];
				
				let val = option.richValue;
				if (val == model) {
					
					this.__richValue = [val];
					this.selectedIndex = i;break;
				}			}		}		return;
	},
	
	end$(){
		
		return this.syncValue();
	},
});

extend$$4(HTMLOptionElement,{
	
	setRichValue(value){
		
		this.__richValue = value;
		return this.value = value;
	},
	
	getRichValue(){
		
		if (this.__richValue !== undefined) {
			
			return this.__richValue;
		}		return this.value;
	},
});

extend$$4(HTMLTextAreaElement,{
	
	setRichValue(value){
		
		this.__richValue = value;
		return this.value = value;
	},
	
	getRichValue(){
		
		if (this.__richValue !== undefined) {
			
			return this.__richValue;
		}		return this.value;
	},
	
	input$(e){
		
		return this.model = this.value;
	},
	
	end$(){
		
		return this.value = this.model;
	},
});

extend$$4(HTMLInputElement,{
	
	
	input$(e){
		
		if (!(this.__f & 16384)) { return }		let typ = this.type;
		
		if (typ == 'checkbox' || typ == 'radio') {
			
			return;
		}		
		this.__richValue = undefined;
		return this.model = this.richValue;
	},
	
	change$(e){
		
		if (!(this.__f & 16384)) { return }		
		let model = this.model;
		let val = this.richValue;
		
		if (this.type == 'checkbox' || this.type == 'radio') {
			
			let checked = this.checked;
			if (isGroup(model)) {
				
				return checked ? bindAdd(model,val) : bindRemove(model,val);
			} else {
				
				return this.model = checked ? val : false;
			}		}	},
	
	setRichValue(value){
		
		this.__richValue = value;
		return this.value = value;
	},
	
	getRichValue(){
		
		if (this.__richValue !== undefined) {
			
			return this.__richValue;
		}		
		let value = this.value;
		let typ = this.type;
		
		if (typ == 'range' || typ == 'number') {
			
			value = this.valueAsNumber;
			if (Number.isNaN(value)) { value = null; }		} else if (typ == 'checkbox') {
			
			if (value == undefined || value === 'on') { value = true; }		}		
		return value;
	},
	
	end$(){
		
		if (this.__f & 16384) {
			
			if (this.type == 'checkbox' || this.type == 'radio') {
				
				return this.checked = bindHas(this.model,this.richValue);
			} else {
				
				return this.richValue = this.model;
			}		}	},
});

let dict = [
	{cham: "k'goo",
	eng: "well",
	khmer: "",
	def: "",
	partOfSpeech: "adverb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "s'bai",
	eng: "happy",
	khmer: "",
	def: "",
	partOfSpeech: "adverb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "gae",
	eng: "question particle",
	khmer: "",
	def: "",
	partOfSpeech: "final particle",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "hhooq",
	eng: "yes",
	khmer: "",
	def: "",
	partOfSpeech: "exclamation",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "oo",
	eng: "not, no",
	khmer: "",
	def: "",
	partOfSpeech: "exclamation, adverb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "lin",
	eng: "I, me",
	khmer: "",
	def: "",
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "min",
	eng: "emphatic particle",
	khmer: "",
	def: "",
	partOfSpeech: "final particle",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "uan  t'puan",
	eng: "Thank you",
	khmer: "",
	def: "",
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "loo",
	eng: "much, a lot",
	khmer: "",
	def: "",
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "loo loo",
	eng: "very much",
	khmer: "",
	def: "",
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "Salamualaikum",
	eng: "hello",
	khmer: "",
	def: "God's Peace be upon you — This is the actual meaning of this phrase in Arabic.",
	partOfSpeech: "phrase, greeting",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "Alaikumsalam",
	eng: "hello",
	khmer: "",
	def: "Peace be also upon you — This is the actual meaning of this phrase in Arabic.",
	partOfSpeech: "response phrase",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "cɑh",
	eng: "what about ...",
	khmer: "",
	def: "",
	partOfSpeech: "phrase",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "lakau ma.af",
	eng: "sorry, excuse me",
	khmer: "",
	def: "",
	partOfSpeech: "phrase",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "tai",
	eng: "heart, spirit",
	khmer: "",
	def: "",
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "s'aai",
	eng: "brother, sister",
	khmer: "",
	def: "",
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "cap",
	eng: "strong",
	khmer: "",
	def: "",
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "kin oo",
	eng: "is not",
	khmer: "",
	def: "",
	partOfSpeech: "",
	chapter: 2,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "woeq, wœq",
	eng: "instead of, in return",
	khmer: "",
	def: 'Like the khmer word "ving"',
	partOfSpeech: "",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "lakaw",
	eng: "please, polite particle",
	khmer: "",
	def: '',
	partOfSpeech: "",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qeq, ha'qeq, ha",
	eng: "what ",
	khmer: "",
	def: 'used at end of word to say what?',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qeq qeq",
	eng: "some things, something",
	khmer: "",
	def: 'I have something for you.',
	partOfSpeech: "phrase noun",
	chapter: 0,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "dtɔɔq",
	eng: "progressive particle",
	khmer: "",
	def: 'Makes a word progressive',
	partOfSpeech: "",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "næw, naew",
	eng: "to go",
	khmer: "",
	def: '',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "where",
	eng: "laai",
	khmer: "naa",
	def: '',
	partOfSpeech: "",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "s'laa",
	eng: "school",
	khmer: "",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "dtɔɔq",
	eng: "to stay, to have left over",
	khmer: "now",
	def: 'to stay or to be.',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "haa pih, pih",
	eng: "to run out",
	khmer: "ah",
	def: '',
	partOfSpeech: "verb",
	chapter: 0,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "maq",
	eng: "at, place",
	khmer: "ay",
	def: '',
	partOfSpeech: "",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "haang",
	eng: "shop",
	khmer: "",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "l'saai",
	eng: "cooked rice",
	khmer: "bai",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "haang l'saai",
	eng: "restaurant",
	khmer: "",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "tumnak",
	eng: "to stay for a night or more",
	khmer: "",
	def: 'To stay somewhere other than your house for more than one night',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "haang tumnak",
	eng: "guest house",
	khmer: "",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "pah",
	eng: "to rent from",
	khmer: "",
	def: '',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "k'pah",
	eng: "to rent to",
	khmer: "cuəl",
	def: '',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "saang k'pah",
	eng: "house for rent, hotel",
	khmer: "",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "jman",
	eng: "toilet, bathroom",
	khmer: "",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qah",
	eng: "side",
	khmer: "khang",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "iw",
	eng: "left",
	khmer: "",
	def: '',
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "nuaq",
	eng: "right",
	khmer: "s'dam",
	def: '',
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qah nuaq",
	eng: "right side",
	khmer: "khang s'dam",
	def: '',
	partOfSpeech: "phrase",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "naoq",
	eng: "front",
	khmer: "mok",
	def: '',
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qah naoq",
	eng: "in front of",
	khmer: "khang mok",
	def: 'in the front of, in front of',
	partOfSpeech: "phrase",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "tooq",
	eng: "behind, the butt",
	khmer: "",
	def: '',
	partOfSpeech: "adjective, noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qah tooq",
	eng: "behind of",
	khmer: "",
	def: '',
	partOfSpeech: "In the back of, behind of",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qah nii",
	eng: "here",
	khmer: "",
	def: '',
	partOfSpeech: "phrasal noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "nii, nəy",
	eng: "this, here",
	khmer: "",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qah dteh",
	eng: "there",
	khmer: "",
	def: '',
	partOfSpeech: "phrasal noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "bpeaq",
	eng: "to be right, to be true",
	khmer: "",
	def: '',
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "how",
	eng: "to have",
	khmer: "",
	def: '',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "how",
	eng: "It's, It is",
	khmer: "",
	def: "It's correct",
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "how",
	eng: "to be able to",
	khmer: "",
	def: '',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "djaoq",
	eng: "correct",
	khmer: "troʋ",
	def: '',
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "p'guq",
	eng: "work",
	khmer: "",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "djaoq p'guq",
	eng: "need, need to use",
	khmer: "troʋ kaa",
	def: '',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "hong",
	eng: "and, with",
	khmer: "ning, ciamuey",
	def: '',
	partOfSpeech: "",
	chapter: 0,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qaoq",
	eng: "together",
	khmer: "",
	def: '',
	partOfSpeech: "adjective",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "qaoq",
	eng: "companion",
	khmer: "",
	def: '',
	partOfSpeech: "noun",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "jung, jʉng",
	eng: "to succeed, to be able to",
	khmer: "",
	def: '',
	partOfSpeech: "verb",
	chapter: 0,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "bəng, bung",
	eng: "to eat",
	khmer: "",
	def: 'Eating anything but rice',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "hoaq",
	eng: "to eat",
	khmer: "",
	def: 'To eat rice only',
	partOfSpeech: "",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "tai ai",
	eng: "You (plural)",
	khmer: "bong p'oun",
	def: 'for people younger than you, or siblings.',
	partOfSpeech: "noun",
	chapter: 0,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "aai aai",
	eng: "You (plural)",
	khmer: "bong bong",
	def: '',
	partOfSpeech: "noun",
	chapter: 0,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "bang",
	eng: "a time",
	khmer: "dong",
	def: '',
	partOfSpeech: "",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "ha'bang",
	eng: "one time",
	khmer: "",
	def: '',
	partOfSpeech: "",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "taqueaiq",
	eng: "again",
	khmer: "",
	def: '',
	partOfSpeech: "",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "myeai, mayeai, mayay",
	eng: "to speak, to talk",
	khmer: "niyeay",
	def: '',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "geang",
	eng: "they",
	khmer: "kei",
	def: '',
	partOfSpeech: "noun",
	chapter: 2,
	keywords: function() {
		
		return this.eng + this.cham;
	}},
	{cham: "ew",
	eng: "to be called",
	khmer: "hɑʉ",
	def: '',
	partOfSpeech: "verb",
	chapter: 1,
	keywords: function() {
		
		return this.eng + this.cham;
	}}
];

var $1 = new WeakMap();
class SearchAovComponent extends imba.tags.get('component','ImbaElement') {
	static init$(){
		
		return this;
	}
	init$(){
		super.init$();return undefined;
	}
	
	// Search aov (array > object > value)
	// in app-root
	set state(value) {
		return $1.set(this,value);
	}
	get state() {
		return $1.has(this) ? $1.get(this) : '';
	}
	render(){
		var t$0, c$0, b$0, d$0, t$1, b$1, d$1, v$1;
		
		t$0=this;
		t$0.open$();
		c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
		t$1 = (b$1=d$1=1,c$0.b) || (b$1=d$1=0,c$0.b=t$1=imba.createElement('input',512,t$0,null,null,null));
		v$1=c$0.c || (c$0.c=t$1.bind$('model',[this,'state']));
		(v$1=this.inputClasses,v$1===c$0.e||(d$1|=2,c$0.e=v$1));
		b$1 || (t$1.placeholder="type something");
		(d$1&2 && t$1.flag$((c$0.e||'')));
		b$1 || !t$1.setup || t$1.setup(d$1);
		t$1.end$(d$1);
		t$0.close$(d$0);
		return t$0;
	}
} SearchAovComponent.init$(); imba.tags.define('search-aov',SearchAovComponent,{});

function iter$$5(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function fuzzySearch(feather,haystack){
	var res;
	
	if (feather.length > haystack.length) { return false }	if (feather.length == haystack.length) { return feather === haystack }	for (let i = 0, items = iter$$5(feather), len = items.length; i < len; i++) {
		let featherLetter = items[i];
		
		res = [];
		for (let j = 0, ary = iter$$5(haystack), len = ary.length; j < len; j++) {
			let haystackLetter = ary[j];
			if (!(haystackLetter === featherLetter)) { continue; }			
			res.push(true);break;
		}		let match = res;
		if (match.length) { continue; }		return false;
	}	return true;
}

function iter$$6(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }var $1$1 = new WeakMap();

class SearchAovResultsComponent extends imba.tags.get('component','ImbaElement') {
	static init$(){
		
		return this;
	}
	init$(){
		super.init$();return undefined;
	}
	
	// Search aov results
	// in app-root
	set key(value) {
		return $1$1.set(this,value);
	}
	get key() {
		return $1$1.get(this);
	}
	render(){
		var t$0, c$0, b$0, d$0, t$1, t$2, k$2, c$2, t$3, k$3, b$3, d$3, c$3, v$3, t$4, k$4, c$4, t$5, b$5, d$5, c$5, v$5;
		
		t$0=this;
		t$0.open$();
		c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
		t$1 = c$0.b || (c$0.b = t$1=imba.createElement('ul',2048,t$0,null,null,null));
		t$2 = c$0.c || (c$0.c = t$2 = imba.createKeyedFragment(1024,t$1));
		k$2 = 0;
		c$2=t$2.$;
		for (let i = 0, items = iter$$6(this.arr), len = items.length; i < len; i++) {
			let object = items[i];
			
			// object.keywords().toLowerCase().includes(@state.toLowerCase())
			if (fuzzySearch(this.state,object.eng) || fuzzySearch(this.state,object.cham)) {
				
				k$3='d$' + k$2;
				t$3 = (b$3=d$3=1,c$2[k$3]) || (b$3=d$3=0,c$2[k$3] = t$3=imba.createElement('li',2560,t$2,null,null,null));
				b$3||(t$3.up$=t$2);
				c$3=t$3.$d || (t$3.$d={});
				(v$3=this.resultClasses,v$3===c$3.f||(d$3|=2,c$3.f=v$3));
				(d$3&2 && t$3.flag$((c$3.f||'')));
				t$4 = c$3.g || (c$3.g = t$4 = imba.createIndexedFragment(0,t$3));
				k$4 = 0;
				c$4=t$4.$;
				for (let j = 0, ary = iter$$6(this.keys), len = ary.length; j < len; j++) {
					let key = ary[j];
					
					t$5 = (b$5=d$5=1,c$4[k$4]) || (b$5=d$5=0,c$4[k$4] = t$5=imba.createElement('div',4096,t$4,null,null,null));
					b$5||(t$5.up$=t$4);
					c$5=t$5.$h || (t$5.$h={});
					(v$5=object[key],v$5===c$5.i || (c$5.i_ = t$5.insert$(c$5.i=v$5,0,c$5.i_)));
					k$4++;
				}t$4.end$(k$4);
				t$2.push(t$3,k$2++,k$3);
			}		}t$2.end$(k$2);
		t$0.close$(d$0);
		return t$0;
	}
} SearchAovResultsComponent.init$(); imba.tags.define('search-aov-results',SearchAovResultsComponent,{});

imba.inlineStyles("app-root ul[data-ie0370096]{list-style-type:none;padding:0 20px;}\n");
var $1$2 = new WeakMap(), $2 = new WeakMap();
let search = "";
let keysofObject = ["eng","cham"];

class AppRootComponent extends imba.tags.get('component','ImbaElement') {
	static init$(){
		
		return this;
	}
	init$(){
		super.init$();
		return this.setAttribute('data-ie0370096','');
	}
	
	set containerWidth(value) {
		return $1$2.set(this,value);
	}
	get containerWidth() {
		return $1$2.has(this) ? $1$2.get(this) : "container max-w-screen-md mx-auto block";
	}
	set query(value) {
		return $2.set(this,value);
	}
	get query() {
		return $2.has(this) ? $2.get(this) : '';
	}
	render(){
		var t$0, c$0, b$0, d$0, t$1, b$1, d$1, v$1, t$2, b$2, d$2, v$2, t$3, b$3, d$3, v$3;
		
		t$0=this;
		t$0.open$();
		c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
		t$1 = (b$1=d$1=1,c$0.b) || (b$1=d$1=0,c$0.b=t$1=imba.createElement('header',512,t$0,null,null,'ie0370096'));
		(v$1="text-center bg-blue-900 text-gray-100 text-white pt-4 pb-16 tracking-wide",v$1===c$0.d||(d$1|=2,c$0.d=v$1));
		(d$1&2 && t$1.flag$((c$0.d||'')));
		t$2 = (b$2=d$2=1,c$0.e) || (b$2=d$2=0,c$0.e=t$2=imba.createElement('div',512,t$1,null,null,'ie0370096'));
		(v$2=this.containerWidth,v$2===c$0.g||(d$2|=2,c$0.g=v$2));
		(d$2&2 && t$2.flag$((c$0.g||'')));
		b$2 || (t$3=imba.createElement('a',0,t$2,null,"English - Cham Dictionary",'ie0370096'));
		b$2 || (t$3.href="https://github.com/iamtirado/english-cham");
		b$2 || (t$3.target="_blank");
		t$3 = (b$3=d$3=1,c$0.h) || (b$3=d$3=0,c$0.h=t$3=imba.createElement('p',4608,t$2,null,null,'ie0370096'));
		(v$3="text-teal-400 uppercase text-xs font-bold tracking-widest",v$3===c$0.j||(d$3|=2,c$0.j=v$3));
		(d$3&2 && t$3.flag$((c$0.j||'')));
		(v$3=("" + (dict.length) + " words"),v$3===c$0.k || (c$0.k_ = t$3.insert$(c$0.k=v$3,0,c$0.k_)));
		t$1 = (b$1=d$1=1,c$0.l) || (b$1=d$1=0,c$0.l=t$1=imba.createElement('main',512,t$0,null,null,'ie0370096'));
		(v$1="result flex flex-col bg-gray-200 min-h-screen px-12 pb-12 shadow-md",v$1===c$0.n||(d$1|=2,c$0.n=v$1));
		(d$1&2 && t$1.flag$((c$0.n||'')));
		t$2 = (b$2=d$2=1,c$0.o) || (b$2=d$2=0,c$0.o=t$2=imba.createElement('div',512,t$1,null,null,'ie0370096'));
		(v$2=this.containerWidth + "shadow-2xl py-8 px-8 rounded-lg bg-teal-500 -mt-12 mb-8 shadow-lg",v$2===c$0.q||(d$2|=2,c$0.q=v$2));
		(d$2&2 && t$2.flag$((c$0.q||'')));
		t$3 = (b$3=d$3=1,c$0.r) || (b$3=d$3=0,c$0.r=t$3=imba.createComponent('search-aov',0,t$2,null,null,'ie0370096'));
		b$3 || t$3.bind$('state',{get:function(){ return search },set:function(v$){ search = v$; }});
		b$3 || (t$3.inputClasses="flex-1 rounded-md py-2 px-4 w-full shadow-inner");
		b$3 || !t$3.setup || t$3.setup(d$3);
		t$3.end$(d$3);
		b$3 || t$3.insertInto$(t$2);
		t$2 = (b$2=d$2=1,c$0.t) || (b$2=d$2=0,c$0.t=t$2=imba.createElement('div',512,t$1,'flex',null,'ie0370096'));
		(v$2=this.containerWidth,v$2===c$0.v||(d$2|=2,c$0.v=v$2));
		(d$2&2 && t$2.flag$('flex'+' '+(c$0.v||'')));
		t$3 = (b$3=d$3=1,c$0.w) || (b$3=d$3=0,c$0.w=t$3=imba.createComponent('search-aov-results',0,t$2,'w-full',null,'ie0370096'));
		b$3 || (t$3.resultClasses="py-2 px-4 bg-white mb-2 shadow-sm rounded-md w-full flex justify-between");
		(v$3=dict,v$3===c$0.x || (t$3.arr=c$0.x=v$3));
		b$3 || t$3.bind$('state',{get:function(){ return search },set:function(v$){ search = v$; }});
		(v$3=keysofObject,v$3===c$0.z || (t$3.keys=c$0.z=v$3));
		b$3 || !t$3.setup || t$3.setup(d$3);
		t$3.end$(d$3);
		b$3 || t$3.insertInto$(t$2);
		t$0.close$(d$0);
		return t$0;
	}
} AppRootComponent.init$(); imba.tags.define('app-root',AppRootComponent,{});

/* css scoped
app-root {
}
app-root ul {
	list-style-type: none;
	padding: 0 20px;
}
*/
//# sourceMappingURL=app.js.map
