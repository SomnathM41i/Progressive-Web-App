type FormFieldValue =
  string | number | boolean | Blob | null | undefined | readonly string[]

export function createRegistrationFormData(values: object): FormData {
  const form = new FormData()

  for (const [key, value] of Object.entries(values as Record<string, FormFieldValue>)) {
    appendField(form, key, value)
  }

  return form
}

function appendField(form: FormData, key: string, value: FormFieldValue): void {
  if (value === null || value === undefined) return

  if (Array.isArray(value)) {
    form.append(key, value.join(', '))
    return
  }

  if (value instanceof Blob) {
    form.append(key, value)
    return
  }

  form.append(key, String(value))
}
