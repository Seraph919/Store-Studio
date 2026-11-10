import { Link } from 'react-router-dom'
import { ArrowLeft, Monitor, Tablet, Smartphone, ExternalLink, Loader2 } from 'lucide-react'
import { StoreStudioLogo } from '../../branding/platformBrand'
export type ViewportMode = 'desktop' | 'tablet' | 'mobile'
interface Props {
  storeName: string; viewport: ViewportMode; onViewportChange: (value: ViewportMode) => void
  isDirty: boolean; isSaving: boolean; saveSuccess: boolean; onDiscard: () => void; onPublish: () => void
}
export function EditorTopBar(props: Props) {
  return <header className="studio-topbar">
    <div className="studio-identity">
      <Link to="/seller" className="studio-back"><ArrowLeft size={16} /><span>Dashboard</span></Link>
      <span className="studio-platform"><StoreStudioLogo size={20} showWordmark /></span>
      <div className="studio-store"><strong>{props.storeName}</strong>
        <span role="status">{props.isDirty ? 'Unsaved changes' : props.saveSuccess ? 'Published successfully' : 'Published'}</span>
      </div>
    </div>
    <div className="studio-devices" role="group" aria-label="Preview size">
      {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([mode, Icon]) =>
        <button key={mode} type="button" aria-label={`${mode} preview`} aria-pressed={props.viewport === mode}
          onClick={() => props.onViewportChange(mode)}><Icon size={17} /><span>{mode}</span></button>)}
    </div>
    <div className="studio-actions">
      <button type="button" onClick={props.onDiscard} disabled={!props.isDirty || props.isSaving}>Discard</button>
      <a href="/" target="_blank" rel="noopener noreferrer" aria-label="View live store"><ExternalLink size={16} /><span>View live store</span></a>
      <button type="button" className="studio-publish" onClick={props.onPublish} disabled={!props.isDirty || props.isSaving}>
        {props.isSaving && <Loader2 size={15} className="animate-spin" />}{props.isSaving ? 'Publishing…' : 'Publish changes'}
      </button>
    </div>
  </header>
}
