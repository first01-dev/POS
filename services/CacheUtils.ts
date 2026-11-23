import createCache from '@emotion/cache';

const isBrowser = typeof document !== "undefined";

/**
 * Creates an Emotion cache for styling.
 * @returns The created Emotion cache.
 */
export default function createEmotionCache() {

  let insertionPoint;

  if (isBrowser) {
    const emotionInsertionPoint = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]'
    );
    insertionPoint = emotionInsertionPoint ?? undefined;
  }


  return createCache({ key: 'mui-style', speedy: true, insertionPoint: insertionPoint,prepend:true })
}
