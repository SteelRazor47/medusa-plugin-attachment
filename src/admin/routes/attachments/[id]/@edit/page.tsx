import { useParams } from "react-router-dom"

import { RouteDrawer } from "../../../../components/modals/route-drawer"
import { EditAttachmentForm } from "./edit-attachment-form"
import { useQuery } from "@tanstack/react-query"
import { AttachmentTemplate } from "../../attachment-template-list-table"
import { sdk } from "../../../../lib/sdk"
import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

const AttachmentEdit = () => {
  const { id } = useParams()
  const { t } = useTranslation()

  // const { product, isLoading, isError, error } = useProduct(id!, {
  //   fields: PRODUCT_DETAIL_FIELDS,
  // })
  const { data: attachment, isLoading, isError, error } = useQuery({
    queryFn: () => sdk.client.fetch<AttachmentTemplate>(`/admin/attachments/${id}`, {
      headers: {},

    }),
    queryKey: ["attachment-templates", id],
  })

  if (isError) {
    throw error
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("template")}</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t("edit.description")}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      {!isLoading && attachment && <EditAttachmentForm attachment={attachment} />}
    </RouteDrawer>
  )
}

export default AttachmentEdit
