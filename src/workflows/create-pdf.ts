import { Attachment } from "@medusajs/framework/types"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ATTACHMENT_MODULE, PdfTemplate } from "../modules/attachment"
import { generate } from "@pdfme/generator"
import plugins from "../common/plugins"

type CreatePdfAttachmentWorkflowInput = {
    filename: string,
    handle: string,
    data: Record<string, any>,
    disposition?: string
}


const retrieveTemplateStep = createStep(
    "retrieve-template",
    async ({ handle }: { handle: string }, { container }) => {
        const attachmentModule = container.resolve(ATTACHMENT_MODULE)
        const [template = undefined] = await attachmentModule.listPdfTemplates({ handle })
        if (!template) {
            throw new Error(`Attachment template with handle ${handle} not found`)
        }
        return new StepResponse(template)
    }
)

const generateContentStep = createStep(
    "generate-content",
    async ({ template, data }: { template: PdfTemplate, data: Record<string, any> }) => {
        const base64Content = await generate({
            template: template.template as any,
            inputs: [data],
            plugins,
        })
        return new StepResponse(Buffer.from(base64Content).toString("base64"))
    }
)

const createAttachmentStep = createStep(
    "create-attachment",
    ({ content, filename, disposition }: { content: string, filename: string, disposition: string }) => {
        return new StepResponse({
            content,
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
