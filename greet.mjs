const GREETINGS = {
  en: (name) => `Hello, ${name}!`,
  es: (name) => `¡Hola, ${name}!`,
};

const DEFAULT_LOCALE = 'en';

export function greet(name = 'world', locale = DEFAULT_LOCALE) {
  const format = Object.hasOwn(GREETINGS, locale)
    ? GREETINGS[locale]
    : GREETINGS[DEFAULT_LOCALE];
  return format(name);
}
