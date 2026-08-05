import React from 'react'

interface FormField {
  value: any
  error?: string
  touched: boolean
}

interface FormState {
  [key: string]: FormField
}

interface UseFormProps {
  initialValues: Record<string, any>
  onSubmit: (values: Record<string, any>) => void | Promise<void>
  validate?: (values: Record<string, any>) => Record<string, string>
}

export const useForm = ({ initialValues, onSubmit, validate }: UseFormProps) => {
  const [formState, setFormState] = React.useState<FormState>(
    Object.entries(initialValues).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: { value, error: undefined, touched: false },
    }), {})
  )

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const getFieldProps = (fieldName: string) => ({
    value: formState[fieldName]?.value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value } = e.target
      setFormState(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], value, touched: true },
      }))
    },
    onBlur: () => {
      setFormState(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], touched: true },
      }))
    },
    error: formState[fieldName]?.error,
  })

  const getFieldValue = (fieldName: string) => formState[fieldName]?.value || ''

  const setFieldValue = (fieldName: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const values = Object.entries(formState).reduce((acc, [key, field]) => ({
      ...acc,
      [key]: field.value,
    }), {})

    if (validate) {
      const errors = validate(values)
      const hasErrors = Object.keys(errors).length > 0
      
      if (hasErrors) {
        setFormState(prev => Object.entries(prev).reduce((acc, [key, field]) => ({
          ...acc,
          [key]: { ...field, error: errors[key], touched: true },
        }), {}))
        return
      }
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormState(
      Object.entries(initialValues).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: { value, error: undefined, touched: false },
      }), {})
    )
  }

  return {
    formState,
    getFieldProps,
    getFieldValue,
    setFieldValue,
    handleSubmit,
    resetForm,
    isSubmitting,
  }
}
