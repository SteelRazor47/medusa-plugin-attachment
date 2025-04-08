import React from "react";
import { useTranslation } from "react-i18next";
import translations from "../i18n/translations";

export default ({ children }: React.PropsWithChildren) => {
    const { i18n } = useTranslation()

    if (i18n.isInitialized) {
        // Assume that if "en" isn't already loaded, no other language is either
        if (!i18n.hasResourceBundle("en", "plugin-attachment"))
            for (const [lng, resource] of Object.entries(translations))
                i18n.addResourceBundle(lng, "plugin-attachment", resource)

        i18n.options.fallbackNS = "translation"
        i18n.options.defaultNS = "plugin-attachment"
    }

    return <> {children} </>;
};
