import type {
  ParsedStoreDesign,
  StorefrontTemplateId,
  TemplateDesignSnapshot,
} from '../../types/design'

/** The active design remains in config.sections for compatibility with older storefronts. */
export function snapshotTemplate(design: ParsedStoreDesign): TemplateDesignSnapshot {
  return {
    sections: structuredClone(design.config.sections),
    colorMode: design.colorMode,
    paletteId: design.paletteId,
    accentColor: design.accentColor,
    fontPreset: design.fontPreset,
  }
}

/** Preserve the active template before publishing, including edits made since switching. */
export function withSavedActiveTemplate(design: ParsedStoreDesign): ParsedStoreDesign {
  return {
    ...design,
    config: {
      ...design.config,
      templateDrafts: {
        ...design.config.templateDrafts,
        [design.template]: snapshotTemplate(design),
      },
    },
  }
}

/** Switching never mutates a previous template's sections or media. */
export function switchDesignTemplate(
  design: ParsedStoreDesign,
  nextTemplate: StorefrontTemplateId,
): ParsedStoreDesign {
  if (design.template === nextTemplate) return design

  const current = snapshotTemplate(design)
  const saved = {
    ...design.config.templateDrafts,
    [design.template]: current,
  }
  // For a template never used before, start with the current site's content,
  // then let that template evolve independently. Branding remains global.
  const destination = structuredClone(saved[nextTemplate] ?? current)

  return {
    ...design,
    template: nextTemplate,
    colorMode: destination.colorMode,
    paletteId: destination.paletteId,
    accentColor: destination.accentColor,
    fontPreset: destination.fontPreset,
    config: {
      sections: destination.sections,
      templateDrafts: saved,
    },
  }
}
