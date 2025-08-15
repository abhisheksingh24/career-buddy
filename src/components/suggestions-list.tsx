import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface SuggestionsListProps {
  suggestions: string[];
  skills?: string[];
  disabled?: boolean;
}

export function SuggestionsList({
  suggestions,
  skills = [],
  disabled = false,
}: SuggestionsListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (disabled) {
    return (
      <div className="text-gray-600 italic">
        AI suggestions are currently disabled. Please check your environment configuration.
      </div>
    );
  }

  if (!suggestions.length && !skills.length) {
    return <div className="text-gray-600 italic">No suggestions available.</div>;
  }

  return (
    <div className="space-y-6">
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Suggested Bullet Points</h3>
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 group">
                <div className="flex-1 bg-white rounded-lg border p-3">{suggestion}</div>
                <button
                  onClick={() => copyToClipboard(suggestion, index)}
                  className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy to clipboard"
                >
                  {copiedIndex === index ? (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5 text-gray-600 hover:text-gray-900" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {skills.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Relevant Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
