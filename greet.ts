const GREETINGS: Record<string, (name: string) => string> = {
  en: (name) => `Hello, ${name}!`,
  es: (name) => `¡Hola, ${name}!`,
};

const DEFAULT_LOCALE = 'en';

export function greet(name: string = 'world', locale: string = DEFAULT_LOCALE): string {
  const format = Object.hasOwn(GREETINGS, locale)
    ? GREETINGS[locale]
    : GREETINGS[DEFAULT_LOCALE];
  return format(name);
}
