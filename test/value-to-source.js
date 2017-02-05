import {
    describe,
    it
} from 'mocha';

import {
    expect
} from 'chai';

import {
    runInNewContext
} from 'vm';

import valueToSource from '../js/value-to-source.js';

describe('valueToSource', () => {
    it('should handle boolean values', () => {
        expect(valueToSource(false)).to.equal('false');
        expect(valueToSource(true)).to.equal('true');
    });

    it('should quote a date value', () => {
        expect(valueToSource(new Date('2017-02-03T00:00:00.000Z'))).to.equal('new Date(\'2017-02-03T00:00:00.000Z\')');
    });

    it('should double quote a date value', () => {
        expect(valueToSource(new Date('2017-02-03T00:00:00.000Z'), {
            doubleQuote: true
        })).to.equal('new Date("2017-02-03T00:00:00.000Z")');
    });

    it('should not handle functions by default', () => {
        expect(valueToSource(() => true)).to.equal(null);
    });

    it('should handle functions when includeFunctions is true', () => {
        const context = {
                result: null
            },
            valueString = valueToSource(() => true, {
                includeFunctions: true
            });

        expect(valueString).to.be.a('string');

        runInNewContext(`
            const f = ${valueString};
            result = f();
        `, context);

        expect(context.result).to.be.true;
    });

    it('should handle a null value', () => {
        expect(valueToSource(null)).to.equal('null');
    });

    it('should handle number values', () => {
        expect(valueToSource(0)).to.equal('0');
        expect(valueToSource(1)).to.equal('1');
        expect(valueToSource(321)).to.equal('321');
        expect(valueToSource(-4567)).to.equal('-4567');
        expect(valueToSource(1.2345)).to.equal('1.2345');
        expect(valueToSource(Infinity)).to.equal('Infinity');
        expect(valueToSource(-Infinity)).to.equal('-Infinity');
        expect(valueToSource(NaN)).to.equal('NaN');
    });

    it('should handle a regular expression value', () => {
        expect(valueToSource(/^test\w+(regular[ \t]expression)$/gi)).to.equal('/^test\\w+(regular[ \\t]expression)$/gi');
    });

    it('should quote a string value', () => {
        expect(valueToSource('test string')).to.equal('\'test string\'');
    });

    it('should escape quotes within a quoted string', () => {
        expect(valueToSource('test\'"string')).to.equal('\'test\\\'"string\'');
    });

    it('should double quote a string value', () => {
        expect(valueToSource('test string', {
            doubleQuote: true
        })).to.equal('"test string"');
    });

    it('should escape double quotes within a double quoted string', () => {
        expect(valueToSource('test\'"string', {
            doubleQuote: true
        })).to.equal('"test\'\\"string"');
    });

    it('should handle a symbol value', () => {
        /* eslint-disable symbol-description */
        expect(valueToSource(Symbol())).to.equal('Symbol()');
        /* eslint-enable symbol-description */
    });

    it('should quote a registered symbol value\'s description', () => {
        expect(valueToSource(Symbol.for('registered test symbol description'))).to.equal('Symbol.for(\'registered test symbol description\')');
    });

    it('should escape quotes within a quoted registered symbol value description', () => {
        expect(valueToSource(Symbol.for('registered\'"test\'"symbol\'"description'))).to.equal('Symbol.for(\'registered\\\'"test\\\'"symbol\\\'"description\')');
    });

    it('should double quote a registered symbol value\'s description', () => {
        expect(valueToSource(Symbol.for('registered test symbol description'), {
            doubleQuote: true
        })).to.equal('Symbol.for("registered test symbol description")');
    });

    it('should escape double quotes within a double quoted registered symbol value description', () => {
        expect(valueToSource(Symbol.for('registered\'"test\'"symbol\'"description'), {
            doubleQuote: true
        })).to.equal('Symbol.for("registered\'\\"test\'\\"symbol\'\\"description")');
    });

    it('should quote a symbol value\'s description', () => {
        expect(valueToSource(Symbol('test symbol description'))).to.equal('Symbol(\'test symbol description\')');
    });

    it('should escape quotes within a quoted symbol value description', () => {
        expect(valueToSource(Symbol('test\'"symbol\'"description'))).to.equal('Symbol(\'test\\\'"symbol\\\'"description\')');
    });

    it('should double quote a symbol value\'s description', () => {
        expect(valueToSource(Symbol('test symbol description'), {
            doubleQuote: true
        })).to.equal('Symbol("test symbol description")');
    });

    it('should escape double quotes within a double quoted symbol value description', () => {
        expect(valueToSource(Symbol('test\'"symbol\'"description'), {
            doubleQuote: true
        })).to.equal('Symbol("test\'\\"symbol\'\\"description")');
    });

    it('should handle an undefined value', () => {
        expect(valueToSource(void null)).to.equal('void null');
    });

    it('should handle an empty object literal', () => {
        expect(valueToSource({})).to.equal('{}');
    });

    it('should handle a simple object literal', () => {
        expect(valueToSource({
            a: 1,
            b: 2,
            c: 3
        })).to.equal('{\n    a: 1,\n    b: 2,\n    c: 3\n}');
    });

    it('should sort object properties', () => {
        expect(valueToSource({
            c: 1,
            b: 2,
            a: 3
        })).to.equal('{\n    a: 3,\n    b: 2,\n    c: 1\n}');
    });

    it('should quote property names as needed', () => {
        /* eslint-disable quote-props */
        expect(valueToSource({
            'a-b-c': 'a-b-c',
            'abc': 'abc'
        })).to.equal('{\n    \'a-b-c\': \'a-b-c\',\n    abc: \'abc\'\n}');
        /* eslint-enable quote-props */
    });

    it('should escape quotes within a quoted property name', () => {
        expect(valueToSource({
            'a\'b\'c': 'a\'b\'c'
        })).to.equal('{\n    \'a\\\'b\\\'c\': \'a\\\'b\\\'c\'\n}');
    });

    it('should double quote property names as needed', () => {
        /* eslint-disable quote-props */
        expect(valueToSource({
            'a-b-c': 'a-b-c',
            'abc': 'abc'
        }, {
            doubleQuote: true
        })).to.equal('{\n    "a-b-c": "a-b-c",\n    abc: "abc"\n}');
        /* eslint-enable quote-props */
    });

    it('should escape double quotes within a double quoted property name', () => {
        expect(valueToSource({
            'a"b"c': 'a"b"c'
        }, {
            doubleQuote: true
        })).to.equal('{\n    "a\\"b\\"c": "a\\"b\\"c"\n}');
    });

    it('should ignore undefined properties', () => {
        expect(valueToSource({
            a: 1,
            b: void null,
            c: 3
        })).to.equal('{\n    a: 1,\n    c: 3\n}');
    });

    it('should handle undefined properties when includeUndefinedProperties is true', () => {
        expect(valueToSource({
            a: 1,
            b: void null,
            c: 3
        }, {
            includeUndefinedProperties: true
        })).to.equal('{\n    a: 1,\n    b: void null,\n    c: 3\n}');
    });

    it('should ignore function properties by default', () => {
        /* eslint-disable object-shorthand */
        expect(valueToSource({
            a: function () {
                return 'a';
            },
            b: () => 'b',
            c () {
                return 'c';
            }
        })).to.equal('{}');
        /* eslint-enable object-shorthand */
    });

    it('should handle function properties when includeFunctions is true', () => {
        const context = {
                object: {}
            },
            valueString = valueToSource({/* eslint-disable object-shorthand */
                a: function () {
                    return 'a';
                }, /* eslint-enable object-shorthand */
                b: () => 'b',
                c () {
                    return 'c';
                }
            }, {
                includeFunctions: true
            });

        expect(valueString).to.be.a('string');

        runInNewContext(`object = ${valueString};`, context);

        expect(context.object.a()).to.equal('a');
        expect(context.object.b()).to.equal('b');
        expect(context.object.c()).to.equal('c');
    });

    it('should handle nested object literals', () => {
        expect(valueToSource({
            a: {
                b: {
                    c: {}
                }
            }
        })).to.equal('{\n    a: {\n        b: {\n            c: {}\n        }\n    }\n}');
    });

    it('should handle circular references', () => {
        const a = {},
            b = {};

        a.b = b;
        b.a = a;

        expect(valueToSource(a)).to.equal('{\n    b: {\n        a: CIRCULAR_REFERENCE\n    }\n}');
    });

    it('should allow a custom circular reference token', () => {
        const a = {},
            b = {};

        a.b = b;
        b.a = a;

        expect(valueToSource(a, {
            circularReferenceToken: '{{custom token}}'
        })).to.equal('{\n    b: {\n        a: {{custom token}}\n    }\n}');
    });

    it('should handle an empty array literal', () => {
        expect(valueToSource([])).to.equal('[]');
    });

    it('should handle a simple array literal', () => {
        expect(valueToSource([
            1,
            2,
            3
        ])).to.equal('[\n    1,\n    2,\n    3\n]');
    });

    it('should handle sparse array literals', () => {
        /* eslint-disable comma-style, no-sparse-arrays */
        expect(valueToSource([
            1,
            ,
            3
        ])).to.equal('[\n    1,\n    ,\n    3\n]');
        /* eslint-enable comma-style, no-sparse-arrays */
    });

    it('should handle empty nested array literals', () => {
        expect(valueToSource([[[[]]]])).to.equal('[[[[]]]]');
    });

    it('should handle nested array literals', () => {
        expect(valueToSource([[[[
            1
        ]], [[
            2
        ]]]])).to.equal('[[[[\n    1\n]], [[\n    2\n]]]]');
    });

    it('should ignore function items by default', () => {
        expect(valueToSource([
            () => 0,
            1,
            () => 2,
            3,
            () => 4,
            5
        ])).to.equal('[\n    ,\n    1,\n    ,\n    3,\n    ,\n    5\n]');
    });

    it('should handle function items when includeFunctions is true', () => {
        const context = {
                array: []
            },
            valueString = valueToSource([
                () => 0,
                1,
                () => 2,
                3,
                () => 4,
                5
            ], {
                includeFunctions: true
            });

        expect(valueString).to.be.a('string');

        runInNewContext(`array = ${valueString};`, context);

        expect(context.array[0]()).to.equal(0);
        expect(context.array[1]).to.equal(1);
        expect(context.array[2]()).to.equal(2);
        expect(context.array[3]).to.equal(3);
        expect(context.array[4]()).to.equal(4);
        expect(context.array[5]).to.equal(5);
    });

    it('should handle an empty map value', () => {
        expect(valueToSource(new Map())).to.equal('new Map()');
    });

    it('should handle a map value', () => {
        expect(valueToSource(new Map([[
            1,
            2
        ], [
            3,
            4
        ], [
            5,
            6
        ]]))).to.equal('new Map([[\n    1,\n    2\n], [\n    3,\n    4\n], [\n    5,\n    6\n]])');
    });

    it('should handle an empty set value', () => {
        expect(valueToSource(new Set())).to.equal('new Set()');
    });

    it('should handle a set value', () => {
        expect(valueToSource(new Set([
            1,
            2,
            3
        ]))).to.equal('new Set([\n    1,\n    2,\n    3\n])');
    });

    it('should allow custom indentation', () => {
        expect(valueToSource({
            a: 1,
            b: 2,
            c: 3
        }, {
            indentString: '\t'
        })).to.equal('{\n\ta: 1,\n\tb: 2,\n\tc: 3\n}');
    });

    it('should allow custom line endings', () => {
        expect(valueToSource({
            a: 1,
            b: 2,
            c: 3
        }, {
            lineEnding: '\r\n'
        })).to.equal('{\r\n    a: 1,\r\n    b: 2,\r\n    c: 3\r\n}');
    });
});
