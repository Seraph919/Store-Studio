import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import RingSizeGuide from '../components/RingSizeGuide'
import { useStoreSettingsQuery } from '../hooks/useStoreQueries'

export const RingSizeGuidePage: React.FC = () => {
  const navigate = useNavigate()
  const { data: settings, isLoading } = useStoreSettingsQuery()
  if (isLoading) return null
  if (settings?.showRingSizeGuide !== true) return <Navigate to="/shop" replace />

  return (
    <div className="pt-20">
      <RingSizeGuide
        onBackToStore={() => navigate('/shop')}
        storeName={settings?.storeName}
        supportEmail={settings?.email}
      />
    </div>
  )
}

export default RingSizeGuidePage
