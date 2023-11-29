import React, { useEffect } from 'react';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

interface WebSocketService {
    socket: Socket | null;
    Init: () => void;
    listen: (eventName: string) => Observable<any>;
    emit: (eventName: string, data: any) => void;
}

const useWebSocketService = (): WebSocketService => {
    let socket: Socket | null = null;

    const Init = () => {
        socket = io("http://localhost:3000");
        socket.on("hello", (arg: any) => {
            console.log(arg); // world
        });
    };

    const listen = (eventName: string): Observable<any> => {
        return new Observable((subscriber: any) => {
            if (socket) {
                socket.on(eventName, (data: any) => {
                    subscriber.next(data);
                });
            }
        });
    };

    const emit = (eventName: string, data: any) => {
        if (socket) {
            socket.emit(eventName, data);
            console.log(data);
        }
    };

    useEffect(() => {
        Init();
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return {
        socket,
        Init,
        listen,
        emit,
    };
};

// Usage example in a functional component
const MyComponent: React.FC = () => {
    const webSocketService = useWebSocketService();

    useEffect(() => {
        // Listen to 'some-event' when the component mounts
        const subscription = webSocketService.listen('some-event').subscribe((data) => {
            console.log('Received data:', data);
        });

        // Emit 'another-event' after 3 seconds
        setTimeout(() => {
            webSocketService.emit('another-event', { message: 'Hello!' });
        }, 3000);

        return () => {
            // Unsubscribe when the component unmounts
            subscription.unsubscribe();
        };
    }, [webSocketService]);

    return (
        <div>
            {/* Your component's JSX */}
        </div>
    );
};

export default MyComponent;
