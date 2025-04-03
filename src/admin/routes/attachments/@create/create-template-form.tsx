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
import { Form } from "../../../components/form"
import { RouteFocusModal } from "../../../components/modals/route-focus-modal"
import { KeyboundForm } from "../../../components/utilities/keybound-form"
import PDFDesigner, { PDFDesignerRef } from "./pdf-designer"
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { FetchError } from "@medusajs/js-sdk"
import { useRef } from "react"
import { useRouteModal } from "../../../components/modals/route-modal-provider/use-route-modal"

const CreateTemplateSchema = zod.object({
    template: zod.object({
        schemas: zod.any(),
        pdfmeVersion: zod.string().nullish(),
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
    name: zod.string(),
    handle: zod.string()
})

const isFetchError = (error: any): error is FetchError => {
    return error instanceof FetchError
}

// TODO: add translations for all headings and input labels

export const CreateTemplateForm = () => {
    const { t } = useTranslation()
    const { handleSuccess } = useRouteModal()

    const designerRef = useRef<PDFDesignerRef>(null)

    const form = useForm<zod.infer<typeof CreateTemplateSchema>>({
        defaultValues: {
            template: {
                basePdf: {
                    padding: [10, 10, 10, 10],
                    width: 210,
                    height: 297
                },
                schemas: [{}]
            },
        },
        resolver: zodResolver(CreateTemplateSchema),
    })

    //   const { raw, searchParams } = useUserInviteTableQuery({
    //     prefix: PREFIX,
    //     pageSize: PAGE_SIZE,
    //   })

    //   const {
    //     invites,
    //     count,
    //     isPending: isLoading,
    //     isError,
    //     error,
    //   } = useInvites(searchParams)

    const { mutateAsync, isPending } = useCreateTemplate()

    const handleSubmit = form.handleSubmit(async (values) => {
        try {
            if (designerRef.current) {
                const currentTemplate = designerRef.current.getTemplate();
                values.template.schemas = currentTemplate.schemas;
                values.template.pdfmeVersion = currentTemplate.pdfmeVersion;
            }

            await mutateAsync(values, {
                onSuccess: (result) => {
                    handleSuccess(`/attachments/${result.id}`)
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

    // if (isError) {
    //     throw error
    // }

    const { template: { basePdf } } = form.watch()

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
                            <div>
                                <Heading>Base pdf:</Heading>
                                {/* <Text size="small" className="text-ui-fg-subtle">
                                    {t("users.inviteUserHint")}
                                </Text> */}
                            </div>

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
                                <div className="grid grid-cols-4 gap-4">
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
                                    <Form.Field
                                        control={form.control}
                                        name="handle"
                                        render={({ field }) => {
                                            return (
                                                <Form.Item>
                                                    <Form.Label>Handle</Form.Label>
                                                    <Form.Control>
                                                        <Input {...field} />
                                                    </Form.Control>
                                                    <Form.ErrorMessage />
                                                </Form.Item>
                                            )
                                        }}
                                    />
                                    <Form.Field
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => {
                                            return (
                                                <Form.Item>
                                                    <Form.Label>Name</Form.Label>
                                                    <Form.Control>
                                                        <Input {...field} />
                                                    </Form.Control>
                                                    <Form.ErrorMessage />
                                                </Form.Item>
                                            )
                                        }}
                                    />

                                </div>
                                {/* <div className="flex items-center justify-end">
                                    <Button
                                        size="small"
                                        variant="secondary"
                                        type="submit"
                                        isLoading={isPending}
                                    >
                                        {t("users.sendInvite")}
                                    </Button>
                                </div> */}
                            </div>
                            <div className="flex flex-col gap-y-4">
                                <Heading level="h2">Designer</Heading>
                                <Container className="overflow-hidden p-0">
                                    <PDFDesigner
                                        ref={designerRef}
                                        template={{
                                            basePdf,
                                            schemas: designerRef.current?.getTemplate().schemas ?? [{} as any],
                                        }} />
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
                            {t("actions.create")}
                        </Button>
                    </div>
                </RouteFocusModal.Footer>
            </KeyboundForm>
        </RouteFocusModal.Form>
    )
}


export const useCreateTemplate = (
    options?: UseMutationOptions<
        zod.infer<typeof CreateTemplateSchema> & { id: string },
        FetchError,
        zod.infer<typeof CreateTemplateSchema>
    >
) => {
    const client = useQueryClient()
    return useMutation({
        mutationFn: (payload) => sdk.client.fetch("/admin/attachments", {
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
