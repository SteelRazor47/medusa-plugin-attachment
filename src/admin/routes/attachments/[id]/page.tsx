import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { Outlet, useParams } from "react-router-dom"
import { AttachmentTemplate } from "../attachment-template-list-table"
import PDFViewer from "./pdf-viewer"
import { Container } from "../../../components/container"
import { Header } from "../../../components/header"
import { PencilSquare } from "@medusajs/icons"
import { SectionRow } from "../../../components/section-row"
import { useTranslation } from "react-i18next"
import PluginI18n from "../../../components/plugin-i18n"
import { TwoColumnPage } from "../../../components/two-column-page"

export default () => {
    const { id } = useParams<{ id: string }>()

    const { data: attachment, isLoading } = useQuery({
        queryFn: () => sdk.client.fetch<AttachmentTemplate>(`/admin/attachments/${id}`, {
            headers: {},
        }),
        queryKey: ["attachment-templates", id],
    })

    const template = attachment?.template
    return (
        <PluginI18n>
            <TwoColumnPage>
                <TwoColumnPage.Main>
                    <Container className="overflow-hidden">
                        {!isLoading && template && <PDFViewer template={template as any} />}
                    </Container>
                </TwoColumnPage.Main>
                <TwoColumnPage.Sidebar>
                    {attachment && <GeneralDetails {...attachment} />}
                    {template && <TemplateDetails {...template} />}
                </TwoColumnPage.Sidebar>
            </TwoColumnPage>
            <Outlet />
        </PluginI18n>
    )
}


const GeneralDetails = (attachment: AttachmentTemplate) => {
    const { t } = useTranslation()

    return (
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
            <SectionRow title={t("handle")} value={attachment?.handle} />
        </Container>
    )
}

const TemplateDetails = (template: AttachmentTemplate["template"]) => {
    const { t } = useTranslation()

    return (
        <Container>
            <Header title={t("template")} actions={[
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
            <SectionRow title={t("width")} value={template.basePdf.width} />
            <SectionRow title={t("height")} value={template.basePdf.height} />
            <SectionRow title={t("topPadding")} value={template.basePdf.padding[0]} />
            <SectionRow title={t("rightPadding")} value={template.basePdf.padding[1]} />
            <SectionRow title={t("bottomPadding")} value={template.basePdf.padding[2]} />
            <SectionRow title={t("leftPadding")} value={template.basePdf.padding[3]} />
        </Container>
    )
}
