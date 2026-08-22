import { Button, Tabs, useTheme, type UiTheme } from "@core/ui";
import { useState } from "react";
import { useNavigate } from "react-router";
import { DifficultyDialog } from "../components/difficulty-dialog";
import type { Level } from "../util/sudoku-generator";

const THEME_OPTIONS: { value: UiTheme; label: string }[] = [
  { value: "material", label: "Material" },
  { value: "glass", label: "Glass" },
  { value: "neumorphism", label: "Neumorphism" },
  { value: "cupertino", label: "Cupertino" },
  { value: "cyberpunk", label: "Cyberpunk" },
];

export const Menu = () => {
  const navigate = useNavigate();
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSelectDifficulty = (level: Level) => {
    setShowDifficultyDialog(false);
    navigate(`/game?isNew=true&difficulty=${level}`);
  };

  return (
    <div className="flex flex-col justify-center gap-2 min-w-48">
      <Button onClick={() => setShowDifficultyDialog(true)}>New Game</Button>
      <Button variant="secondary" onClick={() => navigate("/game?isNew=false")}>
        Load Game
      </Button>
      <Button variant="secondary" onClick={() => navigate("/leaderboard")}>
        Leaderboard
      </Button>
      <div className="flex flex-col items-center gap-1 mt-2">
        <span className="text-xs font-medium text-gray-600">Theme</span>
        <Tabs items={THEME_OPTIONS} value={theme} onChange={setTheme} />
      </div>
      <DifficultyDialog
        open={showDifficultyDialog}
        onClose={() => setShowDifficultyDialog(false)}
        onSelect={handleSelectDifficulty}
      />
    </div>
  );
};
