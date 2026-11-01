/**
 * Sampling/length parameters for chat completions.
 *
 * o-series and gpt-5 models reject `max_tokens` (they need
 * `max_completion_tokens`) and reject any non-default `temperature`.
 * They also spend completion tokens on hidden reasoning, so the limit gets
 * headroom or short answers would come back empty.
 */
const REASONING_MODEL = /^(o\d|gpt-5)/i;
const REASONING_HEADROOM = 2000;

export function isReasoningModel(model: string): boolean {
  return REASONING_MODEL.test(model);
}

export function completionParams(
  model: string,
  opts: { maxTokens: number; temperature: number },
): { max_tokens: number; temperature: number } | { max_completion_tokens: number } {
  if (isReasoningModel(model)) {
    return { max_completion_tokens: opts.maxTokens + REASONING_HEADROOM };
  }
  return { max_tokens: opts.maxTokens, temperature: opts.temperature };
}
