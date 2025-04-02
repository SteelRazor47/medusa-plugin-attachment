import AttachmentModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

declare module "@medusajs/framework/types" {
    interface ModuleImplementations {
        [ATTACHMENT_MODULE]: AttachmentModuleService;
    }
}

export const ATTACHMENT_MODULE = "attachment"
export default Module(ATTACHMENT_MODULE, { service: AttachmentModuleService })
