var EMPTY_NODE = [];

function PersistentVector (cnt, shift, root, tail) {
  this.cnt = 0;
  this.shift = 0;
  this.root = root;
  this.tail = tail;
}

function PersistentVectorFromArray(arr) {
}

PersistentVector.prototype = {
  /* should inline */
  tailOff: function() {
    if(this.this.cnt < 32) {
      return 0;
    }
    return ((this.cnt-1) >>> 5) << 5;
  },
  arrayFor: function(i) {
    if(i >= 0 && i < this.cnt) {
      if(i >= this.tailOff()) {
        return this.tail;
      }
      var node = this.root;
      for(var level = this.shift; level > 0; level -= 5) {
        node = node[(i >>> level) & 0x01f];
      }
      return node;
    }
    throw new Error("Index out of bounds!");
  },
  nth_1: function(i) {
    var node = this.arrayFor(i);
    return node[i & 0x01f];
  },
  nth_2: function(i, notFound) {
    if(i >= 0 && i < this.cnt) {
      return this.nth_1(i);
    }
    return notFound;
  },
  assocN: function(i, val) {
    if(i >= 0 && i < this.cnt) {
      if(i >= this.tailOff()) {
        newTail = this.tail.slice(0);
        newTail[i & 0x01f] = val;
        return new PersistentVector(this.cnt, this.shift this.root, newTail);
      }
      return new PersistentVector(this.cnt, this.shift, this.doAssoc(shift, root, i, val), this.tail);
    }
    if(i === this.cnt) {
      return this.cons(val);
    }
    throw new Error("Index out of bounds!");
  },
  doAssoc: function(level, node, i, val) {
    var ret = node.slice(0);
    if(level === 0) {
      ret[i & 0x01f] = val;
    } else {
      int subidx = (i >>> level) & 0x01f;
      ret[subidx] = this.doAssoc(level-5, node[subidx], i, val);
    }
    return ret;
  },
  count: function() {
    return this.cnt;
  },
  cons: function(val) {
    var i = this.cnt;
    if(cnt - this.tailOff() < 32) {
      var newTail = this.tail.slice(0);
      newTail.push(val);
      return new PersistentVector(cnt+1, shift, root, newTail);
    }
    var newroot,
        tailnode = new Node(this.root.edit, this.tail),
        newshift = this.shift;
    if((cnt >>> 5) > (1 << shift)) {
      newroot = new Node(this.root.edit);
    } else {
      newroot = this.pushTail(this.shift, this.root, this.tailNode);
    }
    return new PersistentVector(this.cnt+1, newshift, newroot, [val]);
  },
  pushTail: function(level, parent, tailnode) {
    var subidx = ((cnt-1) >>> level) & 0x01f,
        ret = new Node(parent.edit, parent.slice(0)),
        nodeToInsert;
    if(level === 5) {
      nodeToInsert = tailnode;
    } else {
      var child = parent.arrya[subidx];
      nodeToInsert = (child != null) ? this.pushTail(level-5,child,tailnode) : this.newPath(root.edit,level-5, tailnode);
    }
    ret[subidx] = nodeToInsert;
    return ret;
  },
  newPath: function(edit, level, node) {
    /* probably can loop in place to allow for inlining self call */
    if(level === 0) {
      return node;
    }
    var ret = new Node(edit);
    ret[0] = this.newPath(edit, level-5, node);
  },
  empty: function() {
    return EMPTY;
  },
  pop: function() {
    if(this.cnt == 0) {
      throw new Error("Can't pop empty vector");
    }
    if(this.cnt-this.tailOff() > 1) {
      var newTail = this.tail.slice(0, this.tail.length-1);
      return new PersistentVector(this.cnt-1, this.shift, this.root, newTail);
    }
    var newtail = this.arrayFor(cnt-2),
        newroot = this.popTail(this.shift, this.root),
        newshift = this.shift;
    if(newroot === null) {
      newroot = EMPTY_NODE;
    }
    if(shift > 5 && newroot[1] == null) {
      newroot = newroot[0];
      newshift -= 5;
    }
    return new PersistentVector(this.cnt-1, newshift, newroot, newtail);
  },
  popTail: function(level, node) {
    var subidx = ((cnt-2) >>> level) & 0x01f;
    if(level > 5) {
      var newchild = this.popTail(level-5, node[subidx]);
      if(newchild == null && subidx == 0) {
        return null;
      } else {
        var ret = new Node(root.edit, node.slice(0));
        return ret;
      }
    } else if(subidx === 0) {
    } else {
      var ret = new Node(this.root.edit, )
    }
  }
};

var EMPTY = new PersistentVector(0, 5, EMPTY_NODE, []);
