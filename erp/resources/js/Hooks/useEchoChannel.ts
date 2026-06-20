import { useEffect, useRef } from 'react';

type Handler = (data: unknown) => void;

export function useEchoPrivateChannel(
    channelName: string | null,
    event: string,
    handler: Handler
): void {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (!channelName || !window.Echo) return;

        const channel = window.Echo.private(channelName);
        channel.listen(event, (data: unknown) => handlerRef.current(data));

        return () => {
            window.Echo.leave(channelName);
        };
    }, [channelName, event]);
}
