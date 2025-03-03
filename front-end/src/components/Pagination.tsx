import { Button, Pagination, PaginationItemRenderProps, PaginationItemType } from "@nextui-org/react";
import { LeftArrowIcon, MoreHorizontalIcon, RightArrowIcon } from "./Icons";
import { cn } from "@/lib/utils";

const renderItem = ({ ref, key, value, isActive, onNext, onPrevious, setPage }: PaginationItemRenderProps) => {
    if (value === PaginationItemType.NEXT) {
        return (
            
            <Button
                key={key}
                onPress={onNext}
                color="secondary"
                size="sm"
                radius="sm"
                isIconOnly
                className="bg-skin-neutral-50 rounded-10 !text-skin-neutral-500 !w-9 !h-9"
                startContent={<RightArrowIcon stroke="#3A4340" className="w-4.5 h-4.5" />}
            />
        );
    }

    if (value === PaginationItemType.PREV) {
        return (          
            <Button
            key={key}
            onPress={onPrevious}
            color="secondary"
            size="sm"
            radius="sm"
            isIconOnly
            className="min-w-fit bg-skin-neutral-50 !w-9 !h-9 rounded-10 !p-2"
            
            startContent={<LeftArrowIcon stroke="#6B7270" className="" />}
        />

        );
    }

    if (value === PaginationItemType.DOTS) {
        return (
            <Button
            key={key}
            color="secondary"
            size="sm"
            radius="sm"
            className="min-w-fit bg-skin-neutral-50 rounded-10 font-semibold !w-9 !h-9 !p-2"
        >
            <MoreHorizontalIcon />
        </Button>
        );
    }

    // cursor is the default item
    return (
        
        <Button
            key={key}
            ref={ref}
            color="secondary"
            size="sm"
            radius="sm"
            className={cn("min-w-fit bg-skin-neutral-50 rounded-10 font-semibold !w-9 !h-9 !p-2",
                isActive && "bg-primary-gradient-100",
            )}
            onPress={() => setPage(value)}
        >
            <span className={cn("!text-title-2 !text-skin-neutral-500", isActive && "!text-skin-white",
            )}>{value}</span>
        </Button>
        
    );
};
type PaginationProps = {
    total?: number;
    onPageChange?: (page: number) => void
}
 const App: React.FC<PaginationProps> = ({total = 10, onPageChange}) => {
    

    return (
        <Pagination
            disableCursorAnimation
            showControls
            className="gap-2"
            initialPage={1}
            radius="full"
            renderItem={renderItem}
            total={total}
            variant="light"
            onChange={onPageChange}
        />
    );
}

export default App