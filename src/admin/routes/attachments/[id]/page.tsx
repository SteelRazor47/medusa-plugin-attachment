import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { Outlet, useParams } from "react-router-dom"
import { AttachmentTemplate } from "../attachment-template-list-table"
import PDFViewer from "./pdf-viewer"
import { Container } from "../../../components/container"
import { Header } from "../../../components/header"
import { PencilSquare } from "@medusajs/icons"
import { SectionRow } from "../../../components/section-row"
import { TwoColumnFlippedLayout } from "../../../components/two-column-flipped-layout"
import { useTranslation } from "react-i18next"

export default () => {
    const { id } = useParams<{ id: string }>()
    const { t } = useTranslation()


    const { data: attachment, isLoading } = useQuery({
        queryFn: () => sdk.client.fetch<AttachmentTemplate>(`/admin/attachments/${id}`, {
            headers: {},
        }),
        queryKey: ["attachment-templates", id],
    })

    const template = attachment?.template
    return (
        <>
            <TwoColumnFlippedLayout
                secondCol={
                    <Container>
                        {!isLoading && template && <PDFViewer template={template as any} />}
                    </Container>
                }
                firstCol={
                    <>
                        <Container>
                            <Header title={attachment?.name ?? ""} actions={[
                                {
                                    type: "action-menu",
                                    props: {
                                        groups: [
                                            {
                                                actions: [
                                                    {
                                                        label: t("actions.edit"),
                                                        icon: <PencilSquare />,
                                                        to: `edit`,
                                                    }
                                                ],
                                            }
                                        ],
                                    },
                                }
                            ]} />
                            <SectionRow title="Handle" value={attachment?.handle} />
                        </Container>

                        <Container>
                            <Header title="Template" actions={[
                                {
                                    type: "button",
                                    link: {
                                        to: `template`,
                                    },
                                    props: {
                                        children: t("actions.edit"),
                                        variant: "secondary",
                                    },
                                }
                            ]} />
                            <SectionRow title="Width" value={attachment?.template.basePdf.width} />
                            <SectionRow title="Height" value={attachment?.template.basePdf.height} />
                            <SectionRow title="Top Padding" value={attachment?.template.basePdf.padding[0]} />
                            <SectionRow title="Right Padding" value={attachment?.template.basePdf.padding[1]} />
                            <SectionRow title="Bottom Padding" value={attachment?.template.basePdf.padding[2]} />
                            <SectionRow title="Left Padding" value={attachment?.template.basePdf.padding[3]} />
                        </Container>
                    </>
                }
            />
            <Outlet />
        </>
    )
}
