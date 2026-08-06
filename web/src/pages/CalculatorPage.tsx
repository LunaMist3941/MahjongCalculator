import { useState } from "react";
import { RuleMode } from "../types/Rule";
import RuleSelector from "../components/RuleSelector";
import HandDisplay from "../components/HandDisplay";

function CalculatorPage() {
  const [rule, setRule] = useState<RuleMode>(
    RuleMode.JANTAMA_4
  );

  const [tiles] = useState<string[]>([]);

  return (
    <main>
      <h1>麻雀点数計算</h1>

      <RuleSelector
        value={rule}
        onChange={setRule}
      />

      <HandDisplay tiles={tiles} />

      <button>
        計算
      </button>
    </main>
  );
}

export default CalculatorPage;