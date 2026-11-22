import NetInfo from '@react-native-community/netinfo';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { sincronizarFila } from '@/services/sincronizacao';

const INTERVALO_TENTATIVA_MS = 30_000;

export function SyncContextProvider({ children }: { children: ReactNode }) {
    const db = useSQLiteContext();

    useEffect(() => {
        sincronizarFila(db);

        const cancelarRede = NetInfo.addEventListener((state) => {
            if(state.isConnected === true){
                sincronizarFila(db);
            }
        });

        const assinaturaApp = AppState.addEventListener('change', (estado) => {
            if(estado === 'active'){
                sincronizarFila(db);
            }
    });

    const intervalo = setInterval(() => sincronizarFila(db), INTERVALO_TENTATIVA_MS);

    return () => {
        cancelarRede();
        assinaturaApp.remove();
        clearInterval(intervalo);
    };
}, [db]);

    return <>{children}</>;
}