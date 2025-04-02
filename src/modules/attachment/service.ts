import { Attachment, Logger } from "@medusajs/framework/types"
import { MedusaService } from "@medusajs/framework/utils";
import PdfTemplateModel from "./models/template";
import { generate } from "@pdfme/generator"
import { builtInPlugins, image, multiVariableText, table } from "@pdfme/schemas";

type Options = {}

class AttachmentModuleService extends MedusaService({ PdfTemplate: PdfTemplateModel }) {
  protected options: Options
  protected logger: Logger

  constructor({ logger }: { logger: Logger }, options: Options) {
    super(...arguments)
    this.options = options
    this.logger = logger
  }

  async createPdf(
    filename: string,
    handle: string,
    data: Record<string, any>,
    disposition: string = "attachment"
  ): Promise<Attachment> {
    try {
      const [template = undefined] = await this.listPdfTemplates({ handle })
      if (!template) {
        throw new Error(`Attachment template with handle ${handle} not found`)
      }

      const plugins = {
        ...builtInPlugins,
        Image: image,
        Table: table,
        multiVariableText
      }

      const base64Content = await generate({
        template: template.template as any,
        inputs: [data],
        plugins,
      })


      return {
        content: Buffer.from(base64Content).toString("base64"),
        content_type: "application/pdf", // mime type
        filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
        disposition,
      }
    }
    catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}

export default AttachmentModuleService
