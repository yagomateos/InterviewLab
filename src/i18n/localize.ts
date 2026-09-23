// Picks the Spanish text for question/option data when the app is in
// Spanish and a translation is available, falling back to English
// otherwise (covers content added without a translation, and any gap in
// the mock/offline data). Separate from translations.ts, which handles
// static UI chrome — this handles bilingual data coming from the API.
import type { Language } from "./translations";

export function localizeQuestionTitle(
  q: { title: string; title_es?: string | null },
  language: Language
): string {
  return language === "es" && q.title_es ? q.title_es : q.title;
}

export function localizeQuestionDescription(
  q: { description: string | null; description_es?: string | null },
  language: Language
): string | null {
  return language === "es" && q.description_es ? q.description_es : q.description;
}

export function localizeOptionText(
  o: { text: string; text_es?: string | null },
  language: Language
): string {
  return language === "es" && o.text_es ? o.text_es : o.text;
}
