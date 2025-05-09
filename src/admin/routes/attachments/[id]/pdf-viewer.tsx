import { useEffect, useRef } from 'react';
import { Viewer } from '@pdfme/ui';
import { Template } from '@pdfme/common';
import plugins from '../../../../common/plugins';
import { NestedRecord } from './page';

const PDFViewer = ({ template, data }: { template: Template, data: NestedRecord<string, string | string[][]> }) => {
    const viewerRef = useRef(null);
    const viewerInstanceRef = useRef<Viewer | null>(null);

    useEffect(() => {
        if (viewerInstanceRef.current) {
            viewerInstanceRef.current.updateTemplate(template);
        }
    }, [template]);

    useEffect(() => {
        // Only create the designer if it doesn't already exist
        if (viewerRef.current && !viewerInstanceRef.current) {
            // Initialize the Designer

            viewerInstanceRef.current = new Viewer({
                domContainer: viewerRef.current,
                template: template,
                plugins,
                inputs: [data]
            });

            // Clean up on unmount
            return () => {
                if (viewerInstanceRef.current) {
                    viewerInstanceRef.current.destroy();
                    viewerInstanceRef.current = null;
                }
            };
        }
    }, [template, data]);

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
