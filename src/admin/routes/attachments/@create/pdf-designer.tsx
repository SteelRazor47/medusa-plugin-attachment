import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Designer } from '@pdfme/ui';
import { Template } from '@pdfme/common';
import { image, builtInPlugins, table, multiVariableText, barcodes, checkbox, date, dateTime, ellipse, line, radioGroup, rectangle, select, svg, time } from '@pdfme/schemas';
import { Input } from '@medusajs/ui';


export interface PDFDesignerRef {
    getTemplate: () => Template;
}

type PDFDesignerProps = { template: Template, onTemplateChanged?: (template: Template) => void }
const PDFDesigner = forwardRef<PDFDesignerRef, PDFDesignerProps>(({ template, onTemplateChanged }, ref) => {
    const designerRef = useRef(null);
    const designerInstanceRef = useRef<Designer | null>(null);

    const plugins = {
        ...builtInPlugins,
        ...barcodes,
        Image: image,
        Table: table,
        multiVariableText,
        svg, line, rectangle, ellipse, dateTime, date, time, select, radioGroup, checkbox
    }

    useImperativeHandle(ref, () => ({
        getTemplate: () => {
            return designerInstanceRef.current?.getTemplate() || template;
        }
    }));

    useEffect(() => {
        if (designerInstanceRef.current) {
            designerInstanceRef.current.updateTemplate(template);
        }
    }, [template]);

    useEffect(() => {
        // Only create the designer if it doesn't already exist
        if (designerRef.current && !designerInstanceRef.current) {
            // Initialize the Designer
            designerInstanceRef.current = new Designer({
                domContainer: designerRef.current,
                template: template,
                plugins
            });

            // Clean up on unmount
            return () => {
                if (designerInstanceRef.current) {
                    designerInstanceRef.current.destroy();
                    designerInstanceRef.current = null;
                }
            };
        }
    }, []);  // Empty dependency array to run only once

    // const { data: order, isLoading } = useQuery({
    //     queryFn: async () => (await sdk.admin.order.list()).orders[0],
    //     queryKey: ["pdfme-order"]
    // })

    // useEffect(() => {
    //     // Only create the designer if it doesn't already exist
    //     if (viewerRef.current && !viewerInstanceRef.current) {
    //         // Initialize the Designer
    //         console.log(order)
    //         viewerInstanceRef.current = new Viewer({
    //             domContainer: viewerRef.current,
    //             template: template,
    //             plugins,
    //             inputs: [{ order }],
    //         });

    //         // Clean up on unmount
    //         return () => {
    //             if (viewerInstanceRef.current) {
    //                 viewerInstanceRef.current.destroy();
    //                 viewerInstanceRef.current = null;
    //             }
    //         };
    //     }
    // }, [template, order]);

    // // Function to get the current template
    // const getTemplate = () => {
    //     if (designerInstanceRef.current) {
    //         const currentTemplate = designerInstanceRef.current.getTemplate();
    //         console.log(currentTemplate);
    //         setTemplate(currentTemplate);
    //     }
    // };

    return (
        <div>
            <Input type='file' accept='application/json' onChange={async (e) => {
                if (e.target.files?.length != 1) return;
                const template = await loadTemplateFromFile(e.target.files[0])
                onTemplateChanged?.(template)
            }} />
            <div style={{ width: '100%', height: '800px' }} ref={designerRef} />
            {/* <button onClick={getTemplate}>Get Template</button>
            <div style={{ width: '100%', height: '800px' }} ref={viewerRef} /> */}

        </div>
    );
})

export default PDFDesigner;


const loadTemplateFromFile = (path: File) => {
    return new Promise<Template>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target?.result;
            if (fileContent) {
                try {
                    const template = JSON.parse(fileContent as string);
                    resolve(template as Template)
                } catch (error) {
                    console.error("Error parsing template JSON from file:", error);
                }
            }
        };
        reader.readAsText(path);
    })
}
