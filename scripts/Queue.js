// queue using a linked list 

class Node {
	constructor(val){
		this.value = val;
		this.next = null;
	}
	
	next(otherNode){
		this.next = otherNode
	}
}


class Queue {
	constructor(){
		this.head = null;
		this.tail = null;
	}

	push(val){
		let node = new Node(val);
		if(this.head === null){
			this.head = node;
			this.tail = node;
		}else{
			this.tail.next = node;
			this.tail = node;
		}
	}
	
	pop(){
		if(this.head === null){
			return null;
		}
		var temp = this.head;
		this.head = this.head.next;
		
		if(this.head === null){
			this.tail = null;
		}
		
		return temp.value;
	}
	
	peek(){
		if(this.head.value){
			return null;
		}
		return this.head.value;
	}
}


export { Node, Queue };