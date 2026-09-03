import { useEffect, useState } from "react";
import { DEFAULT_LOCAL_YAKU, type LocalYakuDefinition } from "@core/yaku";
import CalculatorPage from "./pages/CalculatorPage";
import HelpPage from "./pages/HelpPage";
import YakuPage from "./pages/YakuPage";

const localYakuStorageKey = "mahjong-calculator.local-yaku";

function isLocalYakuDefinition(value: unknown): value is LocalYakuDefinition {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LocalYakuDefinition>;
  const validCategory = item.category === "通常役" || item.category === "満貫" || item.category === "跳満" || item.category === "倍満" || item.category === "三倍満" || item.category === "数え役満" || item.category === "役満" || item.category === "2倍役満";
  const validValue = item.category === "通常役"
    ? item.yakuman === undefined && item.limit === undefined && typeof item.han === "number" && Number.isInteger(item.han) && item.han >= 1 && item.han <= 13
    : item.category === "満貫"
      ? item.yakuman === undefined && item.limit === "mangan" && item.han === 0
      : item.category === "跳満"
        ? item.yakuman === undefined && item.limit === "haneman" && item.han === 0
        : item.category === "倍満"
          ? item.yakuman === undefined && item.limit === "baiman" && item.han === 0
          : item.category === "三倍満"
            ? item.yakuman === undefined && item.limit === "sanbaiman" && item.han === 0
            : item.category === "数え役満"
              ? item.yakuman === undefined && item.limit === "counted-yakuman" && item.han === 0
              : item.limit === undefined && item.han === 0 && item.yakuman === (item.category === "2倍役満" ? 2 : 1);
  return validCategory && validValue &&
    (item.builtIn === undefined || typeof item.builtIn === "boolean") &&
    typeof item.condition === "string" &&
    (item.exclusive === undefined || typeof item.exclusive === "boolean") &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    Array.isArray(item.rules) && item.rules.every((rule) => typeof rule === "string") &&
    (item.source === undefined || item.source === "initial" || item.source === "standard-local");
}

function App() {
  const [page, setPage] = useState<"calculator" | "help" | "yaku">("calculator");
  const [localYaku, setLocalYaku] = useState<LocalYakuDefinition[]>(() => {
    try {
      const stored = window.localStorage.getItem(localYakuStorageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      const saved = Array.isArray(parsed) ? parsed.filter(isLocalYakuDefinition) : [];
      const defaultsById = new Map(DEFAULT_LOCAL_YAKU.map((yaku) => [yaku.id, yaku]));
      const savedWithMigratedDefaults = saved.map((yaku) => {
        const defaultYaku = defaultsById.get(yaku.id);
        return defaultYaku ? { ...defaultYaku } : yaku;
      });
      const missingDefaults = DEFAULT_LOCAL_YAKU.filter((defaultYaku) => !savedWithMigratedDefaults.some((yaku) => yaku.id === defaultYaku.id));
      return [...missingDefaults, ...savedWithMigratedDefaults];
    } catch {
      return [...DEFAULT_LOCAL_YAKU];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(localYakuStorageKey, JSON.stringify(localYaku));
    } catch {
      // Storage is optional; the current session can still use the registered roles.
    }
  }, [localYaku]);

  const addLocalYaku = (yaku: LocalYakuDefinition) => {
    setLocalYaku((current) => [...current, yaku]);
  };

  const removeLocalYaku = (id: string) => {
    setLocalYaku((current) => current.filter((yaku) => yaku.id !== id || yaku.builtIn));
  };

  return (
    <>
      <div aria-hidden={page !== "calculator"} className={page === "calculator" ? "page-container" : "page-container is-hidden"}>
        <CalculatorPage localYaku={localYaku} onOpenHelp={() => setPage("help")} onOpenYaku={() => setPage("yaku")} />
      </div>
      {page === "help" && <HelpPage onBack={() => setPage("calculator")} />}
      {page === "yaku" && (
        <YakuPage
          localYaku={localYaku}
          onAddLocalYaku={addLocalYaku}
          onBack={() => setPage("calculator")}
          onRemoveLocalYaku={removeLocalYaku}
        />
      )}
    </>
  );
}

export default App;
