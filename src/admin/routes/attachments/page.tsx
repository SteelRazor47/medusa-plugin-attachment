import { defineRouteConfig } from "@medusajs/admin-sdk"
import AttachmentTemplateListTable from "./attachment-template-list-table"
import { SingleColumnLayout } from "../../components/single-column-layout"
import { Outlet } from "react-router-dom"

const AttachmentsPage = () => {
  return (
    <>
      <SingleColumnLayout>
        <AttachmentTemplateListTable />
      </SingleColumnLayout>
      <Outlet />
    </>
  )
}

export const config = defineRouteConfig({
  label: "Attachment templates",
})

export default AttachmentsPage
