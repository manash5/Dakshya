import StatusScreen, { Spinner } from "./_components/StatusScreen";

export default function Loading() {
    return (
        <StatusScreen title="Loading">
            <Spinner className="h-6 w-6" />
        </StatusScreen>
    );
}
