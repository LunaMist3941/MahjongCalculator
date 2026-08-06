import { RuleMode } from "../types/Rule";

interface RuleSelectorProps {
  value: RuleMode;
  onChange: (mode: RuleMode) => void;
}

function RuleSelector({
  value,
  onChange,
}: RuleSelectorProps) {
  const modes = Object.values(RuleMode);

  return (
    <section>
      <label>
        ルール:
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value as RuleMode)
          }
        >
          {modes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}

export default RuleSelector;