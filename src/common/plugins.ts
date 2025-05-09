import { GenerateProps, Plugins } from "@pdfme/common"
import { barcodes, builtInPlugins, checkbox, date, dateTime, ellipse, image, line, multiVariableText, radioGroup, rectangle, select, svg, table, time } from "@pdfme/schemas"

const plugins: GenerateProps["plugins"] = {
    ...builtInPlugins,
    ...barcodes,
    Image: image,
    Table: table,
    multiVariableText,
    svg, line, rectangle, ellipse, dateTime, date, time, select, radioGroup, checkbox
}

export default plugins
