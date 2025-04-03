import { zodResolver } from "@hookform/resolvers/zod"
import {
    Alert,
    Button,
    Container,
    Heading,
    Input,
} from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as zod from "zod"
import { Form } from "../../../../components/form"
import { RouteFocusModal } from "../../../../components/modals/route-focus-modal"
import { KeyboundForm } from "../../../../components/utilities/keybound-form"
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../../../lib/sdk"
import { FetchError } from "@medusajs/js-sdk"
import { useRef } from "react"
import { useRouteModal } from "../../../../components/modals/route-modal-provider/use-route-modal"
import { AttachmentTemplate } from "../../attachment-template-list-table"
import PDFDesigner, { PDFDesignerRef } from "../../@create/pdf-designer"

const EditTemplateSchema = zod.object({
    template: zod.object({
        schemas: zod.array(zod.any()),
        basePdf: zod.object({
            padding: zod.tuple([
                zod.number(),
                zod.number(),
                zod.number(),
                zod.number(),
            ]),
            width: zod.number(),
            height: zod.number(),
        }),
    }),
})

const isFetchError = (error: any): error is FetchError => {
    return error instanceof FetchError
}

export const EditTemplateForm = ({ attachment }: { attachment: AttachmentTemplate }) => {
    const { t } = useTranslation()
    const { handleSuccess } = useRouteModal()

    const designerRef = useRef<PDFDesignerRef>(null)

    const form = useForm<zod.infer<typeof EditTemplateSchema>>({
        defaultValues: {
            template: attachment.template,
        },
        resolver: zodResolver(EditTemplateSchema),
    })

    const { mutateAsync, isPending } = useEditTemplate()

    const handleSubmit = form.handleSubmit(async (values) => {
        try {
            if (designerRef.current) {
                const template = designerRef.current.getTemplate()
                values.template.schemas = template.schemas
            }
            await mutateAsync({ payload: values, id: attachment.id }, {
                onSuccess: () => {
                    handleSuccess()
                },
            })
            form.reset()
        } catch (error) {
            if (isFetchError(error) && error.status === 400) {
                form.setError("root", {
                    type: "manual",
                    message: error.message,
                })
                return
            }
        }
    })

    const { template } = form.watch()

    return (
        <RouteFocusModal.Form form={form}>
            <KeyboundForm
                onSubmit={handleSubmit}
                className="flex h-full flex-col overflow-hidden"
            >
                <RouteFocusModal.Header />
                <RouteFocusModal.Body className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex flex-1 flex-col items-center overflow-y-auto">
                        <div className="flex w-full flex-col gap-y-4 px-2 py-16">
                            {form.formState.errors.root && (
                                <Alert
                                    variant="error"
                                    dismissible={false}
                                    className="text-balance"
                                >
                                    {form.formState.errors.root.message}
                                </Alert>
                            )}

                            <div className="flex flex-col gap-y-4">
                                <Heading level="h2">Base pdf</Heading>
                                <div className="grid grid-cols-6 gap-4">

                                    <Form.Field
                                        control={form.control}
                                        name="template.basePdf.padding.0"
                                        render={({ field: { onChange, ...field } }) => {
                                            return (
                                                <Form.Item>
                                                    <Form.Label>Top padding</Form.Label>
                                                    <Form.Control>
                                                        <Input
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (value === "") {
                                                                    onChange(null)
                                                                } else {
                                                                    onChange(parseFloat(value))
                                                                }
                                                            }}
                                                            {...field} />
                                                    </Form.Control>
                                                    <Form.ErrorMessage />
                                                </Form.Item>
                                            )
                                        }}
                                    />
                                    <Form.Field
                                        control={form.control}
                                        name="template.basePdf.padding.1"
                                        render={({ field: { onChange, ...field } }) => {
                                            return (
                                                <Form.Item>
                                                    <Form.Label>Right padding</Form.Label>
                                                    <Form.Control>
                                                        <Input
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (value === "") {
                                                                    onChange(null)
                                                                } else {
                                                                    onChange(parseFloat(value))
                                                                }
                                                            }}
                                                            {...field} />
                                                    </Form.Control>
                                                    <Form.ErrorMessage />
                                                </Form.Item>
                                            )
                                        }}
                                    />
                                    <Form.Field
                                        control={form.control}
                                        name="template.basePdf.padding.2"
                                        render={({ field: { onChange, ...field } }) => {
                                            return (
                                                <Form.Item>
                                                    <Form.Label>Bottom padding</Form.Label>
                                                    <Form.Control>
                                                        <Input
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (value === "") {
                                                                    onChange(null)
                                                                } else {
                                                                    onChange(parseFloat(value))
                                                                }
                                                            }}
                                                            {...field} />
                                                    </Form.Control>
                                                    <Form.ErrorMessage />
                                                </Form.Item>
                                            )
                                        }}
                                    />
                                    <Form.Field
                                        control={form.control}
                                        name="template.basePdf.padding.3"
                                        render={({ field: { onChange, ...field } }) => {
                                            return (
                                                <Form.Item>
                                                    <Form.Label>Left padding</Form.Label>
                                                    <Form.Control>
                                                        <Input
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (value === "") {
                                                                    onChange(null)
                                                                } else {
                                                                    onChange(parseFloat(value))
                                                                }
                                                            }}
                                                            {...field} />
                                                    </Form.Control>
                                                    <Form.ErrorMessage />
                                                </Form.Item>
                                            )
                                        }}
                                    />
                                    <Form.Field
                                        control={form.control}
                                        name="template.basePdf.width"
                                        render={({ field: { onChange, ...field } }) => {
                                            return (
                                                <Form.Item>
                                                    <Form.Label>Width</Form.Label>
                                                    <Form.Control>
                                                        <Input
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (value === "") {
                                                                    onChange(null)
                                                                } else {
                                                                    onChange(parseFloat(value))
                                                                }
                                                            }}
                                                            {...field} />
                                                    </Form.Control>
                                                    <Form.ErrorMessage />
                                                </Form.Item>
                                            )
                                        }}
                                    />
                                    <Form.Field
                                        control={form.control}
                                        name="template.basePdf.height"
                                        render={({ field: { onChange, ...field } }) => {
                                            return (
                                                <Form.Item>
                                                    <Form.Label>Height</Form.Label>
                                                    <Form.Control>
                                                        <Input
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (value === "") {
                                                                    onChange(null)
                                                                } else {
                                                                    onChange(parseFloat(value))
                                                                }
                                                            }}
                                                            {...field} />
                                                    </Form.Control>
                                                    <Form.ErrorMessage />
                                                </Form.Item>
                                            )
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-y-4">
                                <Heading level="h2">Designer</Heading>
                                <Container className="overflow-hidden p-0">
                                    <PDFDesigner
                                        ref={designerRef}
                                        template={{ ...template }} />
                                </Container>
                            </div>
                        </div>
                    </div>
                </RouteFocusModal.Body>
                <RouteFocusModal.Footer>
                    <div className="flex items-center justify-end gap-x-2">
                        <RouteFocusModal.Close asChild>
                            <Button size="small" variant="secondary">
                                {t("actions.cancel")}
                            </Button>
                        </RouteFocusModal.Close>
                        <Button
                            size="small"
                            variant="primary"
                            type="submit"
                            isLoading={isPending}
                        >
                            {t("actions.edit")}
                        </Button>
                    </div>
                </RouteFocusModal.Footer>
            </KeyboundForm>
        </RouteFocusModal.Form>
    )
}


export const useEditTemplate = (
    options?: UseMutationOptions<
        zod.infer<typeof EditTemplateSchema> & { id: string },
        FetchError,
        { payload: zod.infer<typeof EditTemplateSchema>, id: string }
    >
) => {
    const client = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }) => sdk.client.fetch(`/admin/attachments/${id}`, {
            method: "POST",
            body: payload
        }),
        onSuccess: (data, variables, context) => {
            client.invalidateQueries({ queryKey: ["attachment-templates"] })
            options?.onSuccess?.(data, variables, context)
        },
        ...options,
    })
}
