import { zodResolver } from "@hookform/resolvers/zod"
import {
    Alert,
    Button,
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
import { useRouteModal } from "../../../../components/modals/route-modal-provider/use-route-modal"
import { AttachmentTemplate } from "../../attachment-template-list-table"

const EditAttachmentSchema = zod.object({
    name: zod.string(),
    handle: zod.string()
})

const isFetchError = (error: any): error is FetchError => {
    return error instanceof FetchError
}

export const EditAttachmentForm = ({ attachment }: { attachment: AttachmentTemplate }) => {
    const { t } = useTranslation()
    const { handleSuccess } = useRouteModal()

    const form = useForm<zod.infer<typeof EditAttachmentSchema>>({
        defaultValues: {
            ...attachment
        },
        resolver: zodResolver(EditAttachmentSchema),
    })

    const { mutateAsync, isPending } = useEditAttachment()

    const handleSubmit = form.handleSubmit(async (values) => {
        try {
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

    // if (isError) {
    //     throw error
    // }

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
                                <div className="grid grid-cols-2 gap-4">
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


export const useEditAttachment = (
    options?: UseMutationOptions<
        zod.infer<typeof EditAttachmentSchema> & { id: string },
        FetchError,
        { payload: zod.infer<typeof EditAttachmentSchema>, id: string }
    >
) => {
    const client = useQueryClient()
    return useMutation({
        mutationFn: ({ payload, id }) => sdk.client.fetch(`/admin/attachments/${id}`, {
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
