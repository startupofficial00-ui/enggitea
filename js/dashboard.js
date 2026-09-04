document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector("#dashboardResources");

    if (!container) return;

    try {
        const { data: resources, error } = await supabaseClient
            .from("resources")
            .select("*")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(6);

        if (error) {
            throw error;
        }

        renderDashboardResources(resources || []);

    } catch (error) {
        console.error("Dashboard resources error:", error);

        container.innerHTML = `
            <div class="alert alert-error">
                Unable to load resources right now.
                Please try again later.
            </div>
        `;
    }
});


// ===============================
// RENDER RESOURCES
// ===============================
function renderDashboardResources(resources) {
    const container = document.querySelector("#dashboardResources");

    if (!resources.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Resources Available</h3>
                <p>
                    Resources will appear here once they are approved.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="resource-grid">
            ${resources.map(resourceCardHTML).join("")}
        </div>
    `;
}


// ===============================
// RESOURCE CARD
// ===============================
function resourceCardHTML(resource) {
    const id = resource.id;

    const title =
        resource.title ||
        "Untitled Resource";

    const type =
        resource.resource_type ||
        "Resource";

    const description =
        resource.description ||
        "Engineering Mathematics learning resource.";

    return `
        <article class="resource-card">

            <span class="resource-type">
                ${escapeHTML(type)}
            </span>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(description)}
            </p>

            <div class="resource-actions">

                <a
                    href="resource.html?id=${encodeURIComponent(id)}"
                    class="btn btn-primary btn-sm"
                >
                    View Resource
                </a>

            </div>

        </article>
    `;
}


// ===============================
// HTML ESCAPE
// ===============================
function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}