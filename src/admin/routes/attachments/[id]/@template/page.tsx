import { useParams } from "react-router-dom"

import { EditTemplateForm } from "./edit-template-form"
import { useQuery } from "@tanstack/react-query"
import { AttachmentTemplate } from "../../attachment-template-list-table"
import { sdk } from "../../../../lib/sdk"
import { RouteFocusModal } from "../../../../components/modals/route-focus-modal"

const AttachmentEdit = () => {
  const { id } = useParams()

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
    <RouteFocusModal>
      {!isLoading && attachment && <EditTemplateForm attachment={attachment} />}
    </RouteFocusModal>
  )
}

export default AttachmentEdit
