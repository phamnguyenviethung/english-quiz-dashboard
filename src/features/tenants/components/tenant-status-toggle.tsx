import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { useUpdateTenant } from "../hooks/use-update-tenant.ts"
import type { Tenant } from "../types.ts"

export function TenantStatusToggle({ tenant }: { tenant: Tenant }) {
  const { setActive, isPending } = useUpdateTenant(tenant.id, {
    successTitle: tenant.isActive ? "Đã tắt tenant" : "Đã bật lại tenant",
  })

  const toggle = (isActive: boolean) => {
    void setActive(isActive).catch(() => {
      // toast đã bắn từ hook
    })
  }

  if (!tenant.isActive) {
    return (
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => toggle(true)}
      >
        <IconPlayerPlay stroke={1.5} data-icon="inline-start" />
        Bật lại
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" disabled={isPending}>
            <IconPlayerPause stroke={1.5} data-icon="inline-start" />
            Tắt tenant
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tắt tenant "{tenant.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Mọi API key của tenant này lập tức ngừng hiệu lực và trả 401. Key
            không bị xoá, bật lại tenant là dùng được ngay.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel render={<Button variant="outline" />}>
            Huỷ
          </AlertDialogCancel>
          <AlertDialogAction
            render={
              <Button variant="destructive" onClick={() => toggle(false)} />
            }
          >
            Tắt tenant
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
