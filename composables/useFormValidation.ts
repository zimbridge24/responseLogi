import { useForm } from 'vee-validate'
import * as yup from 'yup'

// Common validation schemas
export const validationSchemas = {
  // User registration/login
  login: yup.object({
    email: yup.string().email('유효한 이메일을 입력해주세요').required('이메일은 필수입니다'),
    password: yup.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다').required('비밀번호는 필수입니다'),
  }),

  register: yup.object({
    email: yup.string().email('유효한 이메일을 입력해주세요').required('이메일은 필수입니다'),
    password: yup.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다').required('비밀번호는 필수입니다'),
    confirmPassword: yup.string().oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다').required('비밀번호 확인은 필수입니다'),
    name: yup.string().required('이름은 필수입니다'),
    phone: yup.string().matches(/^[0-9-+().\s]+$/, '유효한 전화번호를 입력해주세요'),
    role: yup.string().oneOf(['customer', 'partner'], '유효한 역할을 선택해주세요').required('역할은 필수입니다'),
  }),

  // Request form
  request: yup.object({
    title: yup.string().required('제목은 필수입니다'),
    description: yup.string().required('설명은 필수입니다'),
    category: yup.string().required('카테고리는 필수입니다'),
    budget: yup.number().min(0, '예산은 0 이상이어야 합니다'),
    deadline: yup.date().min(new Date(), '마감일은 오늘 이후여야 합니다'),
    location: yup.string(),
  }),

  // Bid form
  bid: yup.object({
    amount: yup.number().min(0, '금액은 0 이상이어야 합니다').required('금액은 필수입니다'),
    description: yup.string().required('설명은 필수입니다'),
    estimatedDuration: yup.string(),
  }),

  // Chat message
  message: yup.object({
    message: yup.string().required('메시지를 입력해주세요'),
  }),

  // Company form
  company: yup.object({
    name: yup.string().required('회사명은 필수입니다'),
    description: yup.string(),
    website: yup.string().url('유효한 URL을 입력해주세요'),
    phone: yup.string().matches(/^[0-9-+().\s]+$/, '유효한 전화번호를 입력해주세요'),
    email: yup.string().email('유효한 이메일을 입력해주세요'),
    address: yup.string(),
  }),
}

// Composable for form validation
export function useFormValidation(schemaName: keyof typeof validationSchemas) {
  const schema = validationSchemas[schemaName]
  
  const { handleSubmit, errors, defineField, resetForm, setFieldValue, values } = useForm({
    validationSchema: schema,
  })

  return {
    handleSubmit,
    errors,
    defineField,
    resetForm,
    setFieldValue,
    values,
  }
}





