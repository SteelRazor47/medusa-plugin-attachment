import { useMutation, useQuery } from "@tanstack/react-query"
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
import { Input, Text } from "@medusajs/ui"
import React, { useEffect, useMemo, useState } from "react"
import _ from "lodash"
import { FetchError } from "@medusajs/js-sdk"

export default () => {
    const { id } = useParams<{ id: string }>()
    if (!id) return null

    const { data: attachment, isLoading } = useQuery({
        queryFn: () => sdk.client.fetch<AttachmentTemplate>(`/admin/attachments/${id}`, {
            headers: {},
        }).then((res) => { setPreviewData(res.previewData); return res }),
        queryKey: ["attachment-templates", id],
        staleTime: 0
    })

    const [previewData, setPreviewData] = useState<NestedRecord<string, string | string[][]>>({})
    const debouncedPreviewData = useDebounce(previewData, 1000, () => {
        if (!attachment) return
        updatePreviewData({
            id,
            payload: {
                previewData
            }
        })
    })

    const { mutateAsync: updatePreviewData } = useMutation<AttachmentTemplate, FetchError, { id: string, payload: any }>({
        mutationFn: ({ id, payload }) => sdk.client.fetch(`/admin/attachments/${id}`, {
            method: "POST",
            body: payload
        })
    })

    const template = useMemo(() => {
        console.log("attachment", attachment?.template)
        const flatSchemaData = attachment?.template?.schemas.flat(2)
        const data = flatSchemaData?.reduce((acc, schema) => {
            if (!schema.content) return acc

            if (schema.type === "text") {
                // extract all keys of the form {foo.bar.baz} from content
                const regex = /{((?:[A-Za-z0-9-_]\.)*[A-Za-z0-9-_]+)}/g
                const matches = schema.content.match(regex)
                if (matches) {
                    matches.forEach((match) => {
                        const key = match.replace(/[{}]/g, "")
                        _.set(acc, key, "")
                    })
                }
            } else if (schema.type === "table") {
                const table = JSON.parse(schema.content) as string[][]
                if (!schema.readOnly) {
                    acc[schema.name] = table
                } else {
                    table.flat().forEach((cell) => {
                        const regex = /{((?:[A-Za-z0-9-_]\.)*[A-Za-z0-9-_]+)}/g
                        const matches = cell.match(regex)
                        if (matches) {
                            matches.forEach((match) => {
                                const key = match.replace(/[{}]/g, "")
                                _.set(acc, key, "")
                            })
                        }
                    })
                }

            }
            return acc
        }, {} as NestedRecord<string, string | string[][]>)

        if (data)
            setPreviewData(data)

        return attachment?.template
    }, [attachment])

    return (
        <PluginI18n>
            <TwoColumnPage>
                <TwoColumnPage.Main>
                    <Container className="overflow-hidden">
                        {!isLoading && template && <PDFViewer template={template as any} data={debouncedPreviewData} />}
                    </Container>
                </TwoColumnPage.Main>
                <TwoColumnPage.Sidebar>
                    {template && <PreviewData data={previewData} onDataChanged={setPreviewData} />}
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
            <SectionRow title={t("dimensions")} value={`${template.basePdf.width}x${template.basePdf.height}`} />
            <SectionRow title={t("padding")} value={template.basePdf.padding.toString()} />
            {/* <SectionRow title={t("height")} value={template.basePdf.height!} />
            <SectionRow title={t("rightPadding")} value={template.basePdf.padding[1]} />
            <SectionRow title={t("bottomPadding")} value={template.basePdf.padding[2]} />
            <SectionRow title={t("leftPadding")} value={template.basePdf.padding[3]} /> */}
        </Container>
    )
}

export type NestedRecord<K extends keyof any, V> =
    { [P in K]: V | NestedRecord<K, V> }

const PreviewData = ({ data, onDataChanged }: React.PropsWithChildren<{ data: NestedRecord<string, string | string[][]>, onDataChanged: (data: NestedRecord<string, string | string[][]>) => void }>) => {
    const { t } = useTranslation()

    return (
        <Container className="overflow-y-auto h-[50vh]">
            <Header title={t("previewData")} actions={[
                // {
                //     type: "button",
                //     link: {
                //         to: `template`,
                //     },
                //     props: {
                //         children: t("actions.edit"),
                //         variant: "secondary",
                //     },
                // }
            ]} />
            <RenderRows data={data} onDataChanged={onDataChanged} />
        </Container >
    )
}

const RenderRows = ({ data, onDataChanged }: React.PropsWithChildren<{ data: NestedRecord<string, string | string[][]>, onDataChanged: (data: NestedRecord<string, string | string[][]>) => void }>) => {
    return Object.entries(data).map(([key, val]) => {
        if (Array.isArray(val))
            return (
                <SectionRow key={key} title={key} value={
                    val.map((v, i) => (
                        <div key={i} className="flex gap-2">
                            {v.map((vv, j) => (
                                <Input key={j} value={vv} onChange={(e) =>
                                    onDataChanged({
                                        ...data,
                                        [key]: val.map((vv, ii) => ii === i ? vv.map((vvv, iii) => iii === j ? e.target.value : vvv) : vv)
                                    })
                                } />
                            ))}
                        </div>
                    ))
                } />
            )

        if (typeof val === "string")
            return (
                <SectionRow key={key} title={key} value={
                    <Input value={val} onChange={(e) =>
                        onDataChanged({
                            ...data,
                            [key]: e.target.value
                        })
                    }>
                    </Input>
                } />
            )

        return <div key={key} className="text-ui-fg-subtle ps-6 py-4">
            <Text key={key} size="small" weight="plus" leading="compact" >{key}</Text>
            <div className="ps-4">
                <RenderRows data={val} onDataChanged={(newData) => {
                    onDataChanged({
                        ...data,
                        [key]: newData
                    })
                }} />
            </div>
        </div>
    })
}

function useDebounce<T>(value: T, delay: number, onUpdate: () => void): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const [isFirstRender, setIsFirstRender] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
            setIsFirstRender(false);
            if (!isFirstRender)  // Avoid calling onUpdate on the first render
                onUpdate();
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
