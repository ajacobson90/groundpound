export default class List {
	
	constructor(arr, parentNode, ctx, runWithoutMutator){
		this.arr = arr;
		this.ctx = ctx
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