import { useRouteError } from "react-router";

export default function ErrorPage(){
    const error = useRouteError();
    console.log(error);


    return (
        <div id="error-page">
            <h1>OOps</h1>
            <p>Sorry, an unexpected error has occured.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
}