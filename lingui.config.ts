import type { LinguiConfig } from "@lingui/conf";
import { formatter } from "@lingui/format-po";

const config: LinguiConfig = {
	locales: [
		"en",
		"de",
		"zh",
		"zh-Hant",
		"ja",
		"ko",
		"es",
		"fr",
		"pt",
		"ru",
	],
	sourceLocale: "en",
	compileNamespace: "es",
	format: formatter({ lineNumbers: false }),
	catalogs: [
		{
			path: "<rootDir>/src/locales/{locale}",
			include: ["src"],
		},
	],
};

export default config;
