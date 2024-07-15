import { IS_CLIENT } from "~/server/globals";

export function titleCase(text: string) {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// TODO: fix hydration error
export function formatCurrentClientDate() {
    let newDate = new Date();
    let formattedDate = newDate.toString();

    if (IS_CLIENT) {
        const locale = navigator.language;
        console.log(locale)
        formattedDate = newDate.toLocaleDateString(locale, {
            weekday: 'short',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });

        console.log(formattedDate)
    }

    return {
        date: newDate,
        fullDateString: String(newDate),
        formattedDate
    };
}
