package com.easeshop.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA Forwarding Controller.
 * 
 * Forwards all non-API, non-static-resource requests to index.html
 * so that React Router can handle client-side routing.
 * 
 * This is needed because the React frontend is bundled inside
 * the Spring Boot JAR as static resources.
 */
@Controller
public class SpaForwardingController {

    /**
     * Matches any path that:
     * - Does NOT start with /api/ (backend REST endpoints)
     * - Does NOT start with /swagger or /v3/api-docs (OpenAPI docs)
     * - Does NOT contain a file extension (e.g., .js, .css, .png)
     */
    @RequestMapping(value = {
        "/{path:^(?!api|swagger|v3|api-docs)[^\\.]*}",
        "/{segment1:^(?!api|swagger|v3|api-docs)[^\\.]*}/{path:[^\\.]*}",
        "/{segment1:^(?!api|swagger|v3|api-docs)[^\\.]*}/{segment2:[^\\.]*}/{path:[^\\.]*}",
        "/{segment1:^(?!api|swagger|v3|api-docs)[^\\.]*}/{segment2:[^\\.]*}/{segment3:[^\\.]*}/{path:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
