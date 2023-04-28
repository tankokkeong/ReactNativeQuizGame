import { ToastAndroid } from "react-native";

export const hashCode = (code) => {
    return code.split("").reduce(function(a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
};

export const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
};