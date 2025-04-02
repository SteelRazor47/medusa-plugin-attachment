import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { ATTACHMENT_MODULE, PdfTemplate } from "../../../modules/attachment";

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const attachmentModule = req.scope.resolve(ATTACHMENT_MODULE)

    const [attachments, count] = await attachmentModule.listAndCountPdfTemplates();
    res.json({ attachments, count });
}

export async function POST(
    req: MedusaRequest<PdfTemplate>,
    res: MedusaResponse
): Promise<void> {
    const attachmentModule = req.scope.resolve(ATTACHMENT_MODULE)

    const result = await attachmentModule.createPdfTemplates(req.body);
    res.json(result);
}
