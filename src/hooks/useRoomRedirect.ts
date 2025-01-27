import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoomService from "@/services/roomService";
import { Room } from "@/models/room";
import UtilsService from "@/services/utilsService";
import FirebaseService from "@/services/firebaseService";

const firebaseService = new FirebaseService();
const roomService = new RoomService();
const utilsService = new UtilsService();

export const useRoomRedirect = () => {
    const [room, setRoom] = useState<Room | null>(null);
    const [isHost, setIsHost] = useState<boolean>(false);

    const router = useRouter();

    useEffect(() => {
        const currentRoomCode = utilsService.getCurrentRoomCode();
        if (!currentRoomCode) {
            router.push('/');
            return;
        }

        firebaseService.read<Room>(`rooms/${currentRoomCode}`).then((room: Room) => {
              redirectBasedOnRoomStatus(room);
        });

        const unsubscribe = roomService.subscribeToRoom(currentRoomCode, (updatedRoom) => {
            setRoom(updatedRoom);
            setIsHost(utilsService.isHost());

            if (!updatedRoom) {
                return;
            }

            // Redirect based on room status
            redirectBasedOnRoomStatus(updatedRoom);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [router]); // Dependency array ensures this runs once

    const redirectBasedOnRoomStatus = (room: Room) => {
        switch (room?.status) {
            case 'created':
                break;
            case 'waiting':
                router.push('/sala-espera');
                break;
            case 'playing':
                router.push(`/games/${room?.game?.id}`);
                break;
            case 'ranking':
            case 'ended':
                router.push('/resultados');
                break;
            default:
                break;
        }
    };

    return { room, isHost }; // Return room data so the component can use it
};
