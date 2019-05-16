const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const utils = require('../../utils.js');
const Comparer = require('../../packages/js/comparer.js');

describe("Comparer", () => {
    describe("expect()", () => {
        it("doesn't throw an exception if there's no error and doesn't edit the objects sent in", () => {
            let actual = { one: "foobar" };
            let expected = { one: "foobar" };

            Comparer.expect(actual).to.match(expected);

            expect(actual).to.eql( { one: "foobar" } );
            expect(expected).to.eql( { one: "foobar" } );
        });

        it("throws an exception on error and doesn't edit the objects sent in", () => {
            let actual = { one: "foobar" };
            let expected = { one: "foobar2" };
            assert.throws(() => {
                Comparer.expect(actual).to.match(expected);
            }, `{
    one: "foobar"  -->  not "foobar2"
}`);

            expect(actual).to.eql( { one: "foobar" } );
            expect(expected).to.eql( { one: "foobar2" } );
        });

        it("handles actual object that contain multiple references to the same object when a rough clone is made", () => {
            let a = [ 6 ];
            let actual = [ { shared: a }, { shared: a } ];
            let expected = [ { shared: [ 6 ] }, { shared: [ 6 ] } ];

            Comparer.expect(actual, true).to.match(expected);
        });

        it("handles actual objects with circular references", () => {
            let child = {};
            let parent = {};

            parent.child = child;
            child.parent = parent;

            Comparer.expect(parent).to.match({
                child: {
                    parent: {
                        child: {
                            parent: {}
                        }
                    }
                }
            });
        });
    });

    describe("comparison()", () => {
        context("plain comparison", () => {
            it("actual=string, expected=same string", () => {
                let obj = Comparer.comparison("foobar", "foobar");
                expect(Comparer.print(obj)).to.equal(`"foobar"`);
            });

            it("actual=string, expected=different string", () => {
                let obj = Comparer.comparison("foobar", "foobar2");
                expect(Comparer.print(obj)).to.equal(`"foobar"  -->  not "foobar2"`);
            });

            it("actual=string, expected=0", () => {
                let obj = Comparer.comparison("foobar", 0);
                expect(Comparer.print(obj)).to.equal(`"foobar"  -->  not 0`);
            });

            it("actual=string, expected=number", () => {
                let obj = Comparer.comparison("foobar", 7);
                expect(Comparer.print(obj)).to.equal(`"foobar"  -->  not 7`);
            });

            it("actual=string, expected=null", () => {
                let obj = Comparer.comparison("foobar", null);
                expect(Comparer.print(obj)).to.equal(`"foobar"  -->  not null`);
            });

            it("actual=string, expected=undefined", () => {
                let obj = Comparer.comparison("foobar", undefined);
                expect(Comparer.print(obj)).to.equal(`"foobar"  -->  not undefined`);
            });

            it("actual=string, expected=object", () => {
                let obj = Comparer.comparison("foobar", { text: "foobar"} );
                expect(Comparer.print(obj)).to.equal(`"foobar"  -->  not an object`);
            });

            it("actual=string, expected=array", () => {
                let obj = Comparer.comparison("foobar", [ "foobar" ] );
                expect(Comparer.print(obj)).to.equal(`"foobar"  -->  not an array`);
            });

            it("actual=number, expected=same number", () => {
                let obj = Comparer.comparison(7, 7);
                expect(Comparer.print(obj)).to.equal(`7`);
            });

            it("actual=number, expected=different number", () => {
                let obj = Comparer.comparison(7, 8);
                expect(Comparer.print(obj)).to.equal(`7  -->  not 8`);
            });

            it("actual=boolean, expected=same boolean", () => {
                let obj = Comparer.comparison(true, true);
                expect(Comparer.print(obj)).to.equal(`true`);

                obj = Comparer.comparison(false, false);
                expect(Comparer.print(obj)).to.equal(`false`);
            });

            it("actual=boolean, expected=different boolean", () => {
                let obj = Comparer.comparison(true, false);
                expect(Comparer.print(obj)).to.equal(`true  -->  not false`);
            });

            it("actual=null, expected=null", () => {
                let obj = Comparer.comparison(null, null);
                expect(Comparer.print(obj)).to.equal(`null`);
            });

            it("actual=null, expected=not null", () => {
                let obj = Comparer.comparison(null, 8);
                expect(Comparer.print(obj)).to.equal(`null  -->  not 8`);
            });

            it("actual=undefined, expected=undefined", () => {
                let obj = Comparer.comparison(undefined, undefined);
                expect(Comparer.print(obj)).to.equal(`undefined`);
            });

            it("actual=0, expected=null", () => {
                let obj = Comparer.comparison(0, null);
                expect(Comparer.print(obj)).to.equal(`0  -->  not null`);
            });

            it("actual=null, expected=undefined", () => {
                let obj = Comparer.comparison(null, undefined);
                expect(Comparer.print(obj)).to.equal(`null  -->  not undefined`);
            });

            it("actual={}, expected={}", () => {
                let obj = Comparer.comparison({}, {});
                expect(Comparer.print(obj)).to.equal(`{
}`);
            });

            it("actual={}, expected=undefined", () => {
                let obj = Comparer.comparison({}, undefined);
                expect(Comparer.print(obj)).to.equal(`{  -->  not undefined
}`);
            });

            it("actual={}, expected=null", () => {
                let obj = Comparer.comparison({}, null);
                expect(Comparer.print(obj)).to.equal(`{  -->  not null
}`);
            });

            it("actual=[], expected=[]", () => {
                let obj = Comparer.comparison([], []);
                expect(Comparer.print(obj)).to.equal(`[
]`);
            });

            it("actual=[], expected=undefined", () => {
                let obj = Comparer.comparison([], undefined);
                expect(Comparer.print(obj)).to.equal(`[  -->  not undefined
]`);
            });

            it("actual=[], expected=null", () => {
                let obj = Comparer.comparison([], null);
                expect(Comparer.print(obj)).to.equal(`[  -->  not null
]`);
            });

            it("actual=function, expected=function with same body", () => {
                let obj = Comparer.comparison(() => {return 1;}, () => {return 1;});
                expect(Comparer.print(obj)).to.equal(`[Function]  -->  not undefined`);
            });

            it("actual=function, expected=primitive", () => {
                let obj = Comparer.comparison(() => {return 1;}, 1);
                expect(Comparer.print(obj)).to.equal(`[Function]  -->  not 1`);
            });

            it("actual=function, expected=undefined", () => {
                let obj = Comparer.comparison(() => {return 1;}, undefined);
                expect(Comparer.print(obj)).to.equal(`[Function]  -->  not undefined`);
            });

            it("actual=simple object, expected=same simple object", () => {
                let obj = Comparer.comparison({ one: 1, two: "2", three: 3, four: "4" }, { one: 1, two: "2", three: 3, four: "4" });
                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: 3,
    four: "4"
}`);
            });

            it("actual=simple object, expected=same simple object with undefined keys", () => {
                let obj = Comparer.comparison({ one: 1, two: "2", three: 3, four: "4" }, { one: 1, two: "2", three: 3, threepointfive: undefined, four: "4", five: undefined });
                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: 3,
    four: "4",
    threepointfive: undefined,
    five: undefined
}`);
            });

            it("actual=simple object with undefined keys, expected=same simple object but without undefined keys", () => {
                let obj = Comparer.comparison({ one: 1, two: "2", three: 3, threepointfive: undefined, four: "4", five: undefined }, { one: 1, two: "2", three: 3, four: "4" });
                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: 3,
    threepointfive: undefined,
    four: "4",
    five: undefined
}`);
            });

            it("actual=simple object, expected=same simple object with keys set to typeof undefined", () => {
                let obj = Comparer.comparison({ one: 1, two: "2", three: 3, four: "4" }, { one: 1, two: "2", three: 3, threepointfive: { $typeof: "undefined" }, four: "4", five: undefined });
                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: 3,
    four: "4",
    five: undefined

    --> missing
    threepointfive: {
        $typeof: "undefined"
    }
}`);
            });

            it("actual=simple object with undefined keys, expected=same simple object with undefined keys", () => {
                let obj = Comparer.comparison({ one: 1, two: "2", three: 3, threepointfive: undefined, four: "4", five: undefined }, { one: 1, two: "2", three: 3, threepointfive: undefined, four: "4", five: undefined });
                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: 3,
    threepointfive: undefined,
    four: "4",
    five: undefined
}`);
            });

            it("actual=simple object, expected=same simple object but with a subset of keys", () => {
                let obj = Comparer.comparison({ one: 1, two: "2", three: 3, four: "4" }, { one: 1, two: "2" });
                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: 3,
    four: "4"
}`);
            });

            it("actual=simple object, expected={}", () => {
                let obj = Comparer.comparison({ one: 1, two: "2", three: 3, four: "4" }, {});
                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: 3,
    four: "4"
}`);
            });

            it("actual=simple object, expected=different simple object", () => {
                let obj = Comparer.comparison({ one: 1, two: "2", three: 3, four: "4" }, { one: 1, two: "5", three: null, five: "5", six: 6 });
                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",  -->  not "5"
    three: 3,  -->  not null
    four: "4"

    --> missing
    five: "5"

    --> missing
    six: 6
}`);
            });

            it("actual=simple array, expected=same simple array", () => {
                let obj = Comparer.comparison([ 1, "2", 3, null, false, undefined ], [ 1, "2", 3, null, false, undefined ]);
                expect(Comparer.print(obj)).to.equal(`[
    1,
    "2",
    3,
    null,
    false,
    undefined
]`);
            });

            it("actual=simple array, expected=same simple array but in a different order", () => {
                let obj = Comparer.comparison([ 1, "2", 3, null, false, undefined ], [ null, 1, "2", undefined, 3, false ]);
                expect(Comparer.print(obj)).to.equal(`[
    1,  -->  not null
    "2",  -->  not 1
    3,  -->  not "2"
    null,  -->  not undefined
    false,  -->  not 3
    undefined  -->  not false
]`);
            });

            it("actual=simple array, expected=different simple array", () => {
                let obj = Comparer.comparison([ 1, "2", 3, null, false, undefined ], [ 7, 8, 9 ]);
                expect(Comparer.print(obj)).to.equal(`[
    1,  -->  not 7
    "2",  -->  not 8
    3,  -->  not 9
    null,  -->  not expected
    false,  -->  not expected
    undefined  -->  not expected
]`);
            });

            it("actual=object containing objects/arrays/primitives, expected=same object", () => {
                let obj = Comparer.comparison({
                    one: 1,
                    two: "2",
                    three: null,
                    four: undefined,
                    "five six": "\"56\"",
                    seven: "",
                    eight: false,
                    nine: {
                        ten: 10,
                        eleven: "11",
                        twenty: {
                            twentyone: 21,
                            "22": "22"
                        },
                        twentythree: [
                            23,
                            24
                        ],
                        twentyfive: [],
                        twentysix: {}
                    },
                    twelve: [
                        1,
                        "2",
                        3,
                        true,
                        null,
                        false,
                        undefined,
                        {},
                        {
                            thirteen: 13,
                            fourteen: 14,
                            fifteen: [
                                16
                            ]
                        },
                        [],
                        [
                            17,
                            18,
                            [ 19 ]
                        ]
                    ]
                }, {
                    one: 1,
                    two: "2",
                    three: null,
                    four: undefined,
                    "five six": "\"56\"",
                    seven: "",
                    eight: false,
                    nine: {
                        ten: 10,
                        eleven: "11",
                        twenty: {
                            twentyone: 21,
                            "22": "22"
                        },
                        twentythree: [
                            23,
                            24
                        ],
                        twentyfive: [],
                        twentysix: {}
                    },
                    twelve: [
                        1,
                        "2",
                        3,
                        true,
                        null,
                        false,
                        undefined,
                        {},
                        {
                            thirteen: 13,
                            fourteen: 14,
                            fifteen: [
                                16
                            ]
                        },
                        [],
                        [
                            17,
                            18,
                            [ 19 ]
                        ]
                    ]
                });

                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: null,
    four: undefined,
    "five six": "\\\"56\\\"",
    seven: "",
    eight: false,
    nine: {
        ten: 10,
        eleven: "11",
        twenty: {
            22: "22",
            twentyone: 21
        },
        twentythree: [
            23,
            24
        ],
        twentyfive: [
        ],
        twentysix: {
        }
    },
    twelve: [
        1,
        "2",
        3,
        true,
        null,
        false,
        undefined,
        {
        },
        {
            thirteen: 13,
            fourteen: 14,
            fifteen: [
                16
            ]
        },
        [
        ],
        [
            17,
            18,
            [
                19
            ]
        ]
    ]
}`);
            });

            it("actual=object containing objects/arrays/primitives, expected=same object but with a subset of keys", () => {
                let obj = Comparer.comparison({
                    one: 1,
                    two: "2",
                    three: null,
                    four: undefined,
                    "five six": "\"56\"",
                    seven: "",
                    eight: false,
                    nine: {
                        ten: 10,
                        eleven: "11",
                        twenty: {
                            twentyone: 21,
                            "22": "22"
                        },
                        twentythree: [
                            23,
                            24
                        ],
                        twentyfive: [],
                        twentysix: {}
                    },
                    twelve: [
                        1,
                        "2",
                        3,
                        true,
                        null,
                        false,
                        undefined,
                        {},
                        {
                            thirteen: 13,
                            fourteen: 14,
                            fifteen: [
                                16
                            ]
                        },
                        [],
                        [
                            17,
                            18,
                            [ 19 ]
                        ]
                    ]
                }, {
                    one: 1,
                    three: null,
                    four: undefined,
                    "five six": "\"56\"",
                    seven: "",
                    nine: {
                        ten: 10,
                        twenty: {
                            twentyone: 21,
                            "22": "22"
                        },
                        twentythree: [
                            23,
                            24
                        ],
                        twentysix: {}
                    },
                    twelve: [
                        1,
                        "2",
                        3,
                        true,
                        null,
                        false,
                        undefined,
                        {},
                        {
                            thirteen: 13,
                            fifteen: [
                                16
                            ]
                        },
                        [],
                        [
                            17,
                            18,
                            [ 19 ]
                        ]
                    ]
                });

                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: null,
    four: undefined,
    "five six": "\\\"56\\\"",
    seven: "",
    eight: false,
    nine: {
        ten: 10,
        eleven: "11",
        twenty: {
            22: "22",
            twentyone: 21
        },
        twentythree: [
            23,
            24
        ],
        twentyfive: [
        ],
        twentysix: {
        }
    },
    twelve: [
        1,
        "2",
        3,
        true,
        null,
        false,
        undefined,
        {
        },
        {
            thirteen: 13,
            fourteen: 14,
            fifteen: [
                16
            ]
        },
        [
        ],
        [
            17,
            18,
            [
                19
            ]
        ]
    ]
}`);
            });

            it("actual=object containing objects/arrays/primitives, expected={}", () => {
                let obj = Comparer.comparison({
                    one: 1,
                    two: "2",
                    three: null,
                    four: undefined,
                    "five six": "\"56\"",
                    seven: "",
                    eight: false,
                    nine: {
                        ten: 10,
                        eleven: "11",
                        twenty: {
                            twentyone: 21,
                            "22": "22"
                        },
                        twentythree: [
                            23,
                            24
                        ],
                        twentyfive: [],
                        twentysix: {}
                    },
                    twelve: [
                        1,
                        "2",
                        3,
                        true,
                        null,
                        false,
                        undefined,
                        {},
                        {
                            thirteen: 13,
                            fourteen: 14,
                            fifteen: [
                                16
                            ]
                        },
                        [],
                        [
                            17,
                            18,
                            [ 19 ]
                        ]
                    ]
                }, {});

                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: null,
    four: undefined,
    "five six": "\\\"56\\\"",
    seven: "",
    eight: false,
    nine: {
        ten: 10,
        eleven: "11",
        twenty: {
            22: "22",
            twentyone: 21
        },
        twentythree: [
            23,
            24
        ],
        twentyfive: [
        ],
        twentysix: {
        }
    },
    twelve: [
        1,
        "2",
        3,
        true,
        null,
        false,
        undefined,
        {
        },
        {
            thirteen: 13,
            fourteen: 14,
            fifteen: [
                16
            ]
        },
        [
        ],
        [
            17,
            18,
            [
                19
            ]
        ]
    ]
}`);
            });

            it("actual=object containing objects/arrays/primitives, expected=different object", () => {
                let obj = Comparer.comparison({
                    one: 1,
                    three: null,
                    four: undefined,
                    "five six": "\"56\"",
                    seven: "",
                    eight: false,
                    nine: {
                        ten: 10,
                        eleven: "11",
                        twenty: {
                            "22": "22"
                        },
                        twentythree: [
                            24
                        ],
                        twentyfive: [],
                        twentysix: {}
                    },
                    twelve: [
                        1,
                        "2",
                        3,
                        true,
                        null,
                        false,
                        undefined,
                        {
                            thirteen: 13,
                            fifteen: [
                                16
                            ]
                        },
                        [],
                        [
                            17,
                            []
                        ]
                    ]
                }, {
                    one: 1,
                    two: "2",
                    three: null,
                    four: undefined,
                    "five six": "\"56\"",
                    seven: "",
                    eight: false,
                    nine: {
                        ten: 10,
                        eleven: "11",
                        twenty: {
                            twentyone: {
                                "21": 21
                            },
                            "22": "22"
                        },
                        twentythree: [
                            23,
                            24
                        ],
                        twentyfive: [],
                        twentysix: {}
                    },
                    twelve: [
                        1,
                        "2",
                        3,
                        true,
                        null,
                        false,
                        undefined,
                        {},
                        {
                            thirteen: 13,
                            fourteen: 14,
                            fifteen: [
                                16
                            ]
                        },
                        [],
                        [
                            17,
                            18,
                            [ 19 ]
                        ]
                    ]
                });

                expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    three: null,
    four: undefined,
    "five six": "\\\"56\\\"",
    seven: "",
    eight: false,
    nine: {
        ten: 10,
        eleven: "11",
        twenty: {
            22: "22"

            --> missing
            twentyone: {
                21: 21
            }
        },
        twentythree: [
            24,  -->  not 23
            undefined  -->  not 24
        ],
        twentyfive: [
        ],
        twentysix: {
        }
    },
    twelve: [
        1,
        "2",
        3,
        true,
        null,
        false,
        undefined,
        {
            thirteen: 13,
            fifteen: [
                16
            ]
        },
        [

            --> missing
            thirteen: 13

            --> missing
            fourteen: 14

            --> missing
            fifteen: [
                16
            ]
        ],
        [
            17,  -->  not expected
            [  -->  not expected
            ]
        ],
        undefined  -->  not an array
    ]

    --> missing
    two: "2"
}`);
            });
        });

        context("comparison with special expected objects", () => {
            context("$typeof", () => {
                it("expected=$typeof but not a string", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison("foobar6", { $typeof: 6 });
                    }, `typeof has to be a string: 6`);
                });

                it("expected=correct $typeof", () => {
                    let obj = Comparer.comparison(6, { $typeof: "number" });
                    expect(Comparer.print(obj)).to.equal(`6`);
                });

                it("expected=incorrect $typeof", () => {
                    let obj = Comparer.comparison(6, { $typeof: "string" });
                    expect(Comparer.print(obj)).to.equal(`6  -->  not $typeof string`);
                });

                it("actual=array, expected=$typeof array", () => {
                    let obj = Comparer.comparison([ 6 ], { $typeof: "array" });
                    expect(Comparer.print(obj)).to.equal(`[
    6
]`);
                });

                it("actual=non-array, expected=$typeof array", () => {
                    let obj = Comparer.comparison({}, { $typeof: "array" });
                    expect(Comparer.print(obj)).to.equal(`{  -->  not $typeof array
}`);
                });

                it("actual=[], expected=$typeof", () => {
                    let obj = Comparer.comparison([], [ { $typeof: 'function' } ] );
                    expect(Comparer.print(obj)).to.equal(`[
    undefined  -->  not $typeof function
]`);
                });

                it("actual={key:[]}, expected=$typeof", () => {
                    let obj = Comparer.comparison({ key: [] }, { key: [ { $typeof: 'function' } ] });
                    expect(Comparer.print(obj)).to.equal(`{
    key: [
        undefined  -->  not $typeof function
    ]
}`);
                });

                it("actual={}, expected=$typeof function", () => {
                    let obj = Comparer.comparison({}, { $typeof: 'function' });
                    expect(Comparer.print(obj)).to.equal(`{  -->  not $typeof function
}`);
                });
            });

            context("$regex", () => {
                it("expected=$regex but not a regex or string", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison("foobar6", { $regex: 6 });
                    }, `$regex has to be a /regex/ or "regex": 6`);
                });

                it("actual=non-string, expected=$regex", () => {
                    let obj = Comparer.comparison(6, { $regex: /6/ });
                    expect(Comparer.print(obj)).to.equal(`6  -->  isn't a string so can't match $regex /6/`);

                    obj = Comparer.comparison(6, { $regex: "6" });
                    expect(Comparer.print(obj)).to.equal(`6  -->  isn't a string so can't match $regex /6/`);
                });

                it("expected=correct $regex in /regex/ form", () => {
                    let obj = Comparer.comparison("foobar", { $regex: /foo[a-z]+/ });
                    expect(Comparer.print(obj)).to.equal(`"foobar"`);
                });

                it("expected=correct $regex in /regex/i form", () => {
                    let obj = Comparer.comparison("foobar", { $regex: /fooBAR/i });
                    expect(Comparer.print(obj)).to.equal(`"foobar"`);
                });

                it("expected=incorrect $regex in /regex/ form", () => {
                    let obj = Comparer.comparison("foobar", { $regex: /foo\\z[a-z]+/ });
                    expect(Comparer.print(obj)).to.equal(`"foobar"  -->  doesn't match $regex /foo\\\\z[a-z]+/`);
                });

                it("expected=correct $regex in string form", () => {
                    let obj = Comparer.comparison("foobar", { $regex: "foo[a-z]+" });
                    expect(Comparer.print(obj)).to.equal(`"foobar"`);
                });

                it("expected=incorrect $regex in string form", () => {
                    let obj = Comparer.comparison("foobar", { $regex: "foo\\\\z[a-z]+" });
                    expect(Comparer.print(obj)).to.equal(`"foobar"  -->  doesn't match $regex /foo\\\\z[a-z]+/`);
                });
            });

            context("$contains", () => {
                it("expected=$contains but not a string", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison("foobar6", { $contains: 6 });
                    }, `$contains has to be a string: 6`);
                });

                it("actual=non-string, expected=$contains", () => {
                    let obj = Comparer.comparison(6, { $contains: "oo" });
                    expect(Comparer.print(obj)).to.equal(`6  -->  isn't a string so can't $contains "oo"`);
                });

                it("expected=correct $contains", () => {
                    let obj = Comparer.comparison("foobar", { $contains: "oo" });
                    expect(Comparer.print(obj)).to.equal(`"foobar"`);
                });

                it("expected=incorrect $contains", () => {
                    let obj = Comparer.comparison("foobar", { $contains: "hoo" });
                    expect(Comparer.print(obj)).to.equal(`"foobar"  -->  doesn't $contains "hoo"`);
                });
            });

            context("$max", () => {
                it("expected=$max but not a number", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison(8, { $max: "10" });
                    }, `$max has to be a number: "10"`);
                });

                it("actual=non-number, expected=$max", () => {
                    let obj = Comparer.comparison("8", { $max: 10 });
                    expect(Comparer.print(obj)).to.equal(`"8"  -->  isn't a number so can't have a $max of 10`);
                });

                it("expected=correct $max", () => {
                    let obj = Comparer.comparison(8, { $max: 10 });
                    expect(Comparer.print(obj)).to.equal(`8`);

                    obj = Comparer.comparison(8, { $max: 8 });
                    expect(Comparer.print(obj)).to.equal(`8`);
                });

                it("expected=incorrect $max", () => {
                    let obj = Comparer.comparison(8, { $max: 7 });
                    expect(Comparer.print(obj)).to.equal(`8  -->  is greater than the $max of 7`);
                });
            });

            context("$min", () => {
                it("expected=$min but not a number", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison(8, { $min: "2" });
                    }, `$min has to be a number: "2"`);
                });

                it("actual=non-number, expected=$min", () => {
                    let obj = Comparer.comparison("8", { $min: 2 });
                    expect(Comparer.print(obj)).to.equal(`"8"  -->  isn't a number so can't have a $min of 2`);
                });

                it("expected=correct $min", () => {
                    let obj = Comparer.comparison(8, { $min: 2 });
                    expect(Comparer.print(obj)).to.equal(`8`);

                    obj = Comparer.comparison(8, { $min: 8 });
                    expect(Comparer.print(obj)).to.equal(`8`);
                });

                it("expected=incorrect $min", () => {
                    let obj = Comparer.comparison(8, { $min: 10 });
                    expect(Comparer.print(obj)).to.equal(`8  -->  is less than the $min of 10`);
                });
            });

            context("$code", () => {
                it("expected=$code but not function or string", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison("foobar", { $code: null });
                    }, `code has to be a function or string: null`);
                });

                it("expected=$code function that returns true", () => {
                    let obj = Comparer.comparison("Foobar", { $code: (actual) => { return actual.toLowerCase() == "foobar"; } });
                    expect(Comparer.print(obj)).to.equal(`"Foobar"`);
                });

                // NOTE: This test skipped because it fails when running nyc code coverage
                it.skip("expected=$code function that returns false", () => {
                    let obj = Comparer.comparison("Foobar", { $code: (actual) => { return actual.toLowerCase() == "hoo"; } });
                    expect(Comparer.print(obj)).to.equal(`"Foobar"  -->  failed the $code '(actual) => { return actual.toLowerCase() == "hoo"; }'`);
                });

                it("expected=$code function that throws an exception", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison("Foobar", { $code: (actual) => { throw new Error("oops"); } });
                    }, "oops");
                });

                it("expected=$code string that returns true", () => {
                    let obj = Comparer.comparison("Foobar", { $code: 'return actual.toLowerCase() == "foobar"' });
                    expect(Comparer.print(obj)).to.equal(`"Foobar"`);
                });

                it("expected=$code string that returns false", () => {
                    let obj = Comparer.comparison("Foobar", { $code: 'return actual.toLowerCase() == "hoo";' });
                    expect(Comparer.print(obj)).to.equal(`"Foobar"  -->  failed the $code 'return actual.toLowerCase() == "hoo";'`);
                });

                it("expected=$code string that throws an exception", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison("Foobar", { $code: 'throw new Error("oops");' });
                    }, "oops");
                });

                it("expected=$code string that evaluates true", () => {
                    let obj = Comparer.comparison("Foobar", { $code: 'actual.toLowerCase() == "foobar"' });
                    expect(Comparer.print(obj)).to.equal(`"Foobar"`);
                });

                it("expected=$code string that evaluates false", () => {
                    let obj = Comparer.comparison("Foobar", { $code: 'actual.toLowerCase() == "hoo"' });
                    expect(Comparer.print(obj)).to.equal(`"Foobar"  -->  failed the $code 'actual.toLowerCase() == "hoo"'`);
                });
            });

            context("$length", () => {
                it("expected=$length but not a number", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison([], { $length: "2" });
                    }, `$length has to be a number: "2"`);
                });

                it("actual=non-object, expected=$length", () => {
                    let obj = Comparer.comparison(8, { $length: 2 });
                    expect(Comparer.print(obj)).to.equal(`8  -->  isn't an object, array, or string so can't have a $length of 2`);
                });

                it("actual=object with no length property, expected=$length", () => {
                    let obj = Comparer.comparison({}, { $length: 2 });
                    expect(Comparer.print(obj)).to.equal(`{  -->  doesn't have a length property so can't have a $length of 2
}`);
                });

                it("expected=correct $length", () => {
                    let obj = Comparer.comparison([1, 2], { $length: 2 });
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    2
]`);
                });

                it("expected=incorrect $length", () => {
                    let obj = Comparer.comparison([1, 2], { $length: 3 });
                    expect(Comparer.print(obj)).to.equal(`[  -->  doesn't have a $length of 3
    1,
    2
]`);
                });
            });

            context("$maxLength", () => {
                it("expected=$maxLength but not a number", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison([], { $maxLength: "2" });
                    }, `$maxLength has to be a number: "2"`);
                });

                it("actual=non-object, expected=$maxLength", () => {
                    let obj = Comparer.comparison(8, { $maxLength: 2 });
                    expect(Comparer.print(obj)).to.equal(`8  -->  isn't an object, array, or string so can't have a $maxLength of 2`);
                });

                it("actual=object with no length property, expected=$maxLength", () => {
                    let obj = Comparer.comparison({}, { $maxLength: 2 });
                    expect(Comparer.print(obj)).to.equal(`{  -->  doesn't have a length property so can't have a $maxLength of 2
}`);
                });

                it("expected=correct $maxLength", () => {
                    let obj = Comparer.comparison([1, 2], { $maxLength: 2 });
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    2
]`);

                    obj = Comparer.comparison([1, 2], { $maxLength: 3 });
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    2
]`);
                });

                it("expected=incorrect $maxLength", () => {
                    let obj = Comparer.comparison([1, 2], { $maxLength: 1 });
                    expect(Comparer.print(obj)).to.equal(`[  -->  is longer than the $maxLength of 1
    1,
    2
]`);
                });
            });

            context("$minLength", () => {
                it("expected=$minLength but not a number", () => {
                    assert.throws(() => {
                        let obj = Comparer.comparison([], { $minLength: "2" });
                    }, `$minLength has to be a number: "2"`);
                });

                it("actual=non-object, expected=$minLength", () => {
                    let obj = Comparer.comparison(8, { $minLength: 2 });
                    expect(Comparer.print(obj)).to.equal(`8  -->  isn't an object, array, or string so can't have a $minLength of 2`);
                });

                it("actual=object with no length property, expected=$minLength", () => {
                    let obj = Comparer.comparison({}, { $minLength: 2 });
                    expect(Comparer.print(obj)).to.equal(`{  -->  doesn't have a length property so can't have a $minLength of 2
}`);
                });

                it("expected=correct $minLength", () => {
                    let obj = Comparer.comparison([1, 2], { $minLength: 2 });
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    2
]`);

                    obj = Comparer.comparison([1, 2], { $minLength: 1 });
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    2
]`);
                });

                it("expected=incorrect $minLength", () => {
                    let obj = Comparer.comparison([1, 2], { $minLength: 3 });
                    expect(Comparer.print(obj)).to.equal(`[  -->  is shorter than the $minLength of 3
    1,
    2
]`);
                });
            });

            context("$subset", () => {
                it("actual=non-array, expected=$subset", () => {
                    let obj = Comparer.comparison(6, [ '$subset', 1, 2 ]);
                    expect(Comparer.print(obj)).to.equal(`6  -->  not an array`);
                });

                it("actual=[], expected=[$subset]", () => {
                    let obj = Comparer.comparison([], [ '$subset' ]);
                    expect(Comparer.print(obj)).to.equal(`[
]`);
                });

                it("actual=array of primitives, expected=$subset with same exact array of primitives", () => {
                    let obj = Comparer.comparison([ 1, "2", undefined, null ], [ '$subset', 1, "2", undefined, null ]);
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    "2",
    undefined,
    null
]`);
                });

                it("actual=array of primitives, expected=correct $subset", () => {
                    let obj = Comparer.comparison([ 1, "2", undefined, null ], [ '$subset', undefined, "2" ]);
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    "2",
    undefined,
    null
]`);
                });

                it("actual=array of primitives, expected=incorrect $subset", () => {
                    let obj = Comparer.comparison([ 1, "2", undefined, null ], [ '$subset', undefined, 3, "2" ]);
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    "2",
    undefined,
    null

    --> missing
    3
]`);
                });

                it("actual=array of objects/arrays/primitives, expected=correct $subset", () => {
                    let obj = Comparer.comparison([
                        1,
                        "2",
                        undefined,
                        null,
                        {
                            one: 11,
                            two: 22,
                            three: [
                                3,
                                4
                            ],
                            five: {
                                six: 6,
                                seven: "7"
                            }
                        },
                        [],
                        {},
                        [
                            8,
                            "9",
                            {
                                ten: 10,
                                eleven: 11
                            },
                            [
                                12,
                                13
                            ]
                        ]
                    ], [
                        '$subset',
                        [
                            8,
                            {
                                eleven: 11
                            },
                            [
                                12
                            ]
                        ],
                        {
                            one: 11,
                            three: [
                                3
                            ],
                            five: {
                                seven: "7"
                            }
                        },
                        "2"
                    ]);
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    "2",
    undefined,
    null,
    {
        one: 11,
        two: 22,
        three: [
            3,
            4
        ],
        five: {
            six: 6,
            seven: "7"
        }
    },
    [
    ],
    {
    },
    [
        8,
        "9",
        {
            ten: 10,
            eleven: 11
        },
        [
            12,
            13
        ]
    ]
]`);
                });

                it("actual=array of objects/arrays/primitives, expected=incorrect $subset", () => {
                    let obj = Comparer.comparison([
                        1,
                        "2",
                        undefined,
                        null,
                        {
                            one: 11,
                            two: 22,
                            three: [
                                3,
                                4
                            ],
                            five: {
                                six: 6,
                                seven: "7"
                            }
                        },
                        [],
                        {},
                        [
                            8,
                            "9",
                            {
                                ten: 10,
                                eleven: 11
                            },
                            [
                                12,
                                13
                            ]
                        ]
                    ], [
                        '$subset',
                        [
                            8,
                            {
                                eleven: 11,
                                badone: true
                            },
                            [
                                12
                            ]
                        ],
                        {
                            one: 11,
                            three: [
                                3,
                                "badtwo"
                            ],
                            five: {
                                seven: "7"
                            }
                        },
                        "2"
                    ]);
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    "2",
    undefined,
    null,
    {
        one: 11,
        two: 22,
        three: [
            3,
            4
        ],
        five: {
            six: 6,
            seven: "7"
        }
    },
    [
    ],
    {
    },
    [
        8,
        "9",
        {
            ten: 10,
            eleven: 11
        },
        [
            12,
            13
        ]
    ]

    --> missing
    [
        8,
        {
            eleven: 11,
            badone: true
        },
        [
            12
        ]
    ]

    --> missing
    {
        one: 11,
        three: [
            3,
            "badtwo"
        ],
        five: {
            seven: "7"
        }
    }
]`);
                });
            });

            context("$anyOrder", () => {
                it("actual=non-array, expected=$anyOrder", () => {
                    let obj = Comparer.comparison(6, [ '$anyOrder', 1, 2 ]);
                    expect(Comparer.print(obj)).to.equal(`6  -->  not an array`);
                });

                it("actual=[], expected=[$anyOrder]", () => {
                    let obj = Comparer.comparison([], [ '$anyOrder' ]);
                    expect(Comparer.print(obj)).to.equal(`[
]`);
                });

                it("actual=[], expected=[$anyOrder, $subset]", () => {
                    let obj = Comparer.comparison([], [ '$anyOrder', '$subset' ]);
                    expect(Comparer.print(obj)).to.equal(`[
]`);
                });

                it("actual=array of primitives, expected=$anyOrder with array of primitives in the same order", () => {
                    let obj = Comparer.comparison( [ 2, "3", undefined, null ], [ '$anyOrder', 2, "3", undefined, null ]);
                    expect(Comparer.print(obj)).to.equal(`[
    2,
    "3",
    undefined,
    null
]`);
                });

                it("actual=array of primitives, expected=correct $anyOrder", () => {
                    let obj = Comparer.comparison( [ 2, "3", undefined, null ], [ '$anyOrder', undefined, "3", null, 2 ]);
                    expect(Comparer.print(obj)).to.equal(`[
    2,
    "3",
    undefined,
    null
]`);
                });

                it("actual=array of primitives, expected=incorrect $anyOrder by excess items", () => {
                    let obj = Comparer.comparison( [ 2, "3", undefined, null ], [ '$anyOrder', undefined, "3", null, 2, 4 ]);
                    expect(Comparer.print(obj)).to.equal(`[
    2,
    "3",
    undefined,
    null

    --> missing
    4
]`);
                });

                it("actual=array of primitives, expected=incorrect $anyOrder by missing items", () => {
                    let obj = Comparer.comparison( [ 2, "3", undefined, null ], [ '$anyOrder', "3", null, 2 ]);
                    expect(Comparer.print(obj)).to.equal(`[
    2,
    "3",
    undefined,  -->  not expected
    null
]`);
                });

                it("actual=array of objects/arrays/primitives, expected=correct $anyOrder", () => {
                    let obj = Comparer.comparison([
                        1,
                        "2",
                        undefined,
                        null,
                        {
                            one: 11,
                            two: 22,
                            three: [
                                3,
                                4
                            ],
                            five: {
                                six: 6,
                                seven: "7"
                            }
                        },
                        [
                            15
                        ],
                        {
                            sixteen: 16
                        },
                        [
                            8,
                            "9",
                            {
                                ten: 10,
                                eleven: 11
                            },
                            [
                                12,
                                13
                            ]
                        ]
                    ], [
                        '$anyOrder',
                        1,
                        [
                            15
                        ],
                        {
                            sixteen: 16
                        },
                        "2",
                        null,
                        [
                            8,
                            "9",
                            {
                                ten: 10,
                                eleven: 11
                            },
                            [
                                12,
                                13
                            ]
                        ],
                        undefined,
                        {
                            one: 11,
                            two: 22,
                            three: [
                                3,
                                4
                            ],
                            five: {
                                six: 6,
                                seven: "7"
                            }
                        }
                    ]);

                    expect(Comparer.print(obj)).to.equal(`[
    1,
    "2",
    undefined,
    null,
    {
        one: 11,
        two: 22,
        three: [
            3,
            4
        ],
        five: {
            six: 6,
            seven: "7"
        }
    },
    [
        15
    ],
    {
        sixteen: 16
    },
    [
        8,
        "9",
        {
            ten: 10,
            eleven: 11
        },
        [
            12,
            13
        ]
    ]
]`);
                });

                it("actual=array of objects/arrays/primitives, expected=incorrect $anyOrder", () => {
                    let obj = Comparer.comparison([
                        1,
                        "2",
                        undefined,
                        null,
                        {
                            one: 11,
                            two: 22,
                            three: [
                                3,
                                4
                            ],
                            five: {
                                six: 6,
                                seven: "7"
                            }
                        },
                        [
                            15
                        ],
                        {
                            sixteen: 16
                        },
                        [
                            8,
                            "9",
                            {
                                eleven: 11
                            },
                            [
                                12,
                                13
                            ]
                        ]
                    ], [
                        '$anyOrder',
                        1,
                        {
                            sixteen: 16
                        },
                        "2",
                        null,
                        [
                            8,
                            "9",
                            {
                                ten: 10,
                                eleven: 11
                            },
                            [
                                12,
                                13
                            ]
                        ],
                        undefined,
                        {
                            two: 22,
                            three: [
                                3,
                                4
                            ],
                            five: {
                                six: 6,
                                seven: "7"
                            }
                        },
                        999
                    ]);

                    expect(Comparer.print(obj)).to.equal(`[
    1,
    "2",
    undefined,
    null,
    {
        one: 11,
        two: 22,
        three: [
            3,
            4
        ],
        five: {
            six: 6,
            seven: "7"
        }
    },
    [  -->  not expected
        15
    ],
    {
        sixteen: 16
    },
    [  -->  not expected
        8,
        "9",
        {
            eleven: 11
        },
        [
            12,
            13
        ]
    ]

    --> missing
    [
        8,
        "9",
        {
            ten: 10,
            eleven: 11
        },
        [
            12,
            13
        ]
    ]

    --> missing
    999
]`);
                });
            });

            context("$exact", () => {
                it("actual=non-object, expected=$exact", () => {
                    let obj = Comparer.comparison(6, { $exact: true, one: 1 });
                    expect(Comparer.print(obj)).to.equal(`6  -->  not an object`);
                });

                it("actual={}, expected=$exact with {}", () => {
                    let obj = Comparer.comparison({}, { $exact: true });
                    expect(Comparer.print(obj)).to.equal(`{
}`);
                });

                it("actual=simple object, expected=$exact with {}", () => {
                    let obj = Comparer.comparison( { one: 1 }, { $exact: true });
                    expect(Comparer.print(obj)).to.equal(`{
    one: 1  -->  this key isn't in $exact object
}`);
                });

                it("actual=simple object, expected=$exact with same simple object", () => {
                    let obj = Comparer.comparison( { one: 1, two: "2", three: null, four: undefined }, { $exact: true, one: 1, two: "2", three: null, four: undefined } );
                    expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: null,
    four: undefined
}`);
                });

                it("actual=simple object with undefineds, expected=$exact with same simple object but without undefineds", () => {
                    let obj = Comparer.comparison( { one: 1, two: "2", three: null, four: undefined }, { $exact: true, one: 1, two: "2", three: null } );
                    expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: null,
    four: undefined  -->  this key isn't in $exact object
}`);
                });

                it("actual=simple object, expected=$exact with same simple object but with subset of keys", () => {
                    let obj = Comparer.comparison( { one: 1, two: "2", three: null, four: undefined }, { $exact: true, one: 1, three: null } );
                    expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",  -->  this key isn't in $exact object
    three: null,
    four: undefined  -->  this key isn't in $exact object
}`);
                });

                it("actual=simple object, expected=$exact with different simple object", () => {
                    let obj = Comparer.comparison( { one: 1, two: "2", three: null, four: undefined }, { $exact: true, one: 1, three: null, five: 5 } );
                    expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",  -->  this key isn't in $exact object
    three: null,
    four: undefined  -->  this key isn't in $exact object

    --> missing
    five: 5
}`);
                });

                it("actual=object containing objects/arrays/primitives, expected=$exact with same object", () => {
                    let obj = Comparer.comparison({
                        one: 1,
                        two: "2",
                        three: [
                            3,
                            4
                        ],
                        five: {
                            six: 6,
                            seven: "7"
                        },
                        eight: null,
                        nine: undefined,
                        ten: true,
                        eleven: 0
                    }, {
                        $exact: true,
                        one: 1,
                        two: "2",
                        three: [
                            3,
                            4
                        ],
                        five: {
                            six: 6,
                            seven: "7"
                        },
                        eight: null,
                        nine: undefined,
                        ten: true,
                        eleven: 0
                    });
                    expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: [
        3,
        4
    ],
    five: {
        six: 6,
        seven: "7"
    },
    eight: null,
    nine: undefined,
    ten: true,
    eleven: 0
}`);
                });

                it("actual=object containing objects/arrays/primitives, expected=$exact with same object but with subset of keys", () => {
                    let obj = Comparer.comparison({
                        one: 1,
                        two: "2",
                        three: [
                            3,
                            4
                        ],
                        five: {
                            six: 6,
                            seven: "7"
                        },
                        eight: null,
                        nine: undefined,
                        ten: true,
                        eleven: 0
                    }, {
                        $exact: true,
                        one: 1,
                        two: "2",
                        three: [
                            3,
                            4
                        ],
                        five: {
                            six: 6,
                            seven: "7"
                        },
                        eight: null,
                        ten: true,
                        eleven: 0
                    });
                    expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: [
        3,
        4
    ],
    five: {
        six: 6,
        seven: "7"
    },
    eight: null,
    nine: undefined,  -->  this key isn't in $exact object
    ten: true,
    eleven: 0
}`);
                });

                it("actual=object containing objects/arrays/primitives, expected=$exact with different object", () => {
                    let obj = Comparer.comparison({
                        one: 1,
                        two: "2",
                        three: [
                            3,
                            4
                        ],
                        five: {
                            six: 6,
                            seven: "7"
                        },
                        nine: undefined,
                        ten: true,
                        eleven: 0
                    }, {
                        $exact: true,
                        one: 1,
                        two: "2",
                        three: [
                            3,
                            4
                        ],
                        five: {
                            six: 6,
                            seven: "7"
                        },
                        eight: null,
                        ten: true,
                        eleven: 0,
                        twelve: 12
                    });
                    expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "2",
    three: [
        3,
        4
    ],
    five: {
        six: 6,
        seven: "7"
    },
    nine: undefined,  -->  this key isn't in $exact object
    ten: true,
    eleven: 0

    --> missing
    eight: null

    --> missing
    twelve: 12
}`);
                });
            });

            context("$every", () => {
                it("actual=non-array, expected=$every", () => {
                    let obj = Comparer.comparison(6, { $every: 1 } );
                    expect(Comparer.print(obj)).to.equal(`6  -->  not an array as needed for $every`);
                });

                it("actual=[], expected=$every set to undefined", () => {
                    let obj = Comparer.comparison([], { $every: 1 });
                    expect(Comparer.print(obj)).to.equal(`[  -->  empty array cannot match $every
]`);
                    obj = Comparer.comparison([], { $every: undefined });
                    expect(Comparer.print(obj)).to.equal(`[  -->  empty array cannot match $every
]`);
                });

                it("actual=array of primitives, expected=correct $every", () => {
                    let obj = Comparer.comparison( [ 3, 3, 3 ] , { $every: 3 } );
                    expect(Comparer.print(obj)).to.equal(`[
    3,
    3,
    3
]`);

                    obj = Comparer.comparison( [ 1, "2", false, null, undefined ], { $every: { $code: "actual != 'foo'" } } );
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    "2",
    false,
    null,
    undefined
]`);
                });

                it("actual=array of primitives, expected=incorrect $every", () => {
                    let obj = Comparer.comparison( [ 3, 4, 3 ], { $every: 3 } );
                    expect(Comparer.print(obj)).to.equal(`[
    3,
    4,  -->  not 3
    3
]`);
                });

                it("actual=array of objects/arrays/primitives, expected=correct $every", () => {
                    let obj = Comparer.comparison( [ { one: 1, two: [ 3, 4 ] }, { one: 1, two: [ 3, 4 ] } ] , { $every: { one: 1, two: [ 3, 4 ] } } );
                    expect(Comparer.print(obj)).to.equal(`[
    {
        one: 1,
        two: [
            3,
            4
        ]
    },
    {
        one: 1,
        two: [
            3,
            4
        ]
    }
]`);
                });

                it("actual=array of objects/arrays/primitives, expected=incorrect $every", () => {
                    let obj = Comparer.comparison( [ { one: 1, two: [ 3, 4 ] }, { one: 1, two: [ 2, 4 ] } ] , { $every: { one: 1, two: [ 3, 4 ] } } );
                    expect(Comparer.print(obj)).to.equal(`[
    {
        one: 1,
        two: [
            3,
            4
        ]
    },
    {
        one: 1,
        two: [
            2,  -->  not 3
            4
        ]
    }
]`);
                });
            });

            context("multiple constraints in the expected object", () => {
                it("expected=multiple constraints that are correct", () => {
                    let obj = Comparer.comparison('foobar', {
                        $typeof: 'string',
                        $regex: /foo.*/,
                        $contains: 'bar',
                        $code: 'actual.toUpperCase() == "FOOBAR"',
                        $length: 6,
                        $minLength: 3,
                        $maxLength: 10
                    });
                    expect(Comparer.print(obj)).to.equal(`"foobar"`);

                    obj = Comparer.comparison(5, {
                        $typeof: 'number',
                        $max: 10,
                        $min: 2
                    });
                    expect(Comparer.print(obj)).to.equal(`5`);

                    obj = Comparer.comparison( { one: "78" }, {
                        $exact: true,
                        one: {
                            $regex: "[0-9]+"
                        }
                    });
                    expect(Comparer.print(obj)).to.equal(`{
    one: "78"
}`);

                    obj = Comparer.comparison( { one: 1, two: "two", three: "33", length: 3 }, {
                        $typeof: "object",
                        one: 1,
                        two: "two",
                        three: {
                            $regex: "[0-9]+"
                        },
                        $length: 3
                    });
                    expect(Comparer.print(obj)).to.equal(`{
    one: 1,
    two: "two",
    three: "33",
    length: 3
}`);

                    obj = Comparer.comparison( [ 'ABC', 'DEF' ], { $length: 2, $every: { $regex: '[A-Z]+' } } );
                    expect(Comparer.print(obj)).to.equal(`[
    "ABC",
    "DEF"
]`);

                    obj = Comparer.comparison( [ 1, 2, 3, 4, 5 ], [ '$subset', '$anyOrder', 5, 2, 3 ]);
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    2,
    3,
    4,
    5
]`);
                });

                it("expected=multiple contrains where one is incorrect", () => {
                    let obj = Comparer.comparison('foobar', {
                        $typeof: 'string',
                        $regex: /foo.*/,
                        $contains: 'cat',
                        $code: 'actual.toUpperCase() == "FOOBAR"',
                        $length: 7,
                        $minLength: 3,
                        $maxLength: 10
                    });
                    expect(Comparer.print(obj)).to.equal(`"foobar"  -->  doesn't $contains "cat", doesn't have a $length of 7`);

                    obj = Comparer.comparison(5, {
                        $typeof: 'string',
                        $max: 4,
                        $min: 2
                    });
                    expect(Comparer.print(obj)).to.equal(`5  -->  not $typeof string, is greater than the $max of 4`);

                    obj = Comparer.comparison( { one: "78" }, {
                        $exact: true,
                        one: {
                            $regex: "[0-2]+"
                        }
                    });
                    expect(Comparer.print(obj)).to.equal(`{
    one: "78"  -->  doesn't match $regex /[0-2]+/
}`);

                    obj = Comparer.comparison( { one: 11, two: "two", three: "33", length: 4 }, {
                        $typeof: "object",
                        one: 1,
                        two: "two",
                        three: {
                            $regex: "[0-9]+"
                        },
                        $length: 3
                    });
                    expect(Comparer.print(obj)).to.equal(`{  -->  doesn't have a $length of 3
    one: 11,  -->  not 1
    two: "two",
    three: "33",
    length: 4
}`);

                    obj = Comparer.comparison( [ 'ABC', 'DEF' ], { $length: 2, $every: { $regex: '[0-9]+' } } );
                    expect(Comparer.print(obj)).to.equal(`[
    "ABC",  -->  doesn't match $regex /[0-9]+/
    "DEF"  -->  doesn't match $regex /[0-9]+/
]`);

                    obj = Comparer.comparison( [ 1, 2, 3, 4, 5 ], [ '$subset', '$anyOrder', 5, 9, 3 ]);
                    expect(Comparer.print(obj)).to.equal(`[
    1,
    2,
    3,
    4,
    5

    --> missing
    9
]`);
                });
            });
        });
    });

    describe("hasErrors()", () => {
        it("returns false on a primitive", () => {
            let failed = Comparer.hasErrors(5);
            expect(failed).to.be.false;
        });

        it("returns false on a simple object", () => {
            let failed = Comparer.hasErrors({one: 1});
            expect(failed).to.be.false;
        });

        it("returns false on a simple array", () => {
            let failed = Comparer.hasErrors([1, 2]);
            expect(failed).to.be.false;
        });

        it("returns true when there are errors in an object inside a complex object", () => {
            let failed = Comparer.hasErrors({
                $comparerNode: true,
                errors: [],
                value: {
                    one: 1,
                    two: [
                        22,
                        undefined,
                        {
                            $comparerNode: true,
                            errors: [],
                            value: 33
                        }
                    ],
                    three: {
                        $comparerNode: true,
                        errors: [ "oops" ],
                        value: 3
                    },
                    four: null
                }
            });
            expect(failed).to.be.true;
        });

        it("returns true when there are block errors in an object inside a complex object", () => {
            let failed = Comparer.hasErrors({
                $comparerNode: true,
                errors: [],
                value: {
                    one: 1,
                    two: [
                        22,
                        undefined,
                        {
                            $comparerNode: true,
                            errors: [],
                            value: 33
                        }
                    ],
                    three: {
                        $comparerNode: true,
                        errors: [ { blockError: true, text: "oops", obj: {} } ],
                        value: 3
                    },
                    four: null
                }
            });
            expect(failed).to.be.true;
        });

        it("returns true when there are errors in an array inside a complex object", () => {
            let failed = Comparer.hasErrors({
                $comparerNode: true,
                errors: [],
                value: {
                    one: 1,
                    two: [
                        22,
                        undefined,
                        {
                            $comparerNode: true,
                            errors: [ "oops" ],
                            value: 33
                        }
                    ],
                    three: {
                        $comparerNode: true,
                        errors: [],
                        value: 3
                    },
                    four: null
                }
            });
            expect(failed).to.be.true;
        });

        it("returns false when there are no errors in a complex object", () => {
            let failed = Comparer.hasErrors({
                $comparerNode: true,
                errors: [],
                value: {
                    one: 1,
                    two: [
                        22,
                        undefined,
                        {
                            $comparerNode: true,
                            errors: [],
                            value: 33
                        }
                    ],
                    three: {
                        $comparerNode: true,
                        errors: [],
                        value: 3
                    },
                    four: null
                }
            });
            expect(failed).to.be.false;
        });

        it("handles objects with circular references", () => {
            let o = {
                $comparerNode: true,
                errors: [],
                value: {
                    one: 1
                }
            };

            o.value.two = o;

            let failed = Comparer.hasErrors(o);
            expect(failed).to.be.false;

            o = {
                $comparerNode: true,
                errors: [ 'oops' ],
                value: {
                    one: 1
                }
            };

            o.value.two = o;

            failed = Comparer.hasErrors(o);
            expect(failed).to.be.true;
        });
    });

    describe("print()", () => {
        it("prints a null", () => {
            let printed = Comparer.print(null);
            expect(printed).to.equal(`null`);
        });

        it("prints an undefined", () => {
            let printed = Comparer.print(undefined);
            expect(printed).to.equal(`undefined`);
        });

        it("prints an empty string", () => {
            let printed = Comparer.print("");
            expect(printed).to.equal(`""`);
        });

        it("prints a string", () => {
            let printed = Comparer.print("foobar");
            expect(printed).to.equal(`"foobar"`);
        });

        it("prints a number", () => {
            let printed = Comparer.print(6);
            expect(printed).to.equal(`6`);
        });

        it("prints a boolean", () => {
            let printed = Comparer.print(false);
            expect(printed).to.equal(`false`);
        });

        it("prints an empty object", () => {
            let printed = Comparer.print({});
            expect(printed).to.equal(`{
}`);
        });

        it("prints an empty array", () => {
            let printed = Comparer.print([]);
            expect(printed).to.equal(`[
]`);
        });

        it("prints a simple object", () => {
            let printed = Comparer.print( { one: 1, two: "2", "three 3": 3 } );
            expect(printed).to.equal(`{
    one: 1,
    two: "2",
    "three 3": 3
}`);
        });

        it("prints a simple array", () => {
            let printed = Comparer.print( [ 1, "2" ] );
            expect(printed).to.equal(`[
    1,
    "2"
]`);
        });

        it("prints a complex object containing objects/arrays/primitives and that contains normal errors and block errors", () => {
            let printed = Comparer.print({
                $comparerNode: true,
                errors: [],
                value: {
                    one: 1,
                    two: {
                        $comparerNode: true,
                        errors: [
                            { blockError: true, text: "oops", key: "K", obj: { sorry: true } }
                        ],
                        value: [
                            22,
                            undefined,
                            {
                                $comparerNode: true,
                                errors: [ "oops1" ],
                                value: 33
                            }
                        ]
                    },
                    three: {
                        $comparerNode: true,
                        errors: [ "oops2", "oops3" ],
                        value: 3
                    },
                    four: null
                }
            });
            expect(printed).to.equal(`{
    one: 1,
    two: [
        22,
        undefined,
        33  -->  oops1

        --> oops
        K: {
            sorry: true
        }
    ],
    three: 3,  -->  oops2, oops3
    four: null
}`);
        });

        it("prints a complex object containing objects/arrays/primitives and that doesn't contain errors", () => {
            let printed = Comparer.print({
                $comparerNode: true,
                errors: [],
                value: {
                    one: 1,
                    two: [
                        22,
                        undefined,
                        {
                            $comparerNode: true,
                            errors: [],
                            value: 33
                        }
                    ],
                    three: {
                        $comparerNode: true,
                        errors: [],
                        value: 3
                    },
                    four: null
                }
            });
            expect(printed).to.equal(`{
    one: 1,
    two: [
        22,
        undefined,
        33
    ],
    three: 3,
    four: null
}`);
        });

        it("prints an object with a circular reference", () => {
            let parent = {};
            let child = {};

            parent.child = child;
            child.parent = parent;

            let printed = Comparer.print(parent);
            expect(printed).to.equal(`{
    child: {
        parent: [Circular]
    }
}`);
        });
    });
});
