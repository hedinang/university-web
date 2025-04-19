import { format } from 'date-fns';

export const formatLastTime = (lastTime) => {
    const currentTime = new Date();
    const timeDifference = currentTime - lastTime;

    if (timeDifference < 60000) {
        return 'Few sec';
    } else if (timeDifference < 3600000) {
        const minutes = Math.floor(timeDifference / 60000);
        return `${minutes} mins`;
    } else if (timeDifference < 86400000) {
        const hours = Math.floor(timeDifference / 3600000);
        return `${hours} hour`;
    } else if (timeDifference < 691200000) {
        const days = Math.floor(timeDifference / 86400000);
        return `${days} days`;
    } else {
        return lastTime.toLocaleDateString();
    }
}

export const formatDate = (time) => {
    if (!format(new Date(time), 'yyyy/MM/dd')) {
        return '';
    }
    return format(new Date(time), 'yyyy/MM/dd');
};

export const formatTime = (time) => {
    if (!format(new Date(time), 'hh:mm dd/MM/yyyy')) {
        return '';
    }
    return format(new Date(time), 'hh:mm dd/MM/yyyy');
};
