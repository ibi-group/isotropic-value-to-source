# isotropic-value-to-source

[![npm version](https://img.shields.io/npm/v/isotropic-value-to-source.svg)](https://www.npmjs.com/package/isotropic-value-to-source)
[![License](https://img.shields.io/npm/l/isotropic-value-to-source.svg)](https://github.com/ibi-group/isotropic-value-to-source/blob/main/LICENSE)
![](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

A utility that converts JavaScript values into formatted, syntactically correct source code strings.

## Why Use This?

- **Code Generation**: Generate properly formatted JavaScript code programmatically
- **Beyond JSON.stringify**: Correctly handles many JavaScript types including Date, Map, RegExp, Set, Symbol, etc.
- **Linter-Friendly**: Produces code that passes Isotropic linting rules
- **Pretty Formatting**: Consistent indentation, line breaks, and property sorting
- **Configurable Output**: Customize formatting, property order, quote styles, and more
- **Circular References**: Safely handles circular structures
- **Method Preservation**: Option to include functions in the serialized output

## Installation

```bash
npm install isotropic-value-to-source
```

## Usage

```javascript
import _valueToSource from 'isotropic-value-to-source';

{
    // Basic usage
    const code = valueToSource({
        name: 'John',
        age: 30,
        hobbies: [
            'reading',
            'cycling'
        ],
        active: true
    });

    console.log(code);
    // Output:
    // {
    //     active: true,
    //     age: 30,
    //     hobbies: [
    //         'reading',
    //         'cycling'
    //     ],
    //     name: 'John'
    // }

    // Custom configuration
    const customCode = _valueToSource(data, {
        doubleQuote: true, // Use double quotes instead of single quotes
        includeUndefinedProperties: true, // Include undefined properties in output
        indentString: '  ' // Use 2 spaces for indentation
    });
}
```

## API

### valueToSource(value, options)

Converts a JavaScript value to a source code string.

#### Parameters

- `value` (Any): The value to convert to a source code string
- `options` (Object, optional): Configuration options object:
  - `circularReferenceToken` (String): Token to use for circular references. Default: `'CIRCULAR_REFERENCE'`
  - `doubleQuote` (Boolean): Whether to use double quotes instead of single quotes. Default: `false`
  - `includeFunctions` (Boolean): Whether to include functions in the output. Default: `false`
  - `includeUndefinedProperties` (Boolean): Whether to include properties with undefined values. Default: `false`
  - `indentLevel` (Number): Initial indentation level. Default: `0`
  - `indentString` (String): String to use for indentation. Default: `'    '` (4 spaces)
  - `lineEnding` (String): String to use for line endings. Default: `'\n'`
  - `propertySort` (Object): Options for property sorting:
    - `caseSensitive` (Boolean): Whether to sort properties case-sensitively. Default: `false`
    - `direction` (String): Sort direction, either `'asc'` or `'desc'`. Default: `'asc'`
    - `ignoreSpecialCharacters` (Boolean): Whether to ignore special characters when sorting. Default: `true`
    - `prefixPositions` (Object): Map of prefixes to their sort positions (`'first'` or `'last'`). Default: `{ _: 'last' }`

#### Returns

- (String): A JavaScript source code string representing the input value

## Examples

### Basic Types

```javascript
import _valueToSource from 'isotropic-value-to-source';

// Numbers
_valueToSource(42);       // "42"
_valueToSource(Infinity); // "Infinity"
_valueToSource(NaN);      // "NaN"

// Strings
_valueToSource('hello');  // "'hello'"
_valueToSource("quote's"); // "'quote\\'s'"

// Booleans
_valueToSource(true);     // "true"
_valueToSource(false);    // "false"

// Undefined and null
_valueToSource(undefined); // "void null"
_valueToSource(null);      // "null"

// BigInt
_valueToSource(42n);      // "42n"

// Symbols
_valueToSource(Symbol());              // "Symbol()"
_valueToSource(Symbol('description')); // "Symbol('description')"
_valueToSource(Symbol.for('key'));     // "Symbol.for('key')"
```

### Complex Types

```javascript
import _valueToSource from 'isotropic-value-to-source';

// Arrays
_valueToSource([1, 2, 3]);
// [
//     1,
//     2,
//     3
// ]

// Nested arrays
_valueToSource([[1], [2, 3]]);
// [
//     [
//         1
//     ],
//     [
//         2,
//         3
//     ]
// ]

// Objects
_valueToSource({ a: 1, b: 2 });
// {
//     a: 1,
//     b: 2
// }

// Nested objects
_valueToSource({ a: { b: { c: 3 } } });
// {
//     a: {
//         b: {
//             c: 3
//         }
//     }
// }

// Dates
_valueToSource(new Date('2023-01-01'));
// new Date('2023-01-01T00:00:00.000Z')

// Regular expressions
_valueToSource(/^test$/gi);
// /^test$/gi

// Sets
_valueToSource(new Set([1, 2, 3]));
// new Set([
//     1,
//     2,
//     3
// ])

// Maps
_valueToSource(new Map([['key1', 'value1'], ['key2', 'value2']]));
// new Map([
//     [
//         'key1',
//         'value1'
//     ],
//     [
//         'key2',
//         'value2'
//     ]
// ])
```

### Working with Functions

```javascript
import _valueToSource from 'isotropic-value-to-source';

{
    // Including function properties in objects
    const object = {
        farewell: function () {
            return `Goodbye ${this.name}`;
        },
        greet () {
            return `Hello ${this.name}`;
        },
        name: 'John'
    };

    _valueToSource(object, {
        includeFunctions: true
    });
    // {
    //     farewell: function () {
    //         return `Goodbye ${this.name}`;
    //     },
    //     greet () {
    //         return `Hello ${this.name}`;
    //     },
    //     name: 'John'
    // }
}

{
    // Including functions in arrays
    const array = [
        () => 'arrow function',
        function () {
            return 'function expression';
        }
    ];

    _valueToSource(array, {
        includeFunctions: true
    });
    // [
    //     () => 'arrow function',
    //     function () {
    //         return 'function expression';
    //     }
    // ]
}
```

### Handling Circular References

```javascript
import _valueToSource from 'isotropic-value-to-source';

{
    // Creating a circular structure
    const object1 = {
            name: 'Object 1'
        };
        object2 = {
            name: 'Object 2',
            reference: object1
        };

    object1.reference = object2;  // Creates a circular reference

    // Default handling
    _valueToSource(object1);
    // {
    //     name: 'Object 1',
    //     reference: {
    //         name: 'Object 2',
    //         reference: CIRCULAR_REFERENCE
    //     }
    // }

    // Custom circular reference token
    _valueToSource(object1, {
        circularReferenceToken: '/* circular */'
    });
    // {
    //     name: 'Object 1',
    //     reference: {
    //         name: 'Object 2',
    //         reference: /* circular */
    //     }
    // }
}
```

### Customizing Output Format

```javascript
import _valueToSource from 'isotropic-value-to-source';

{
    const data = {
        title: 'Example',
        items: [
            1,
            2,
            3
        ],
        details: {
            created: new Date('2023-01-01'),
            active: true
        }
    };

    // Change quote style and indentation
    _valueToSource(data, {
        doubleQuote: true,
        indentString: '  ',
        lineEnding: '\r\n'
    });
    // {
    //   details: {
    //     active: true,
    //     created: new Date("2023-01-01T00:00:00.000Z")
    //   },
    //   items: [
    //     1,
    //     2,
    //     3
    //   ],
    //   title: "Example"
    // }

    // Custom property sorting
    _valueToSource(data, {
        propertySort: {
            caseSensitive: true, // Sort case-sensitively
            direction: 'desc', // Sort in descending order
            ignoreSpecialCharacters: false, // Don't ignore special characters
            prefixPositions: {
                title: 'first' // Put 'title' property first
            }
        }
    });
}
```

### Code Generation

```javascript
import _fs from 'node:fs/promises';
import _valueToSource from 'isotropic-value-to-source';

const _generateConfigModule = async ({
    config,
    filepath
}) => {
    console.log(`Writing configuration module to ${filepath}`);

    await _fs.writeFile(filepath, [
        '// Auto-generated configuration file',
        `// Generated on ${new Date().toISOString()}`,
        '',
        `export default ${_valueToSource(config)};`,
        ''
    ].join('\n'));

    console.log(`Configuration module written to ${filepath}`);
};

{
    // Usage
    _generateConfigModule({
        config: {
            apiEndpoint: 'https://api.example.com',
            features: {
                analytics: {
                    enabled: true,
                    trackErrors: true
                },
                logging: true
            },
            retryAttempts: 3,
            timeout: 30000,
        },
        filepath: './src/config.js'
    });
}
```

## Differences from JSON.stringify

While `JSON.stringify` is great for serializing data for data interchange, `valueToSource` is designed for code generation:

| Feature | JSON.stringify | valueToSource |
|---------|---------------|--------------|
| Output format | JSON | JavaScript source code |
| Handles functions | ❌ | ✅ (with option) |
| Handles RegExp, Date as objects | ❌ | ✅ |
| Handles Map, Set | ❌ | ✅ |
| Handles Symbol | ❌ | ✅ |
| Handles BigInt | ❌ | ✅ |
| Handles undefined | ❌ | ✅ (with option) |
| Circular references | ❌ (throws error) | ✅ (with token) |
| Pretty-printing | Limited | Advanced formatting options |
| Property sorting | ❌ | ✅ (with multiple options) |
| Quote style options | ❌ | ✅ |

## Contributing

Please refer to [CONTRIBUTING.md](https://github.com/ibi-group/isotropic-value-to-source/blob/main/CONTRIBUTING.md) for contribution guidelines.

## Issues

If you encounter any issues, please file them at https://github.com/ibi-group/isotropic-value-to-source/issues
