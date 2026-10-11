# Greeting API

The `greet` function builds a localized greeting. It has no dependencies and
uses only Node's standard library.

## Import

```ts
import { greet } from './greet.ts';
```

## Signature

```ts
greet(name = 'world', locale = 'en');
```

- `name` *(string, optional)* — the person or thing to greet. Defaults to
  `'world'`.
- `locale` *(string, optional)* — the language tag for the greeting. Supported
  values are `'en'` (English) and `'es'` (Spanish). Defaults to `'en'`.

Returns the greeting as a `string`. Any unknown or unsupported `locale` falls
back to English, so existing callers that pass only `name` keep working.

## Supported locales

| Locale | Greeting                |
| ------ | ----------------------- |
| `en`   | `Hello, <name>!`        |
| `es`   | `¡Hola, <name>!`        |

## Examples

Default English greeting:

```ts
greet();            // 'Hello, world!'
greet('Shurik');    // 'Hello, Shurik!'
```

Explicit English locale:

```ts
greet('Shurik', 'en'); // 'Hello, Shurik!'
```

Spanish locale:

```ts
greet('Shurik', 'es'); // '¡Hola, Shurik!'
greet('Mundo', 'es');  // '¡Hola, Mundo!'
```

Fallback for an unsupported locale:

```ts
greet('Shurik', 'fr');       // 'Hello, Shurik!'
greet('Shurik', 'unknown');  // 'Hello, Shurik!'
```

## Tests

```sh
node --test *.test.ts
```
