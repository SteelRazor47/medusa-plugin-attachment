import $schema from "./$schema";

export default {
    "attachmentTemplates": "Attachment templates",
    "basePdf": "Base PDF",
    "topPadding": "Top padding",
    "rightPadding": "Right padding",
    "bottomPadding": "Bottom padding",
    "leftPadding": "Left padding",
    "width": "Width",
    "height": "Height",
    "handle": "Handle",
    "name": "Name",
    "designer": "Designer",
    "template": "Template",
    "delete": {
      "confirmation": "You are about to delete the template {{name}}. This action cannot be undone.",
      "successToast": "Template {{name}} was successfully deleted."
    },
    "edit": {
      "description": "Edit the pdf template."
    },
    "previewData": "Preview data"
} as const satisfies $schema
