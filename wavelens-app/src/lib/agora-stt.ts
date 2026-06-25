/**
 * Agora Real-Time STT + Translation protobuf schema & utilities.
 *
 * The STT agent publishes transcription/translation results as protobuf
 * messages via the RTC Data Stream. This module defines the message schema
 * and provides a decoder.
 *
 * Schema source: https://docs.agora.io/en/real-time-stt/develop/parse-data
 */

import protobuf from 'protobufjs';

/**
 * In-memory protobuf schema matching Agora's SttMessage.proto.
 * This is the minimal set of fields the client needs to decode.
 */
const SttMessageRoot = protobuf.Root.fromJSON({
  nested: {
    Agora: {
      nested: {
        SpeechToText: {
          nested: {
            WordMessage: {
              fields: {
                text: { type: 'string', id: 1 },
                confidence: { type: 'double', id: 2 },
                wordStart: { type: 'int64', id: 3 },
                wordDuration: { type: 'int64', id: 4 },
                isFinal: { type: 'bool', id: 5 },
              },
            },
            TranslationMessage: {
              fields: {
                is_final: { type: 'bool', id: 1 },
                lang: { type: 'string', id: 2 },
                texts: { type: 'string', id: 3, rule: 'repeated' },
              },
            },
            Text: {
              fields: {
                uid: { type: 'int64', id: 4 },
                time: { type: 'int64', id: 6 },
                words: {
                  type: 'WordMessage',
                  id: 10,
                  rule: 'repeated',
                },
                duration_ms: { type: 'int32', id: 12 },
                data_type: { type: 'string', id: 13 },
                trans: {
                  type: 'TranslationMessage',
                  id: 14,
                  rule: 'repeated',
                },
                culture: { type: 'string', id: 15 },
                text_ts: { type: 'int64', id: 16 },
                sentence_id: { type: 'int64', id: 19 },
              },
            },
          },
        },
      },
    },
  },
});

/** Decoded STT transcription word. */
export interface SttWord {
  text: string;
  confidence: number;
  isFinal: boolean;
}

/** Decoded STT translation. */
export interface SttTranslation {
  isFinal: boolean;
  lang: string;
  texts: string[];
}

/** Decoded STT message from the data stream. */
export interface SttMessage {
  uid: number;
  time: number;
  dataType: 'transcribe' | 'translate';
  culture?: string;
  sentenceId?: number;
  textTs?: number;
  words: SttWord[];
  translations: SttTranslation[];
  /** Convenience: joined text of all words. */
  transcript?: string;
}

/**
 * Decode a raw protobuf buffer from an RTC stream-message event
 * into a structured SttMessage.
 */
export function decodeSttMessage(data: Uint8Array): SttMessage | null {
  try {
    if (!data || data.byteLength === 0) return null;

    const TextType = SttMessageRoot.lookupType(
      'Agora.SpeechToText.Text',
    );
    const decoded = TextType.decode(data);

    const raw: Record<string, unknown> = decoded as unknown as Record<
      string,
      unknown
    >;

    const words: SttWord[] = (
      (raw.words as Record<string, unknown>[]) ?? []
    ).map((w) => ({
      text: String(w.text ?? ''),
      confidence: Number(w.confidence ?? 0),
      isFinal: Boolean(w.isFinal ?? false),
    }));

    const translations: SttTranslation[] = (
      (raw.trans as Record<string, unknown>[]) ?? []
    ).map((t) => ({
      isFinal: Boolean(t.is_final ?? false),
      lang: String(t.lang ?? ''),
      texts: Array.isArray(t.texts)
        ? t.texts.map(String)
        : [String(t.texts ?? '')],
    }));

    const transcript = words.map((w) => w.text).join('').trim();

    return {
      uid: Number(raw.uid ?? 0),
      time: Number(raw.time ?? 0),
      dataType: (raw.data_type as 'transcribe' | 'translate') ?? 'transcribe',
      culture: raw.culture as string | undefined,
      sentenceId: raw.sentence_id != null ? Number(raw.sentence_id) : undefined,
      textTs: raw.text_ts != null ? Number(raw.text_ts) : undefined,
      words,
      translations,
      transcript: transcript || undefined,
    };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_WAVELENS_DEBUG_STT === '1') {
      console.debug('[STT] Ignored non-STT protobuf message:', err);
    }
    return null;
  }
}

/**
 * Options for starting the STT Translation agent.
 */
export interface SttTranslationConfig {
  languages: string[];
  sourceLanguage: string;
  targetLanguages: string[];
  maxIdleTime?: number;
}

/** Supported STT languages (subset — full list is in Agora docs). */
export const STT_LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'vi-VN', label: 'Tiếng Việt (Vietnamese)' },
  { value: 'zh-CN', label: '中文 (Chinese Simplified)' },
  { value: 'zh-TW', label: '中文 (Chinese Traditional)' },
  { value: 'ja-JP', label: '日本語 (Japanese)' },
  { value: 'ko-KR', label: '한국어 (Korean)' },
  { value: 'fr-FR', label: 'Français (French)' },
  { value: 'de-DE', label: 'Deutsch (German)' },
  { value: 'es-ES', label: 'Español (Spanish)' },
  { value: 'ar-SA', label: 'العربية (Arabic)' },
  { value: 'id-ID', label: 'Bahasa Indonesia' },
  { value: 'th-TH', label: 'ไทย (Thai)' },
  { value: 'pt-BR', label: 'Português (Brazilian)' },
  { value: 'ru-RU', label: 'Русский (Russian)' },
] as const;
