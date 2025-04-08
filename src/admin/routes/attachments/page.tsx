import { defineRouteConfig } from "@medusajs/admin-sdk"
import AttachmentTemplateListTable from "./attachment-template-list-table"
import { SingleColumnLayout } from "../../components/single-column-layout"
import { Outlet } from "react-router-dom"
import PluginI18n from "../../components/plugin-i18n"

const AttachmentsPage = () => {
  return (
    <PluginI18n>
      <SingleColumnLayout>
        <AttachmentTemplateListTable />
      </SingleColumnLayout>
      <Outlet />
    </PluginI18n>
  )
}

export const config = defineRouteConfig({
  label: "Attachment templates",
})

export default AttachmentsPage
