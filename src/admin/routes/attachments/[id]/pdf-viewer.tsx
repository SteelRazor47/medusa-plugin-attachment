import { useEffect, useRef } from 'react';
import { Viewer } from '@pdfme/ui';
import { Template } from '@pdfme/common';
import { image, builtInPlugins, table, multiVariableText } from '@pdfme/schemas';
import { sdk } from '../../../lib/sdk';
import { useQuery } from '@tanstack/react-query';


const PDFViewer = ({ template }: { template: Template }) => {
    const viewerRef = useRef(null);
    const viewerInstanceRef = useRef<Viewer | null>(null);

    const plugins = {
        ...builtInPlugins,
        Image: image,
        Table: table,
        multiVariableText
    }

    useEffect(() => {
        if (viewerInstanceRef.current) {
            viewerInstanceRef.current.updateTemplate(template);
        }
    }, [template]);

    const { data: order } = useQuery({
        queryFn: async () => (await sdk.admin.order.list({ fields: "+total,+email,*shipping_address" })).orders[0],
        queryKey: ["pdfme-order"]
    })

    useEffect(() => {
        // Only create the designer if it doesn't already exist
        if (viewerRef.current && !viewerInstanceRef.current) {
            // Initialize the Designer
            viewerInstanceRef.current = new Viewer({
                domContainer: viewerRef.current,
                template: template,
                plugins,
                inputs: [{ order }]
            });

            // Clean up on unmount
            return () => {
                if (viewerInstanceRef.current) {
                    viewerInstanceRef.current.destroy();
                    viewerInstanceRef.current = null;
                }
            };
        }
    }, [template, order]);

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
            <div style={{ width: '100%', height: '800px' }} ref={viewerRef} />
        </div>
    );
}

export default PDFViewer;
