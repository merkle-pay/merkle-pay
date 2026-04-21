import { i18n } from "@lingui/core";

export const locales = {
	en: "English",
	de: "Deutsch",
	zh: "中文",
	"zh-Hant": "繁體中文",
	ja: "日本語",
	ko: "한국어",
	es: "Español",
	fr: "Français",
	pt: "Português",
	ru: "Русский",
} as const;

export type Locale = keyof typeof locales;
export const defaultLocale: Locale = "en";

export async function activateLocale(locale: Locale) {
	const { messages } = await import(`../locales/${locale}.po`);
	i18n.load(locale, messages);
	i18n.activate(locale);
}
