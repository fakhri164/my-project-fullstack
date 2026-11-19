
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
      {themes.map((item) => {
        const Icon = item.icon;
        const isActive = theme === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTheme(item.id)}
            title={item.label}
            aria-label={`Pilih tema ${item.label}`}
            className={`flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
              isActive
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            }`}
          >
            <Icon size={17} />
          </button>
        );
      })}
    </div>
  );
}
