export function TextField({ label, hint, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`}>
      <span className="label">{label}</span>
      <input className={`input ${error ? 'input-error' : ''}`} {...props} />
      {hint ? <span className="hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

export function TextAreaField({ label, hint, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`}>
      <span className="label">{label}</span>
      <textarea className={`textarea ${error ? 'input-error' : ''}`} {...props} />
      {hint ? <span className="hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

export function SelectField({ label, hint, error, options, className = '', ...props }) {
  return (
    <label className={`field ${className}`}>
      <span className="label">{label}</span>
      <select className={`input ${error ? 'input-error' : ''}`} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
