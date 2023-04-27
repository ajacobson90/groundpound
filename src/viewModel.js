import Observable from './observable.js';
import List from './list.js';

export default class ViewModel {
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