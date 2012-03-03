var EMPTY_NODE = new Array(32);

function PersistentVector (cnt, shift, root, tail) {
  this.cnt = cnt;
  this.shift = shift;
  this.root = root;
  this.tail = tail;
}

function fromArray(arr) {
}

PersistentVector.prototype = {
  /* should inline */
  tailOff: function() {
    if(this.cnt < 32) {
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
        return new PersistentVector(this.cnt, this.shift, this.root, newTail);
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
      var subidx = (i >>> level) & 0x01f;
      ret[subidx] = this.doAssoc(level-5, node[subidx], i, val);
    }
    return ret;
  },
  count: function() {
    return this.cnt;
  },
  cons: function(val) {
    var i = this.cnt;
    if((this.cnt - this.tailOff()) < 32) {
      var newtail = this.tail.slice(0);
      newtail.push(val);
      return new PersistentVector(this.cnt+1, this.shift, this.root, newtail);
    }
    var newroot,
        tailnode = this.tail,
        newshift = this.shift;
    if((this.cnt >>> 5) > (1 << this.shift)) {
      newroot = new Array(32);
      newroot[0] = this.root;
      newroot[1] = this.newPath(this.shift, tailnode);
      newshift += 5;
    } else {
      newroot = this.pushTail(this.shift, this.root, tailnode);
    }
    return new PersistentVector(this.cnt+1, newshift, newroot, [val]);
  },
  pushTail: function(level, parent, tailnode) {
    var subidx = ((this.cnt-1) >>> level) & 0x01f,
        ret = parent.slice(0),
        nodeToInsert;
    if(level === 5) {
      nodeToInsert = tailnode;
    } else {
      var child = parent[subidx];
      nodeToInsert = (child != null) ? this.pushTail(level-5, child, tailnode) : this.newPath(level-5, tailnode);
    }
    ret[subidx] = nodeToInsert;
    return ret;
  },
  newPath: function(level, node) {
    /* probably can loop in place to allow for inlining self call */
    if(level === 0) {
      return node;
    }
    var ret = new Array(32);
    ret[0] = this.newPath(level-5, node);
    return ret;
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
        var ret = node.slice(0);
        return ret;
      }
    } else if(subidx === 0) {
      return null;
    } else {
      var ret = this.node.slice(0);
      array[subidx] = null;
      return ret;
    }
  }
};

var EMPTY = new PersistentVector(0, 5, EMPTY_NODE, []);

function time(f) {
  var start = new Date();
  f();
  console.log((new Date())-start);
}

/*
time(function() {
  for(var i = 0; i < 1e6; i++) {
    new PersistentVector(0, 5, EMPTY_NODE, []);
  }
});
*/

var v = new PersistentVector(0, 5, EMPTY_NODE, []);
time(function() {
  for(var i = 0; i < 1000000; i++) {
    v = v.cons(i);
  }
  console.log("size:", v.count());
  console.log("val at front", v.nth_1(0));
  console.log("val at end", v.nth_1(999999));
  for(var i = 0; i < 1000000; i++) {
    v.nth_1(999999);
  }
});

time(function() {
  for(var i = 0; i < 1000000; i++) {
    v.nth_1(999999);
  }
});

v = v.cons("foo");
console.log(v.nth_1(v.count()-1));

var a = [];
time(function() {
  for(var i = 0; i < 1000000; i++) {
    a.push(i);
  }
  console.log("size:", a.length);
  console.log("val at front", a[0]);
  console.log("val at end", a[999999]);
});
time(function() {
  for(var i = 0; i < 1000000; i++) {
    a[999999];
  }
});
