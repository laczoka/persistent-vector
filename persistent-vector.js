var laczoka = {};

(function() {

var EMPTY_NODE = new Array(32);

function PersistentVector (cnt, shift, root, tail) {
    this.cnt = cnt;
    this.shift = shift;
    this.root = root;
    this.tail = tail;
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
                newtail = this.tail.slice(0);
                newtail[i & 0x01f] = val;
                return new PersistentVector(this.cnt, this.shift, this.root, newtail);
            }
            return new PersistentVector(this.cnt, this.shift, this.doAssoc(this.shift, this.root, i, val), this.tail);
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
            newroot = EMPTY_NODE.slice(0);
            newroot[0] = this.root;
            newroot[1] = this.newPath(this.shift, tailnode);
            newshift += 5;
        } else {
            newroot = this.pushTail(this.shift, this.root, tailnode);
        }
        return new PersistentVector(this.cnt+1, newshift, newroot, [val]);
    },

    /*
     * | parent.slice(0)[ subidx1 <- tailnode ] if level1 == 5
     * | parent.slice(0)[ subidx1 <- newPath1 ] if level1 != 5 && child1 == null
     * | parent.slice(0)[ subidx1 <- parent2.slice(0)[subidx2 <- tailnode ] ] if level1 !=5 && child1 != null && level2 == 5
     * | parent.slice(0)[ subidx1 <- parent2.slice(0)[subidx2 <- newPath2 ] ] ...
     * | parent.slice(0)[ subidx1 <- parent2.slice(0)[subidx2 <- parent3.slice(0)[subidx3 <- tailnode ] ] ...
     * | parent.slice(0)[ subidx1 <- parent2.slice(0)[subidx2 <- parent3.slice(0)[subidx3 <- newPath3 ] ] ...
     */

    pushTail: function(level, parent, tailnode) {
        var llevel = level,
            lsubidx = ((this.cnt-1) >>> level) & 0x01f,
            lchild,
            lparent = parent,
            ret = parent.slice(0),
            lret = ret;

        do {
            if (llevel === 5) {
                lret[lsubidx] = tailnode; break;
            } else {
                lchild = lparent[lsubidx];
                if (lchild == null) {
                    lret[lsubidx] = this.newPath(llevel-5, tailnode);
                    break;
                } else {
                    lret[lsubidx] = lparent.slice(0);

                    lret = lret[lsubidx];
                    llevel -= 5;
                    lparent = lchild;
                    lsubidx = ((this.cnt-1) >>> level) & 0x01f;
                }
            }

        } while (1);
        return lret;
    },

    newPath: function(level, node) {
        var ret = node, embed;
        while (level>0) {
            embed = ret;
            ret = EMPTY_NODE.slice(0);
            ret[0] = embed;
            level -= 5;
        }
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

    laczoka.PersistentVector = PersistentVector;
    laczoka.EMPTY = EMPTY;
    laczoka.EMPTY_NODE = EMPTY_NODE;

})();

/*
function time(f, msg) {
    var start = new Date();
    var res = f();
    print(msg + " " + ((new Date())-start) + " ms");
    return res;
}


function build_array() {
    var a = [];
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += i;
        a.push(i);
    }
    return a;
}

function build_pvec() {
    var v = laczoka.EMPTY;
    for(var i = 0; i < 1000000; i++) {
        v = v.cons(i);
    }
    return v;
}

//a = time(build_array, "Array built in");
pv = time(build_pvec, "Pvec built in");
 */
