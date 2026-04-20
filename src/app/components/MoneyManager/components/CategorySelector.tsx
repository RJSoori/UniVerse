import { ExpenseCategory, IncomeCategory } from "../MoneyManager/types";
import { CATEGORY_ICONS } from "../../constants/transactionCategories";

interface CategorySelectorProps {
  selectedCategory: ExpenseCategory | IncomeCategory | "";
  onChange: (category: ExpenseCategory | IncomeCategory | "") => void;
  categories: (ExpenseCategory | IncomeCategory)[];
  showEmojis?: boolean;
  className?: string;
}

export function CategorySelector({
  selectedCategory,
  onChange,
  categories,
  showEmojis = true,
  className = "",
}: CategorySelectorProps) {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {categories.map((categoryItem) => {
        const icon = CATEGORY_ICONS[categoryItem] ?? "💳";
        const isSelected = selectedCategory === categoryItem;

        return (
          <button
            key={categoryItem}
            onClick={() => onChange(categoryItem)}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-input hover:border-primary/50"
            }`}
          >
            {showEmojis && <div className="text-xl mb-1">{icon}</div>}
            <div className="text-xs font-medium truncate">{categoryItem}</div>
          </button>
        );
      })}
    </div>
  );
}
