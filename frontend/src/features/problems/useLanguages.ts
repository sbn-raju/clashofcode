import { useEffect, useState } from "react"
import { languagesApi, type Language } from "../../lib/api"

let cache: Language[] | null = null

/** Supported languages + starter templates (fetched once per session). */
export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>(cache ?? [])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cache) return
    languagesApi
      .list()
      .then(({ languages }) => {
        cache = languages
        setLanguages(languages)
      })
      .catch(() => setError("Could not load languages."))
  }, [])

  return { languages, error }
}
