import { InferTypeOf } from "@medusajs/framework/types"
import { model } from "@medusajs/framework/utils"

const PdfTemplateModel = model.define("attachment-pdf-template", {
    id: model.id({ prefix: "atch" }).primaryKey(),
    handle: model.text().unique(),
    name: model.text(),
    template: model.json(),
    pdfmeVersion: model.text(),
})

export default PdfTemplateModel
