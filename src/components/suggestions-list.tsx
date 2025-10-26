import { useState } from "react";

const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-5 h-5"}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-5 h-5"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

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
