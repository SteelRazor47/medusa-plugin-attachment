import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Designer } from '@pdfme/ui';
import { Template } from '@pdfme/common';
import { image, builtInPlugins, table, multiVariableText } from '@pdfme/schemas';


export interface PDFDesignerRef {
    getTemplate: () => Template;
}

const PDFDesigner = forwardRef<PDFDesignerRef, { template: Template }>(({ template }, ref) => {
    const designerRef = useRef(null);
    const designerInstanceRef = useRef<Designer | null>(null);

    const plugins = {
        ...builtInPlugins,
        Image: image,
        Table: table,
        multiVariableText
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
            <div style={{ width: '100%', height: '800px' }} ref={designerRef} />
            {/* <button onClick={getTemplate}>Get Template</button>
            <div style={{ width: '100%', height: '800px' }} ref={viewerRef} /> */}

        </div>
    );
})

export default PDFDesigner;
