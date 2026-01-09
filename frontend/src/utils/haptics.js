import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isPlatform } from '@ionic/react'; // Or logic check if 'isNative'

const isMobile = () => {
    // Basic check, or use capacitor helper
    return window.Capacitor && window.Capacitor.isPluginAvailable('Haptics');
};

export const hapticImpactLight = async () => {
    try {
        await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
        // Ignore errors on unsupported platforms
    }
};

export const hapticImpactMedium = async () => {
    try {
        await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) { }
};

export const hapticImpactHeavy = async () => {
    try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) { }
};

export const hapticSuccess = async () => {
    try {
        await Haptics.notification({ type: NotificationType.Success });
    } catch (e) { }
};

export const hapticError = async () => {
    try {
        await Haptics.notification({ type: NotificationType.Error });
    } catch (e) { }
};

export const hapticSelection = async () => {
    try {
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
        await Haptics.selectionEnd();
    } catch (e) { }
};
