import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ATTACHMENT_MODULE, PdfTemplate } from "../../../../modules/attachment";

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const attachmentModule = req.scope.resolve(ATTACHMENT_MODULE)

    const attachment = await attachmentModule.retrievePdfTemplate(req.params.id);
    res.json(attachment);
}

export async function POST(
    req: MedusaRequest<PdfTemplate>,
    res: MedusaResponse
): Promise<void> {
    const attachmentModule = req.scope.resolve(ATTACHMENT_MODULE)

    const attachment = await attachmentModule.updatePdfTemplates({ ...req.body, id: req.params.id });
    res.json(attachment);
}

export async function DELETE(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const attachmentModule = req.scope.resolve(ATTACHMENT_MODULE)

    await attachmentModule.deletePdfTemplates(req.params.id)
    res.json({ success: true })
}
