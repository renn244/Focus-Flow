import { CircleAlert } from "lucide-react";

/** A problem with the whole form, such as a wrong password, shown above the submit button. */
const FormAlert = ({ message }: { message?: string }) =>
    message ? (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {message}
        </p>
    ) : null;

export default FormAlert;
