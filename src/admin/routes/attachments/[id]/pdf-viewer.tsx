import { useEffect, useRef } from 'react';
import { Viewer } from '@pdfme/ui';
import { Template } from '@pdfme/common';
import { image, builtInPlugins, table, multiVariableText } from '@pdfme/schemas';
import { sdk } from '../../../lib/sdk';
import { useQuery } from '@tanstack/react-query';
import { NestedRecord } from './page';

const DEFAULT_PROPERTIES = [
    "id",
    "status",
    "created_at",
    "canceled_at",
    "email",
    "display_id",
    "currency_code",
    "metadata",
    // --- TOTALS ---
    "total",
    "item_total",
    "shipping_subtotal",
    "subtotal",
    "discount_total",
    "discount_subtotal",
    "shipping_total",
    "shipping_tax_total",
    "tax_total",
    "refundable_total",
    "order_change",
]

const DEFAULT_RELATIONS = [
    "*customer",
    "*items", // -> we get LineItem here with added `quantity` and `detail` which is actually an OrderItem (which is a parent object to LineItem in the DB)
    "*items.variant",
    "*items.variant.product",
    "*items.variant.options",
    "+items.variant.manage_inventory",
    "*items.variant.inventory_items.inventory",
    "+items.variant.inventory_items.required_quantity",
    "+summary",
    "*shipping_address",
    "*billing_address",
    "*sales_channel",
    "*promotion",
    "*shipping_methods",
    "*fulfillments",
    "+fulfillments.shipping_option.service_zone.fulfillment_set.type",
    "*fulfillments.items",
    "*fulfillments.labels",
    "*fulfillments.labels",
    "*payment_collections",
    "*payment_collections.payments",
    "*payment_collections.payments.refunds",
    "*payment_collections.payments.refunds.refund_reason",
    "region.automatic_taxes",
]

const DEFAULT_FIELDS = `${DEFAULT_PROPERTIES.join(",")},${DEFAULT_RELATIONS.join(",")}`

const PDFViewer = ({ template, data }: { template: Template, data: NestedRecord<string, string | string[][]> }) => {
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
