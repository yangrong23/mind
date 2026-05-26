/** Output languages for Content Factory generation (modals + settings). */
export const FACTORY_OUTPUT_LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Chinese (Simplified)", label: "Chinese (Simplified)" },
  { value: "Chinese (Traditional)", label: "Chinese (Traditional)" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "Portuguese (Brazil)", label: "Portuguese (Brazil)" },
  { value: "Arabic", label: "Arabic" },
  { value: "Hindi", label: "Hindi" },
  { value: "Italian", label: "Italian" },
  { value: "Russian", label: "Russian" },
  { value: "Indonesian", label: "Indonesian" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Thai", label: "Thai" },
  { value: "Turkish", label: "Turkish" },
  { value: "Dutch", label: "Dutch" },
  { value: "Polish", label: "Polish" },
] as const

export type FactoryOutputLanguage = (typeof FACTORY_OUTPUT_LANGUAGES)[number]["value"]

export const DEFAULT_FACTORY_OUTPUT_LANGUAGE: FactoryOutputLanguage = "English"
