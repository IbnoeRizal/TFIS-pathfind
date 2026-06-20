import { render } from "ink";
import Layout from "./SearchTUI/layout.js";
import { StrictMode } from "react";

const app = render(
    <StrictMode>
        <Layout/>
    </StrictMode>
);
await app.waitUntilExit();