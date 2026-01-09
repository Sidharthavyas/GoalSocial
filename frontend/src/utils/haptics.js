import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const hapticImpactLight = async () => {
    try {
        await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
        // Gracefully fail on web/unsupported platforms
    }
};

export const hapticImpactMedium = async () => {
    try {
        await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) { }
};

export const hapticSuccess = async () => {
    try {
        await Haptics.notification({ type: NotificationType.Success });
    } catch (e) { }
};
