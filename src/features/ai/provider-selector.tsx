import { useSettingsStore } from '../../stores/settings-store';
import { Select } from '../../components/ui/select';

export function ProviderSelector() {
  const { aiProvider, setAIProvider } = useSettingsStore();

  return (
    <Select
      value={aiProvider}
      onChange={(e) => setAIProvider(e.target.value)}
      className="w-40"
    >
      <option value="openai">OpenAI</option>
      <option value="anthropic">Anthropic</option>
      <option value="gemini">Google Gemini</option>
      <option value="ollama">Ollama</option>
    </Select>
  );
}
