import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['es', 'en'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Disable automatic redirection based on browser Accept-Language header
  localeDetection: false
});