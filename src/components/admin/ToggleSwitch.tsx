'use client'

interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

export default function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="toggle-slider" />
    </label>
  )
}
