import { BleManager } from "react-native-ble-plx";
import { useEffect, useState } from "react";
export const useBluetoothState = () => {
    const [state, setState] = useState(null);

    useEffect(() => {
        const manager = new BleManager();
        const sub = manager.onStateChange(setState, true);

        return () => {
            sub.remove();
            manager.destroy();
        };
    }, []);

    return state;
};
