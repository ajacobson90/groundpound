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
		if (node.attributes){
			if (node.dataset.gpText){
				if (!assignmentObj[node.dataset.gpText])
					assignmentObj[node.dataset.gpText] = this.buildObservable(node.innerText);
				assignmentObj[node.dataset.gpText].bindNode(node);
			}
			if (node.dataset.gpField){
				if (!assignmentObj[node.dataset.gpField])
					assignmentObj[node.dataset.gpField] = this.buildObservable(node.innerText);
				assignmentObj[node.dataset.gpField].bindNode(node);
			}
			if (node.dataset.gpClick){
				node.onclick = (function(){this[node.dataset.gpClick](assignmentObj);}).bind(this);
			}
			if (node.dataset.gpList){
				list = new List([], node, assignmentObj, this.#runWithoutMutator.bind(this));
				assignmentObj[node.dataset.gpList] = list;
			}
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