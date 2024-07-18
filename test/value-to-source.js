import _chai from 'isotropic-dev-dependencies/lib/chai.js';
import _mocha from 'isotropic-dev-dependencies/lib/mocha.js';
import _valueToSource from '../js/value-to-source.js';
import _vm from 'node:vm';

_mocha.describe('valueToSource', () => {
    _mocha.it('should handle bigint values', () => {
        _chai.expect(_valueToSource(0n)).to.equal('0n');
        _chai.expect(_valueToSource(1n)).to.equal('1n');
        _chai.expect(_valueToSource(321n)).to.equal('321n');
        _chai.expect(_valueToSource(-4567n)).to.equal('-4567n');
    });

    _mocha.it('should handle boolean values', () => {
        _chai.expect(_valueToSource(false)).to.equal('false');
        _chai.expect(_valueToSource(true)).to.equal('true');
    });

    _mocha.it('should quote a date value', () => {
        _chai.expect(_valueToSource(new Date('2017-02-03T00:00:00.000Z'))).to.equal('new Date(\'2017-02-03T00:00:00.000Z\')');
    });

    _mocha.it('should double quote a date value', () => {
        _chai.expect(_valueToSource(new Date('2017-02-03T00:00:00.000Z'), {
            doubleQuote: true
        })).to.equal('new Date("2017-02-03T00:00:00.000Z")');
    });

    _mocha.it('should not handle functions by default', () => {
        _chai.expect(_valueToSource(() => true)).to.equal(null);
    });

    _mocha.it('should handle functions when includeFunctions is true', () => {
        const context = {
                result: null
            },
            valueString = _valueToSource(() => true, {
                includeFunctions: true
            });

        _chai.expect(valueString).to.be.a('string');

        _vm.runInNewContext(`
            const f = ${valueString};
            result = f();
        `, context);

        _chai.expect(context.result).to.be.true;
    });

    _mocha.it('should handle a null value', () => {
        _chai.expect(_valueToSource(null)).to.equal('null');
    });

    _mocha.it('should handle number values', () => {
        _chai.expect(_valueToSource(0)).to.equal('0');
        _chai.expect(_valueToSource(1)).to.equal('1');
        _chai.expect(_valueToSource(321)).to.equal('321');
        _chai.expect(_valueToSource(-4567)).to.equal('-4567');
        _chai.expect(_valueToSource(1.2345)).to.equal('1.2345');
        _chai.expect(_valueToSource(Infinity)).to.equal('Infinity');
        _chai.expect(_valueToSource(-Infinity)).to.equal('-Infinity');
        _chai.expect(_valueToSource(NaN)).to.equal('NaN');
    });

    _mocha.it('should handle a regular expression value', () => {
        _chai.expect(_valueToSource(/^test\w+(regular[\t ]expression)$/giv)).to.equal('/^test\\w+(regular[\\t ]expression)$/giv');
    });

    _mocha.it('should quote a string value', () => {
        _chai.expect(_valueToSource('test string')).to.equal('\'test string\'');
    });

    _mocha.it('should escape quotes within a quoted string', () => {
        _chai.expect(_valueToSource('test\'"string')).to.equal('\'test\\\'"string\'');
    });

    _mocha.it('should double quote a string value', () => {
        _chai.expect(_valueToSource('test string', {
            doubleQuote: true
        })).to.equal('"test string"');
    });

    _mocha.it('should escape double quotes within a double quoted string', () => {
        _chai.expect(_valueToSource('test\'"string', {
            doubleQuote: true
        })).to.equal('"test\'\\"string"');
    });

    _mocha.it('should handle a symbol value', () => {
        _chai.expect(_valueToSource(Symbol())).to.equal('Symbol()'); // eslint-disable-line symbol-description -- This is explicitly testing for a Symbol without a description.
    });

    _mocha.it('should quote a registered symbol value\'s description', () => {
        _chai.expect(_valueToSource(Symbol.for('registered test symbol description'))).to.equal('Symbol.for(\'registered test symbol description\')');
    });

    _mocha.it('should escape quotes within a quoted registered symbol value description', () => {
        _chai.expect(_valueToSource(Symbol.for('registered\'"test\'"symbol\'"description'))).to.equal('Symbol.for(\'registered\\\'"test\\\'"symbol\\\'"description\')');
    });

    _mocha.it('should double quote a registered symbol value\'s description', () => {
        _chai.expect(_valueToSource(Symbol.for('registered test symbol description'), {
            doubleQuote: true
        })).to.equal('Symbol.for("registered test symbol description")');
    });

    _mocha.it('should escape double quotes within a double quoted registered symbol value description', () => {
        _chai.expect(_valueToSource(Symbol.for('registered\'"test\'"symbol\'"description'), {
            doubleQuote: true
        })).to.equal('Symbol.for("registered\'\\"test\'\\"symbol\'\\"description")');
    });

    _mocha.it('should quote a symbol value\'s description', () => {
        _chai.expect(_valueToSource(Symbol('test symbol description'))).to.equal('Symbol(\'test symbol description\')');
    });

    _mocha.it('should escape quotes within a quoted symbol value description', () => {
        _chai.expect(_valueToSource(Symbol('test\'"symbol\'"description'))).to.equal('Symbol(\'test\\\'"symbol\\\'"description\')');
    });

    _mocha.it('should double quote a symbol value\'s description', () => {
        _chai.expect(_valueToSource(Symbol('test symbol description'), {
            doubleQuote: true
        })).to.equal('Symbol("test symbol description")');
    });

    _mocha.it('should escape double quotes within a double quoted symbol value description', () => {
        _chai.expect(_valueToSource(Symbol('test\'"symbol\'"description'), {
            doubleQuote: true
        })).to.equal('Symbol("test\'\\"symbol\'\\"description")');
    });

    _mocha.it('should handle an undefined value', () => {
        _chai.expect(_valueToSource(void null)).to.equal('void null');
    });

    _mocha.it('should handle an empty object literal', () => {
        _chai.expect(_valueToSource({})).to.equal('{}');
    });

    _mocha.it('should handle a simple object literal', () => {
        _chai.expect(_valueToSource({
            a: 1,
            b: 2,
            c: 3
        })).to.equal('{\n    a: 1,\n    b: 2,\n    c: 3\n}');
    });

    _mocha.it('should sort object properties in ascending order by default', () => {
        /* eslint-disable isotropic/sort-keys
        --
        This is explicitly testing improperly sorted keys.
        */
        _chai.expect(_valueToSource({
            c: 1,
            b: 2,
            a: 3
        })).to.equal('{\n    a: 3,\n    b: 2,\n    c: 1\n}');
        /* eslint-enable isotropic/sort-keys
        --
        Reenable the rule.
        */
    });

    _mocha.it('should sort object properties in case insensitive order by default', () => {
        /* eslint-disable isotropic/sort-keys
        --
        This is explicitly testing improperly sorted keys.
        */
        _chai.expect(_valueToSource({
            c: 1,
            B: 2,
            a: 3
        })).to.equal('{\n    a: 3,\n    B: 2,\n    c: 1\n}');
        /* eslint-enable isotropic/sort-keys
        --
        Reenable the rule.
        */
    });

    _mocha.it('should sort object properties with _ prefix last by default', () => {
        /* eslint-disable isotropic/sort-keys
        --
        This is explicitly testing improperly sorted keys.
        */
        _chai.expect(_valueToSource({
            _a: 1,
            _b: 2,
            _c: 3,
            x: 4,
            y: 5,
            z: 6
        })).to.equal('{\n    x: 4,\n    y: 5,\n    z: 6,\n    _a: 1,\n    _b: 2,\n    _c: 3\n}');
        /* eslint-enable isotropic/sort-keys
        --
        Reenable the rule.
        */
    });

    _mocha.it('should sort object properties ignoring special characters by default', () => {
        /* eslint-disable isotropic/sort-keys
        --
        This is explicitly testing improperly sorted keys.
        */
        _chai.expect(_valueToSource({
            aeiou_e: 1,
            aeioǜ_d: 2,
            aęiou_b: 3,
            áeiou_a: 4,
            æiou_c: 5
        })).to.equal('{\n    áeiou_a: 4,\n    aęiou_b: 3,\n    æiou_c: 5,\n    aeioǜ_d: 2,\n    aeiou_e: 1\n}');
        /* eslint-enable isotropic/sort-keys
        --
        Reenable the rule.
        */
    });

    _mocha.it('should sort object properties in descending order', () => {
        _chai.expect(_valueToSource({
            a: 1,
            b: 2,
            c: 3
        }, {
            propertySort: {
                direction: 'desc'
            }
        })).to.equal('{\n    c: 3,\n    b: 2,\n    a: 1\n}');
    });

    _mocha.it('should sort object properties in case sensitive order', () => {
        /* eslint-disable isotropic/sort-keys
        --
        This is explicitly testing improperly sorted keys.
        */
        _chai.expect(_valueToSource({
            c: 1,
            B: 2,
            a: 3
        }, {
            propertySort: {
                caseSensitive: true
            }
        })).to.equal('{\n    B: 2,\n    a: 3,\n    c: 1\n}');
        /* eslint-enable isotropic/sort-keys
        --
        Reenable the rule.
        */
    });

    _mocha.it('should sort object properties without ignoring special characters', () => {
        _chai.expect(_valueToSource({
            áeiou_a: 4,
            aęiou_b: 3,
            æiou_c: 5,
            aeioǜ_d: 2,
            aeiou_e: 1
        }, {
            propertySort: {
                ignoreSpecialCharacters: false
            }
        })).to.equal('{\n    aeiou_e: 1,\n    aeioǜ_d: 2,\n    aęiou_b: 3,\n    áeiou_a: 4,\n    æiou_c: 5\n}');
    });

    _mocha.it('should quote property names as needed', () => {
        /* eslint-disable isotropic/stylistic/quote-props
        --
        This is explicitly testing improperly quoted properties.
        */
        _chai.expect(_valueToSource({
            'a-b-c': 'a-b-c',
            'abc': 'abc'
        })).to.equal('{\n    \'a-b-c\': \'a-b-c\',\n    abc: \'abc\'\n}');
        /* eslint-enable isotropic/stylistic/quote-props
        --
        Reenable the rule.
        */
    });

    _mocha.it('should escape quotes within a quoted property name', () => {
        _chai.expect(_valueToSource({
            'a\'b\'c': 'a\'b\'c'
        })).to.equal('{\n    \'a\\\'b\\\'c\': \'a\\\'b\\\'c\'\n}');
    });

    _mocha.it('should double quote property names as needed', () => {
        /* eslint-disable isotropic/stylistic/quote-props
        --
        This is explicitly testing improperly quoted properties.
        */
        _chai.expect(_valueToSource({
            'a-b-c': 'a-b-c',
            'abc': 'abc'
        }, {
            doubleQuote: true
        })).to.equal('{\n    "a-b-c": "a-b-c",\n    abc: "abc"\n}');
        /* eslint-enable isotropic/stylistic/quote-props
        --
        Reenable the rule.
        */
    });

    _mocha.it('should escape double quotes within a double quoted property name', () => {
        _chai.expect(_valueToSource({
            'a"b"c': 'a"b"c'
        }, {
            doubleQuote: true
        })).to.equal('{\n    "a\\"b\\"c": "a\\"b\\"c"\n}');
    });

    _mocha.it('should ignore undefined properties', () => {
        _chai.expect(_valueToSource({
            a: 1,
            b: void null,
            c: 3
        })).to.equal('{\n    a: 1,\n    c: 3\n}');
    });

    _mocha.it('should handle undefined properties when includeUndefinedProperties is true', () => {
        _chai.expect(_valueToSource({
            a: 1,
            b: void null,
            c: 3
        }, {
            includeUndefinedProperties: true
        })).to.equal('{\n    a: 1,\n    b: void null,\n    c: 3\n}');
    });

    _mocha.it('should ignore function properties by default', () => {
        /* eslint-disable object-shorthand
        --
        This is explicitly testing different method syntax.
        */
        _chai.expect(_valueToSource({
            a: function () {
                return 'a';
            },
            b: () => 'b',
            c () {
                return 'c';
            }
        })).to.equal('{}');
        /* eslint-enable object-shorthand
        --
        Reenable the rule.
        */
    });

    _mocha.it('should handle function properties when includeFunctions is true', () => {
        const context = {
                object: {}
            },
            valueString = _valueToSource({
                a: function () { // eslint-disable-line object-shorthand -- This is explicitly testing different method syntax.
                    return 'a';
                },
                b: () => 'b',
                c () {
                    return 'c';
                }
            }, {
                includeFunctions: true
            });

        _chai.expect(valueString).to.be.a('string');

        _vm.runInNewContext(`object = ${valueString};`, context);

        _chai.expect(context.object.a()).to.equal('a');
        _chai.expect(context.object.b()).to.equal('b');
        _chai.expect(context.object.c()).to.equal('c');
    });

    _mocha.it('should handle nested object literals', () => {
        _chai.expect(_valueToSource({
            a: {
                b: {
                    c: {}
                }
            }
        })).to.equal('{\n    a: {\n        b: {\n            c: {}\n        }\n    }\n}');
    });

    _mocha.it('should handle circular references', () => {
        const a = {},
            b = {};

        a.b = b;
        b.a = a;

        _chai.expect(_valueToSource(a)).to.equal('{\n    b: {\n        a: CIRCULAR_REFERENCE\n    }\n}');
    });

    _mocha.it('should allow a custom circular reference token', () => {
        const a = {},
            b = {};

        a.b = b;
        b.a = a;

        _chai.expect(_valueToSource(a, {
            circularReferenceToken: '{{custom token}}'
        })).to.equal('{\n    b: {\n        a: {{custom token}}\n    }\n}');
    });

    _mocha.it('should handle an empty array literal', () => {
        _chai.expect(_valueToSource([])).to.equal('[]');
    });

    _mocha.it('should handle a simple array literal', () => {
        _chai.expect(_valueToSource([
            1,
            2,
            3
        ])).to.equal('[\n    1,\n    2,\n    3\n]');
    });

    _mocha.it('should handle sparse array literals', () => {
        /* eslint-disable isotropic/stylistic/comma-style, no-sparse-arrays
        --
        This is explicitly testing a sparse array.
        */
        _chai.expect(_valueToSource([
            1,
            ,
            3
        ])).to.equal('[\n    1,\n    ,\n    3\n]');
        /* eslint-enable isotropic/stylistic/comma-style, no-sparse-arrays
        --
        Reenable the rules.
        */
    });

    _mocha.it('should handle empty nested array literals', () => {
        _chai.expect(_valueToSource([[[[]]]])).to.equal('[[[[]]]]');
    });

    _mocha.it('should handle nested array literals', () => {
        _chai.expect(_valueToSource([[[[
            1
        ]], [[
            2
        ]]]])).to.equal('[[[[\n    1\n]], [[\n    2\n]]]]');
    });

    _mocha.it('should ignore function items by default', () => {
        _chai.expect(_valueToSource([
            () => 0,
            1,
            () => 2,
            3,
            () => 4,
            5
        ])).to.equal('[\n    ,\n    1,\n    ,\n    3,\n    ,\n    5\n]');
    });

    _mocha.it('should handle function items when includeFunctions is true', () => {
        const context = {
                array: []
            },
            valueString = _valueToSource([
                () => 0,
                1,
                () => 2,
                3,
                () => 4,
                5
            ], {
                includeFunctions: true
            });

        _chai.expect(valueString).to.be.a('string');

        _vm.runInNewContext(`array = ${valueString};`, context);

        _chai.expect(context.array[0]()).to.equal(0);
        _chai.expect(context.array[1]).to.equal(1);
        _chai.expect(context.array[2]()).to.equal(2);
        _chai.expect(context.array[3]).to.equal(3);
        _chai.expect(context.array[4]()).to.equal(4);
        _chai.expect(context.array[5]).to.equal(5);
    });

    _mocha.it('should handle an empty map value', () => {
        _chai.expect(_valueToSource(new Map())).to.equal('new Map()');
    });

    _mocha.it('should handle a map value', () => {
        _chai.expect(_valueToSource(new Map([[
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

    _mocha.it('should handle an empty set value', () => {
        _chai.expect(_valueToSource(new Set())).to.equal('new Set()');
    });

    _mocha.it('should handle a set value', () => {
        _chai.expect(_valueToSource(new Set([
            1,
            2,
            3
        ]))).to.equal('new Set([\n    1,\n    2,\n    3\n])');
    });

    _mocha.it('should allow custom indentation', () => {
        _chai.expect(_valueToSource({
            a: 1,
            b: 2,
            c: 3
        }, {
            indentString: '\t'
        })).to.equal('{\n\ta: 1,\n\tb: 2,\n\tc: 3\n}');
    });

    _mocha.it('should allow custom line endings', () => {
        _chai.expect(_valueToSource({
            a: 1,
            b: 2,
            c: 3
        }, {
            lineEnding: '\r\n'
        })).to.equal('{\r\n    a: 1,\r\n    b: 2,\r\n    c: 3\r\n}');
    });
});
