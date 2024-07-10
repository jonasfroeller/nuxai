import { toast } from "vue-sonner";

export function displaySignInResponseError(error: any) {
    if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
    } else {
        toast.error(`Error: ${error.message || 'An unknown error occurred.'}`);
    }
}