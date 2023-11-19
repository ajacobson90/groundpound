export default class Observable{
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
		if (node.dataset.gpField){
			node.addEventListener('change', function(event){
				self.set(event.target.value);
			});
		}
		else{
			this.#subscribers.push(function(){node.innerHTML = self.value;});
		}
	}
	
}