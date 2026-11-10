import { useCallback, useState } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router-dom'
import { parseStoreDesign, useUpdateStoreDesignMutation } from '../../services/storeApi'
import type { ParsedStoreDesign } from '../../types/design'
import { withSavedActiveTemplate } from './templateDrafts'

const signature = ({ template, colorMode, paletteId, accentColor, fontPreset, config, branding }: ParsedStoreDesign) =>
  JSON.stringify({ template, colorMode, paletteId, accentColor, fontPreset, config, branding })

export function useDesignDraft(initial: ParsedStoreDesign) {
  // The session owns its snapshot. Background query refetches never replace it.
  const [published, setPublished] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const mutation = useUpdateStoreDesignMutation()
  const dirty = signature(draft) !== signature(published)
  const blocker = useBlocker(dirty)
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => {
    if (dirty) { event.preventDefault(); event.returnValue = '' }
  }, [dirty]))
  const publish = () => {
    if (!dirty || mutation.isPending) return
    const submitted = withSavedActiveTemplate(draft)
    mutation.mutate({ template: submitted.template, colorMode: submitted.colorMode,
      paletteId: submitted.paletteId, accentColor: submitted.accentColor, fontPreset: submitted.fontPreset,
      branding: submitted.branding, designConfig: JSON.stringify(submitted.config) }, {
      onSuccess: response => {
        const saved = parseStoreDesign(response)
        setPublished(saved)
        // Edits made while the request was running remain an unpublished draft.
        setDraft(current => signature(current) === signature(draft) ? saved : current)
      },
    })
  }
  const discard = () => { setDraft(published); mutation.reset() }
  return { draft, setDraft, dirty, blocker, publish, discard, mutation }
}
