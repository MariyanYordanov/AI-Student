import { useTranslation } from 'react-i18next';
import { TOPICS_SECTIONS } from '../data/topics';

interface SectionTabsProps {
  selectedSection: string | null;
  onSelectSection: (section: string) => void;
}

export function SectionTabs({ selectedSection, onSelectSection }: SectionTabsProps) {
  const { t } = useTranslation();
  const sections = Object.values(TOPICS_SECTIONS);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {sections.map((section) => (
        <button
          key={section}
          onClick={() => onSelectSection(section)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedSection === section
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t(`topics.sections.${section}`)}
        </button>
      ))}
    </div>
  );
}
