import {
  Button,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  DataTableSortingState,
  Heading,
  toast,
  useDataTable,
  usePrompt,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Container } from "../../components/container"
import { sdk } from "../../lib/sdk"
import { Link, useNavigate } from "react-router-dom"
import { PencilSquare, Trash } from "@medusajs/icons"
import { useTranslation } from "react-i18next"

export type AttachmentTemplate = {
  id: string
  handle: string
  name: string
  template: any
}
const columnHelper = createDataTableColumnHelper<AttachmentTemplate>()

const useColumns = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const prompt = usePrompt()
  const client = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: (id: string) => sdk.client.fetch(`/admin/attachments/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      console.log("DELETED")
      client.invalidateQueries({ queryKey: ["attachment-templates"] })
    },
  })

  const handleDelete = async (attachment: AttachmentTemplate) => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("categories.delete.confirmation", {
        name: attachment.name,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync(attachment.id, {
      onSuccess: () => {
        toast.success(
          t("categories.delete.successToast", {
            name: attachment.name,
          })
        )

        navigate("/attachments", {
          replace: true,
        })
      },
      onError: (e) => {
        toast.error(e.message)
      },
    })
  }

  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        // Enables sorting for the column.
        enableSorting: true,
        // If omitted, the header will be used instead if it's a string, 
        // otherwise the accessor key (id) will be used.
        sortLabel: "Name",
        // If omitted the default value will be "A-Z"
        sortAscLabel: "A-Z",
        // If omitted the default value will be "Z-A"
        sortDescLabel: "Z-A",
      }),
      columnHelper.accessor("handle", {
        header: "Handle",
        // cell: ({ getValue }) => {
        //   const status = getValue()
        //   return (
        //     <Badge color={status === "published" ? "green" : "grey"} size="xsmall">
        //       {status === "published" ? "Published" : "Draft"}
        //     </Badge>
        //   )
        // },
      }),
      columnHelper.action({
        actions: [
          {
            label: t("actions.edit"),
            icon: <PencilSquare />,
            onClick: (ctx) => {
              navigate(`${ctx.row.original.id}/edit`)
            },
          },
          {
            label: t("actions.delete"),
            icon: <Trash />,
            onClick: async (ctx) => {
              await handleDelete(ctx.row.original)
            },
          },
        ],
      }),
    ],
    [t, navigate]
  )
}

// const filterHelper = createDataTableFilterHelper<AttachmentTemplate>()

// const filters = [
//   filterHelper.accessor("status", {
//     type: "select",
//     label: "Status",
//     options: [
//       {
//         label: "Published",
//         value: "published",
//       },
//       {
//         label: "Draft",
//         value: "draft",
//       },
//     ],
//   }),
// ]

const limit = 15

const AttachmentTemplateListTable = () => {
  const { t } = useTranslation()

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })
  const [search, setSearch] = useState<string>("")
  // const [filtering, setFiltering] = useState<DataTableFilteringState>({})
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])
  // const statusFilters = useMemo(() => {
  //   return (filtering.status || undefined) as AttachmentTemplate["status"] | undefined
  // }, [filtering])

  const { data, isLoading } = useQuery({
    queryFn: () => sdk.client.fetch<{ attachments: AttachmentTemplate[], count: number }>("/admin/attachments", {
      headers: {},
      query: {
        limit,
        offset,
        q: search,
        //status: statusFilters,
        order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
      }
    }),
    queryKey: ["attachment-templates", limit, offset, search, /* statusFilters */, sorting?.id, sorting?.desc],
  })

  const navigate = useNavigate()

  const columns = useColumns()

  const table = useDataTable({
    columns,
    data: data?.attachments || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    search: {
      state: search,
      onSearchChange: setSearch,
    },
    // filtering: {
    //   state: filtering,
    //   onFilteringChange: setFiltering,
    // },
    // filters,
    onRowClick: (_, row) => { navigate(`/attachments/${row.id}`) },
    sorting: {
      // Pass the pagination state and updater to the table instance
      state: sorting,
      onSortingChange: setSorting,
    },
  })

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          {/* TODO: translate */}
          <Heading>Attachment templates</Heading>
          <div className="flex gap-2">
            {/* <DataTable.FilterMenu tooltip="Filter" /> */}
            <DataTable.SortingMenu tooltip={t("filters.sortLabel")} />
            {/* TODO: add IT translations upstream for filters.sortLabel and filters.searchLabel  */}
            <DataTable.Search placeholder={t("filters.searchLabel")} />
            <DataTableAction
              label={t("actions.create")}
              to="create"
            />
          </div>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  )
}

export default AttachmentTemplateListTable


type DataTableActionProps = {
  label: string
  disabled?: boolean
} & (
    | {
      to: string
    }
    | {
      onClick: () => void
    }
  )

const DataTableAction = ({
  label,
  disabled,
  ...props
}: DataTableActionProps) => {
  const buttonProps = {
    size: "small" as const,
    disabled: disabled ?? false,
    type: "button" as const,
    variant: "secondary" as const,
  }

  if ("to" in props) {
    return (
      <Button {...buttonProps} asChild>
        <Link to={props.to}>{label}</Link>
      </Button>
    )
  }

  return (
    <Button {...buttonProps} onClick={props.onClick}>
      {label}
    </Button>
  )
}
