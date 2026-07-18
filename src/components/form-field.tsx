type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  errors?: string[];
  hint?: string;
  defaultValue?: string;
};

// Champ accessible : label lié, erreurs annoncées via aria-describedby.
export const FormField = ({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  errors,
  hint,
  defaultValue,
}: FormFieldProps) => {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy =
    [errors?.length ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="text-red-700">
            {" "}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-zinc-600">
          {hint}
        </p>
      )}
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy}
        className="rounded border border-zinc-300 px-3 py-2 focus:outline-2 focus:outline-emerald-700"
      />
      {errors && errors.length > 0 && (
        // Conteneur unique : l'id référencé par aria-describedby ne doit
        // jamais être dupliqué, même avec plusieurs messages d'erreur.
        <div id={errorId} className="flex flex-col gap-1">
          {errors.map((error) => (
            <p key={error} className="text-sm text-red-700">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
