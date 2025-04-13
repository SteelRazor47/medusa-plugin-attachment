import { model } from "@medusajs/framework/utils"

const PdfTemplateModel = model.define("attachment-pdf-template", {
    id: model.id({ prefix: "atch" }).primaryKey(),
    handle: model.text().unique(),
    name: model.text(),
    template: model.json(),
    previewData: model.json().default({}),
})

export default PdfTemplateModel
