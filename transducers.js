;(function(){
    // A reducing function has the signature: a -> b -> a
    //  where a is the accumulated value's type and b is the collection item's type

    // A transducer is a function that takes one reducing function and returns another, it
    // has the signature: (a -> b -> a) -> (a -> b -> a)

    // They don't care about:
    //  - what the reducing function does
    //  - the context of use (i.e. the collection type `a`)
    //  - the source of inputs

    // Transducers compose using ordinary function composition.


    var transducers = {};

    var identity = function(x) { return x };

    // (b -> c) -> (a -> b) -> a -> c
    var compose2 = function compose(f, g){
        return function(){
            var args = [].slice.call(arguments, 0);
            return f(g.apply(null, args));
        };
    };

    transducers.compose = function() {
        var args = [].slice.call(arguments, 0);
        return args.reduce(compose2, identity);
    };


    // ((a -> b -> a) -> (a -> b -> a)) -> (a -> b -> a) -> b -> [b]
    transducers.transduce = function transduce(transducer, reducer, seed, arr) {
        return arr.reduce(transducer(reducer), seed);
    };

    // (b -> c) -> ((a -> b -> a) -> (a -> c -> a))
    transducers.map = function(f) {
        return function(reducer) {
            return function(acc, v) {
                return reducer(
                    acc,
                    f(v)
                );
            };
        };
    };

    // (b -> Boolean) -> ((a -> b -> a) -> (a -> b -> a))
    transducers.filter = function(pred) {
        return function(reducer) {
            return function(acc, v) {
                if (pred(v)) return reducer(acc, v);
                else         return acc;
            };
        };
    };

    // n -> ((a -> b -> a) -> (a -> b -> a))
    transducers.take = function(n) {
        var remaining = n;
        return function(reducer) {
            return function(acc, v) {
                if (remaining === 0) return acc;
                else {
                    remaining -= 1;
                    return reducer(acc, v);
                }
            };
        };
    };

    // n -> ((a -> b -> a) -> (a -> b -> a))
    transducers.drop = function(n) {
        var remaining = n;
        return function(reducer) {
            return function(acc, v) {
                if (remaining === 0) return reducer(acc, v);
                else {
                    remaining -= 1;
                    return acc;
                }
            };
        };
    };
}());
