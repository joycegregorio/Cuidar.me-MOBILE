import NetInfo from '@react-native-community/netinfo';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { sincronizarFila } from '@/services/sincronizacao';

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

    return () => {
        cancelarRede();
        assinaturaApp.remove();
    };
}, [db]);

    return <>{children}</>;
}