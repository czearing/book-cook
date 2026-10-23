import { useState } from "react";
import { PaintBrushIcon, ForkKnifeIcon } from "@phosphor-icons/react";

import { Section, SettingItem } from "./FlatSection";
import styles from "./Settings.module.css";
import { useTheme } from "../Theme/ThemeProvider";

export function PreferenceSections() {
  const { theme, setTheme } = useTheme();
  const [defaultServings, setDefaultServings] = useState(4);
  const [measurementUnit, setMeasurementUnit] = useState("us");

  return (
    <>
      <Section
        value="appearance"
        title="Appearance"
        icon={<PaintBrushIcon size={18} />}
      >
        <SettingItem label="Theme" description="Choose the application theme.">
          <div className={styles.radioGroup}>
            {(["light", "dark", "system"] as const).map((value) => (
              <button
                key={value}
                className={`${styles.radioBtn} ${theme === value ? styles.radioBtnActive : ""}`}
                onClick={() => setTheme?.(value)}
                aria-pressed={theme === value}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </SettingItem>
      </Section>
      <Section
        value="recipe-preferences"
        title="Recipe Preferences"
        icon={<ForkKnifeIcon size={18} />}
      >
        <SettingItem
          label="Default Measurement System"
          description="Choose your preferred measurement system for recipes."
        >
          <select
            aria-label="Default Measurement System"
            className={styles.select}
            value={measurementUnit}
            onChange={(event) => setMeasurementUnit(event.target.value)}
          >
            <option value="us">US Customary (cups, oz)</option>
            <option value="metric">Metric (g, ml)</option>
            <option value="both">Show Both</option>
          </select>
        </SettingItem>
        <SettingItem
          label="Default Servings"
          description="Default number of servings for new recipes."
        >
          <div className={styles.sliderRow}>
            <input
              aria-label="Default Servings"
              type="range"
              min={1}
              max={12}
              step={1}
              value={defaultServings}
              onChange={(event) =>
                setDefaultServings(Number(event.target.value))
              }
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{defaultServings}</span>
          </div>
        </SettingItem>
      </Section>
    </>
  );
}
