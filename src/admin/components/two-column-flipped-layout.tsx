export type TwoColumnLayoutProps = {
    firstCol: React.ReactNode
    secondCol: React.ReactNode
}

export const TwoColumnFlippedLayout = ({
    firstCol,
    secondCol,
}: TwoColumnLayoutProps) => {
    return (
        <div className="flex flex-col gap-x-4 gap-y-3 xl:flex-row xl:items-start">
            <div className="flex w-full flex-col gap-y-3 max-w-[100%] xl:mt-0 xl:max-w-[440px]">
                {firstCol}
            </div>
            <div className="flex w-full flex-col gap-y-3">
                {secondCol}
            </div>
        </div>
    )
}
