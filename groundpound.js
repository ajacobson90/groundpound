'use strict';

class Observable{
	#subscribers = [];
	constructor(value, runWithoutMutator){
		this.value = value;
		this.rwm = runWithoutMutator;
	}
	
	set(newValue){
		if (this.value !== newValue){
			this.value = newValue;
			for (const sub of this.#subscribers)
				this.rwm(sub);
		}
	}
	
	bindNode(node){
		var self = this;
		if (node.dataset.vfield){
			node.addEventListener('change', function(event){
				self.set(event.target.value);
			});
		}
		else {
			this.#subscribers.push(function(){node.innerHTML = self.value;});
		}
	}
	
}

class List {
	
	constructor(arr, parentNode, ctx, runWithoutMutator){
		this.arr = arr;
		this.ctx = ctx;
		this.parentNode = parentNode;
		this.itemNodeTemplate = parentNode.children[0].cloneNode(true);
		this.rwm = runWithoutMutator;
	}
	add(newItem, newNode){
		if (!newNode){
			newNode = this.itemNodeTemplate.cloneNode(true);
			this.#populateNode(newNode, newItem);
			var self = this;
			this.rwm(function(){
				self.parentNode.appendChild(newNode);
			});
		}
		this.arr.push([newItem, newNode]);
		
	}
	
	remove(itemToRemove){
		var item = this.arr.find(function(e){ return e[0] === itemToRemove;});
		this.arr.splice(this.arr.indexOf(item), 1);
		this.rwm(this.#render.bind(this));
	}
	
	#populateNode(node, dataSource){
		if (node.attributes && node.dataset.vtext && dataSource[node.dataset.vtext]){
			node.innerText = dataSource[node.dataset.vtext].value;
		}
		if (node.attributes && node.dataset.vclick && this.ctx[node.dataset.vclick]){
			node.onclick = (function(){this.ctx[node.dataset.vclick](dataSource);}).bind(this);
		}
		
		for (var i = 0; i < node.children.length; i++){
			this.#populateNode(node.children[i], dataSource);
		}
	}
	
	#render(){
		while (this.parentNode.firstChild) {
			this.parentNode.removeChild(this.parentNode.lastChild);
		}
		for (const e of this.arr)
			this.parentNode.appendChild(e[1]);
	}
}

class ViewModel {
	constructor(contextNode){
		//listen for DOM updates (particularly from the server)
		var self = this;
		this.contextNode = contextNode;
		this.config = { attributes: true, childList: true, subtree: true };
		this.observer = new MutationObserver(function(mutationsList, obs) {
			for(const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					console.log('A child node has been added or removed.');
					var newNode = mutation.addedNodes[0];
					self.#buildModel(newNode, self);
				}
			}
		});
		this.observer.observe(contextNode, this.config);
		this.#buildModel(contextNode, this);
	}
	
	buildObservable(value){
		return new Observable(value, this.#runWithoutMutator.bind(this));
	}
	
	#runWithoutMutator(callback){
		this.observer.disconnect();
		callback();
		this.observer.observe(this.contextNode, this.config);
	}
	
	#buildModel(node, assignmentObj){
		var list = null;
		if (node.attributes && node.dataset.vtext){
			if (!assignmentObj[node.dataset.vtext])
				assignmentObj[node.dataset.vtext] = new Observable(node.innerText, this.#runWithoutMutator.bind(this));
			assignmentObj[node.dataset.vtext].bindNode(node);
		}
		if (node.attributes && node.dataset.vfield){
			if (!assignmentObj[node.dataset.vfield])
				assignmentObj[node.dataset.vfield] = new Observable(node.value, this.#runWithoutMutator.bind(this));
			assignmentObj[node.dataset.vfield].bindNode(node);
		}
		if (node.attributes && node.dataset.vclick){
			node.onclick = (function(){this[node.dataset.vclick](assignmentObj);}).bind(this);
		}
		if (node.attributes && node.dataset.vlist){
			list = new List([], node, assignmentObj, this.#runWithoutMutator.bind(this));
			assignmentObj[node.dataset.vlist] = list;
		}
		
		for (var i = 0; i < node.children.length; i++){
			if (list){
				var listItem = {};
				this.#buildModel(node.children[i], listItem);
				list.add(listItem, node.children[i]);
			}				
			else
				this.#buildModel(node.children[i], assignmentObj);
		}
	}
}

exports.List = List;
exports.Observable = Observable;
exports.ViewModel = ViewModel;
