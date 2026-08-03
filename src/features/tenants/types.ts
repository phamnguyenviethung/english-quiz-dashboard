import type {
  GetAdminTenants200DataItem,
  GetAdminTenantsByIdKeys200DataItem,
  PostAdminTenantsByIdKeys201Data,
} from "@/apis/model"

export type Tenant = GetAdminTenants200DataItem
export type TenantApiKey = GetAdminTenantsByIdKeys200DataItem
export type IssuedApiKey = PostAdminTenantsByIdKeys201Data

export interface TenantFormValues {
  name: string
  description: string
  scopes: string[]
  allowAllTopics: boolean
  allowAllQuizTypes: boolean
}
