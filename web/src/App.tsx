import { useEffect, useState } from "react";
import type { LocalYakuDefinition } from "@core/yaku";
import CalculatorPage from "./pages/CalculatorPage";
import HelpPage from "./pages/HelpPage";
import YakuPage from "./pages/YakuPage";

const localYakuStorageKey = "mahjong-calculator.local-yaku";

function isLocalYakuDefinition(value: unknown): value is LocalYakuDefinition {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LocalYakuDefinition>;
  return (item.category === "通常役" || item.category === "役満") &&
    typeof item.condition === "string" &&
    typeof item.han === "number" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    Array.isArray(item.rules) && item.rules.every((rule) => typeof rule === "string");
}

function App() {
  const [page, setPage] = useState<"calculator" | "help" | "yaku">("calculator");
  const [localYaku, setLocalYaku] = useState<LocalYakuDefinition[]>(() => {
    try {
      const stored = window.localStorage.getItem(localYakuStorageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter(isLocalYakuDefinition) : [];
    } catch {
      return [];
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
    setLocalYaku((current) => current.filter((yaku) => yaku.id !== id));
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
