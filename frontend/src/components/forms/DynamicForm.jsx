// Fn 6.5 — Dynamic Rendering, Recursive Components, Dynamic Zod Schema Generation
// Builds UI + validation schema entirely from a JSON schema definition
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ---- Zod schema builder from field definitions (Fn 6.5) ----
function buildZodSchema(fields) {
  const shape = {}
  for (const field of fields) {
    if (field.type === 'group' && field.fields) {
      shape[field.name] = buildZodSchema(field.fields) // recursive
      } else {
        // default to string schema
        let schema = z.string()

        // Prefer validation rules object when present (follow Function 6.5 instruction)
        const vr = field.validation_rules ?? {}

        // numeric fields: coerce and apply numeric min/max
        if (field.type === 'number') {
          schema = z.coerce.number()
          // If the field is conditionally displayed (show_if), treat as optional
          if (field.show_if || !('required' in vr ? vr.required : field.required)) schema = schema.optional()
          if (typeof vr.min === 'number') schema = schema.min(vr.min, `Min ${vr.min}`)
          if (typeof vr.max === 'number') schema = schema.max(vr.max, `Max ${vr.max}`)
          shape[field.name] = schema
          continue
        }

        // string rules (read from validation_rules when present)
        // If the field is conditionally displayed (show_if), treat it as not required
        const required = field.show_if ? false : ('required' in vr ? vr.required : field.required)
        const minLength = 'minLength' in vr ? vr.minLength : field.minLength
        const maxLength = 'maxLength' in vr ? vr.maxLength : field.maxLength
        const pattern = 'pattern' in vr ? vr.pattern : field.pattern
        const patternMessage = 'patternMessage' in vr ? vr.patternMessage : field.patternMessage

        if (required)              schema = schema.min(1, `${field.label} is required`)
        if (typeof minLength === 'number')             schema = schema.min(minLength, `Min ${minLength} chars`)
        if (typeof maxLength === 'number')             schema = schema.max(maxLength, `Max ${maxLength} chars`)
        if (pattern)               schema = schema.regex(new RegExp(pattern), patternMessage ?? 'Invalid format')
        if (!required)             schema = schema.optional()
        shape[field.name] = schema
      }
  }
  return z.object(shape)
}

// ---- Recursive field renderer (Fn 6.5) ----
function FieldRenderer({ field, register, errors, depth = 0, watch }) {
  const indent = { marginLeft: `${depth * 12}px` }

  // Conditional display support: show_if: { field: 'role', equals: 'admin' }
  if (field.show_if && typeof field.show_if === 'object' && typeof watch === 'function') {
    const target = watch(field.show_if.field)
    if (field.show_if.equals !== undefined && target !== field.show_if.equals) {
      return null
    }
    if (field.show_if.notEquals !== undefined && target === field.show_if.notEquals) {
      return null
    }
  }
  if (field.type === 'group') {
    return (
      <div style={indent} className="space-y-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
        <p className="text-xs font-semibold text-mhw-gold uppercase tracking-wider">
          {field.label}
        </p>
        {field.fields?.map((child) => (
          <FieldRenderer
            key={`${field.name}.${child.name}`}
            field={{ ...child, name: `${field.name}.${child.name}` }}
            register={register}
            errors={errors}
            watch={watch}
            depth={depth + 1}
          />
        ))}
      </div>
    )
  }

  const error = field.name.split('.').reduce((e, k) => e?.[k], errors)

  return (
    <div style={indent} className="space-y-1">
      <label className="text-xs text-gray-300">
        {field.label}
        {field.required && <span className="text-mhw-accent ml-0.5">*</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea {...register(field.name)} rows={field.rows ?? 3}
          placeholder={field.placeholder} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm resize-none text-sm" />
      ) : field.type === 'select' ? (
        <select {...register(field.name)} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm text-sm">
          <option value="">— Select —</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-mhw-dark">{opt.label}</option>
          ))}
        </select>
      ) : (
        <input {...register(field.name)} type={field.type ?? 'text'}
          placeholder={field.placeholder} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm text-sm" />
      )}

      {error && <p className="text-xs text-mhw-accent">{error.message}</p>}
    </div>
  )
}

// ---- Main DynamicForm ----
/**
 * @param {Array}    schema   - JSON field definitions
 * @param {Function} onSubmit - called with validated form data
 * @param {string}   [title]
 */
export default function DynamicForm({ schema = [], onSubmit, title }) {
  const zodSchema = useMemo(() => {
    const s = buildZodSchema(schema)
    // expose for testing/debug: log dynamic schema whenever it changes
    // eslint-disable-next-line no-console
    console.log('dynamicSchema', s)
    return s
  }, [schema])

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(zodSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit, (errs) => { console.log('validationErrors', errs) })} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 space-y-4">
      {title && <h3 className="font-bold text-mhw-gold">{title}</h3>}

      {Object.keys(errors || {}).length > 0 && (
        <div className="text-xs text-mhw-accent">
          Please fix {Object.keys(errors).length} validation error(s). Check the fields below.
        </div>
      )}

      {schema.map((field) => (
        <FieldRenderer key={field.name} field={field} register={register} errors={errors} watch={watch} />
      ))}

      <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full">
        {isSubmitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}
