import { TOPICS_SECTIONS } from '../data/topics';

interface SectionTabsProps {
  selectedSection: string | null;
  onSelectSection: (section: string) => void;
  iconMap: Record<string, string>; // section -> svg icon path
}

export function SectionTabs({ selectedSection, onSelectSection, iconMap }: SectionTabsProps) {
  const sections = Object.values(TOPICS_SECTIONS);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {sections.map((section) => (
        <button
          key={section}
          onClick={() => onSelectSection(section)}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            selectedSection === section
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {iconMap[section] && (
            <img src={iconMap[section]} alt={section} className="w-5 h-5" />
          )}
          {section}
        </button>
      ))}
    </div>
  );
}
