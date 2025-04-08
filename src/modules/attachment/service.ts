import { MedusaService } from "@medusajs/framework/utils";
import PdfTemplateModel from "./models/template";

class AttachmentModuleService extends MedusaService({ PdfTemplate: PdfTemplateModel }) {}

export default AttachmentModuleService
