import { RULE_OPTIONS } from "@core/rules";
import type { RuleMode } from "@core/rules";

interface RuleSelectorProps {
  value: RuleMode;
  onChange: (mode: RuleMode) => void;
}

function RuleSelector({ value, onChange }: RuleSelectorProps) {
  return (
    <label className="field">
      <span>ルール</span>
      <select
        aria-label="ルール"
        onChange={(event) => onChange(event.target.value as RuleMode)}
        value={value}
      >
        {RULE_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default RuleSelector;
