import { Attachment } from "@medusajs/framework/types"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { PDF_TEMPLATE_MODULE, PdfTemplate } from "../modules/attachment"
import { builtInPlugins, image, multiVariableText, table } from "@pdfme/schemas"
import { generate } from "@pdfme/generator"

type CreatePdfAttachmentWorkflowInput = {
    filename: string,
    handle: string,
    data: Record<string, any>,
    disposition?: string
}


const retrieveTemplateStep = createStep(
    "retrieve-template",
    async ({ handle }: { handle: string }, { container }) => {
        const pdfTemplateService = container.resolve(PDF_TEMPLATE_MODULE)
        const [template = undefined] = await pdfTemplateService.listPdfTemplates({ handle })
        if (!template) {
            throw new Error(`Attachment template with handle ${handle} not found`)
        }
        return new StepResponse(template)
    }
)

const plugins = {
    ...builtInPlugins,
    Image: image,
    Table: table,
    multiVariableText
}

const generateContentStep = createStep(
    "generate-content",
    async ({ template, data }: { template: PdfTemplate, data: Record<string, any> }) => {
        const base64Content = await generate({
            template: template as any,
            inputs: [data],
            plugins,
        })
        return new StepResponse(base64Content)
    }
)

const createAttachmentStep = createStep(
    "create-attachment",
    async ({ content, filename, disposition }: { content: Uint8Array, filename: string, disposition: string }) => {
        return new StepResponse({
            content: Buffer.from(content).toString("base64"),
            content_type: "application/pdf", // mime type
            filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
            disposition,
        })
    }
)

export const createPdfAttachmentWorkflow = createWorkflow("create-pdf-attachment",
    (input: CreatePdfAttachmentWorkflowInput): WorkflowResponse<Attachment> => {
        const { filename, handle, data, disposition = "attachment" } = input

        const template = retrieveTemplateStep({ handle })
        const content = generateContentStep({ template, data })
        const attachment = createAttachmentStep({ content, filename, disposition })

        return new WorkflowResponse(attachment)
    }
)
