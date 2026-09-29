export const dynamic = 'force-dynamic'
import { getSettings } from '@/lib/actions/settings'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const settings = await getSettings()
  return <SettingsClient initialSettings={settings} />
}

