import {
    runInNewContext as _runInNewContext
} from 'vm';

const _propertyNameRequiresQuotes = propertyName => {
        try {
            const context = {
                worksWithoutQuotes: false
            };

            _runInNewContext(`worksWithoutQuotes = {${propertyName}: true}['${propertyName}']`, context);

            return !context.worksWithoutQuotes;
        } catch (exception) {
            return true;
        }
    },

    _quoteString = (string, {
        doubleQuote
    }) => (doubleQuote ?
        `"${string.replace(/"/g, '\\"')}"` :
        `'${string.replace(/'/g, '\\\'')}'`),

    _valueToSource = (value, {
        circularReferenceToken = 'CIRCULAR_REFERENCE',
        doubleQuote = false,
        includeFunctions = false,
        includeUndefinedProperties = false,
        indentLevel = 0,
        indentString = '    ',
        lineEnding = '\n',
        visitedObjects = new Set()
    } = {}) => {
        switch (typeof value) {
            case 'boolean':
                return value ?
                    `${indentString.repeat(indentLevel)}true` :
                    `${indentString.repeat(indentLevel)}false`;
            case 'function':
                if (includeFunctions) {
                    return `${indentString.repeat(indentLevel)}${value}`;
                }

                return null;
            case 'number':
                return `${indentString.repeat(indentLevel)}${value}`;
            case 'object':
                if (!value) {
                    return `${indentString.repeat(indentLevel)}null`;
                }

                if (visitedObjects.has(value)) {
                    return `${indentString.repeat(indentLevel)}${circularReferenceToken}`;
                }

                if (value instanceof Date) {
                    return `${indentString.repeat(indentLevel)}new Date(${_quoteString(value.toISOString(), {
                        doubleQuote
                    })})`;
                }

                if (value instanceof Map) {
                    return value.size ?
                        `${indentString.repeat(indentLevel)}new Map(${_valueToSource([
                            ...value
                        ], {
                            circularReferenceToken,
                            doubleQuote,
                            includeFunctions,
                            includeUndefinedProperties,
                            indentLevel,
                            indentString,
                            lineEnding,
                            visitedObjects: new Set([
                                value,
                                ...visitedObjects
                            ])
                        }).substr(indentLevel * indentString.length)})` :
                        `${indentString.repeat(indentLevel)}new Map()`;
                }

                if (value instanceof RegExp) {
                    return `${indentString.repeat(indentLevel)}/${value.source}/${value.flags}`;
                }

                if (value instanceof Set) {
                    return value.size ?
                        `${indentString.repeat(indentLevel)}new Set(${_valueToSource([
                            ...value
                        ], {
                            circularReferenceToken,
                            doubleQuote,
                            includeFunctions,
                            includeUndefinedProperties,
                            indentLevel,
                            indentString,
                            lineEnding,
                            visitedObjects: new Set([
                                value,
                                ...visitedObjects
                            ])
                        }).substr(indentLevel * indentString.length)})` :
                        `${indentString.repeat(indentLevel)}new Set()`;
                }

                if (Array.isArray(value)) {
                    if (!value.length) {
                        return `${indentString.repeat(indentLevel)}[]`;
                    }

                    const itemsStayOnTheSameLine = value.every(item =>
                        typeof item === 'object' &&
                        item &&
                        !(item instanceof Date) &&
                        !(item instanceof Map) &&
                        !(item instanceof RegExp) &&
                        !(item instanceof Set) &&
                        (
                            Object.keys(item).length ||
                            value.length === 1
                        )
                    );

                    let previousIndex = null;

                    value = value.reduce((items, item, index) => {
                        if (previousIndex !== null) {
                            for (let i = index - previousIndex - 1; i > 0; i -= 1) {
                                items.push(indentString.repeat(indentLevel + 1));
                            }
                        }

                        previousIndex = index;

                        item = _valueToSource(item, {
                            circularReferenceToken,
                            doubleQuote,
                            includeFunctions,
                            includeUndefinedProperties,
                            indentLevel: itemsStayOnTheSameLine ?
                                indentLevel :
                                indentLevel + 1,
                            indentString,
                            lineEnding,
                            visitedObjects: new Set([
                                value,
                                ...visitedObjects
                            ])
                        });

                        if (item === null) {
                            items.push(indentString.repeat(indentLevel + 1));
                        } else if (itemsStayOnTheSameLine) {
                            items.push(item.substr(indentLevel * indentString.length));
                        } else {
                            items.push(item);
                        }

                        return items;
                    }, []);

                    return itemsStayOnTheSameLine ?
                        `${indentString.repeat(indentLevel)}[${value.join(', ')}]` :
                        `${indentString.repeat(indentLevel)}[${lineEnding}${value.join(`,${lineEnding}`)}${lineEnding}${indentString.repeat(indentLevel)}]`;
                }

                value = Object.keys(value).sort().reduce((entries, propertyName) => {
                    const propertyValue = value[propertyName],
                        propertyValueString = typeof propertyValue !== 'undefined' || includeUndefinedProperties ?
                            _valueToSource(value[propertyName], {
                                circularReferenceToken,
                                doubleQuote,
                                includeFunctions,
                                includeUndefinedProperties,
                                indentLevel: indentLevel + 1,
                                indentString,
                                lineEnding,
                                visitedObjects: new Set([
                                    value,
                                    ...visitedObjects
                                ])
                            }) :
                            null;

                    if (propertyValueString) {
                        const quotedPropertyName = _propertyNameRequiresQuotes(propertyName) ?
                                _quoteString(propertyName, {
                                    doubleQuote
                                }) :
                                propertyName,
                            trimmedPropertyValueString = propertyValueString.substr((indentLevel + 1) * indentString.length);

                        if (typeof propertyValue === 'function' && trimmedPropertyValueString.startsWith(`${propertyName}()`)) {
                            entries.push(`${indentString.repeat(indentLevel + 1)}${quotedPropertyName} ${trimmedPropertyValueString.substr(propertyName.length)}`);
                        } else {
                            entries.push(`${indentString.repeat(indentLevel + 1)}${quotedPropertyName}: ${trimmedPropertyValueString}`);
                        }
                    }

                    return entries;
                }, []);

                return value.length ?
                    `${indentString.repeat(indentLevel)}{${lineEnding}${value.join(`,${lineEnding}`)}${lineEnding}${indentString.repeat(indentLevel)}}` :
                    `${indentString.repeat(indentLevel)}{}`;
            case 'string':
                return `${indentString.repeat(indentLevel)}${_quoteString(value, {
                    doubleQuote
                })}`;
            case 'symbol': {
                let key = Symbol.keyFor(value);

                if (typeof key === 'string') {
                    return `${indentString.repeat(indentLevel)}Symbol.for(${_quoteString(key, {
                        doubleQuote
                    })})`;
                }

                key = value.toString().slice(7, -1);

                if (key) {
                    return `${indentString.repeat(indentLevel)}Symbol(${_quoteString(key, {
                        doubleQuote
                    })})`;
                }

                return `${indentString.repeat(indentLevel)}Symbol()`;
            }
            case 'undefined':
                return `${indentString.repeat(indentLevel)}void null`;
        }
    };

export default _valueToSource;
