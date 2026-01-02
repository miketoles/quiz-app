interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`
            w-11 h-6 rounded-full transition-colors duration-200
            ${checked ? 'bg-primary' : 'bg-white/20'}
          `}
        />
        <div
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
            transition-transform duration-200 ease-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </div>
      <div className="flex-1">
        <div className="text-white font-medium">{label}</div>
        {description && (
          <div className="text-white/60 text-sm mt-0.5">{description}</div>
        )}
      </div>
    </label>
  )
}
