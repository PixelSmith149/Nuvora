import { SUPPORTED_FX_PAIRS } from "./supportedPairs";

export function isSupportedPair(from: string, to: string): boolean {
	const pair = `${from}-${to}`;
	return SUPPORTED_FX_PAIRS.includes(pair as any);
}
