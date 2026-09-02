export const RuleMode = {
  JANTAMA_4: "jantama-4",
  JANTAMA_3: "jantama-3",
  STANDARD_4: "standard-4",
  STANDARD_3: "standard-3",
} as const;

export type RuleMode = (typeof RuleMode)[keyof typeof RuleMode];

export interface RuleConfig {
  id: RuleMode;
  label: string;
  supportsKitaNuki: boolean;
  usesReducedManzu: boolean;
  playerCount: 3 | 4;
}

export const RULE_OPTIONS: readonly RuleConfig[] = [
  { id: RuleMode.JANTAMA_4, label: "雀魂四麻", playerCount: 4, supportsKitaNuki: false, usesReducedManzu: false },
  { id: RuleMode.JANTAMA_3, label: "雀魂三麻", playerCount: 3, supportsKitaNuki: true, usesReducedManzu: true },
  { id: RuleMode.STANDARD_4, label: "一般四麻", playerCount: 4, supportsKitaNuki: false, usesReducedManzu: false },
  { id: RuleMode.STANDARD_3, label: "一般三麻", playerCount: 3, supportsKitaNuki: true, usesReducedManzu: true },
];

export function getRuleConfig(rule: RuleMode): RuleConfig {
  return RULE_OPTIONS.find((option) => option.id === rule) ?? RULE_OPTIONS[0];
}
