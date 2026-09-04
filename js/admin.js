document.addEventListener("DOMContentLoaded", () => {
    setupAdminPage();
    setupPendingPage();
});


/* =====================================================
   ADMIN AUTH CHECK
===================================================== */

async function setupAdminPage() {

    const adminPage =
        document.querySelector("#pendingCount") ||
        document.querySelector("#pendingContainer");

    if (!adminPage) return;

    try {

        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error || !user) {

            window.location.href = "../login.html";

            return;
        }


        const role =
            user.user_metadata?.role ||
            user.user_metadata?.user_type;


        if (
            String(role).toLowerCase() !== "admin"
        ) {

            alert("Admin access is required.");

            window.location.href =
                "../dashboard.html";

            return;
        }

    } catch (error) {

        console.error(
            "Admin authentication error:",
            error
        );

        window.location.href =
            "../login.html";
    }
}


/* =====================================================
   PENDING RESOURCES
===================================================== */

async function setupPendingPage() {

    const container =
        document.querySelector("#pendingContainer");

    if (!container) return;


    try {

        const {
            data: resources,
            error
        } = await supabaseClient
            .from("resources")
            .select("*")
            .eq("status", "pending")
            .order("created_at", {
                ascending: false
            });


        if (error) {

            throw error;

        }


        const count =
            document.querySelector("#pendingCount");


        if (count) {

            count.textContent =
                resources?.length || 0;

        }


        if (
            !resources ||
            resources.length === 0
        ) {

            container.className = "";

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No Pending Resources
                    </h3>

                    <p>
                        All submitted resources have been reviewed.
                    </p>

                </div>

            `;

            return;
        }


        renderPendingResources(
            resources,
            container
        );


    } catch (error) {

        console.error(
            "Unable to load pending resources:",
            error
        );


        container.className = "";

        container.innerHTML = `

            <div class="alert alert-error">

                Unable to load pending resources.

            </div>

        `;
    }
}


/* =====================================================
   RENDER ADMIN TABLE
===================================================== */

function renderPendingResources(
    resources,
    container
) {

    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>
                        Resource
                    </th>

                    <th>
                        Type
                    </th>

                    <th>
                        Semester
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Actions
                    </th>

                </tr>

            </thead>

            <tbody>

                ${resources
                    .map(pendingRow)
                    .join("")}

            </tbody>

        </table>

    `;


    container
        .querySelectorAll(".approve-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => approveItem(button)
            );

        });


    container
        .querySelectorAll(".reject-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => rejectItem(button)
            );

        });


    container
        .querySelectorAll(".admin-delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteAdminItem(button)
            );

        });
}


/* =====================================================
   TABLE ROW
===================================================== */

function pendingRow(resource) {

    const id =
        resource.id;


    const title =
        resource.title ||
        "Untitled";


    const type =
        resource.resource_type ||
        "Resource";


    const semester =
        resource.semester ||
        "—";


    const status =
        resource.status ||
        "Pending";


    return `

        <tr>

            <td>

                <strong style="color:var(--primary-dark);">

                    ${escapeHTML(title)}

                </strong>

            </td>


            <td>

                ${escapeHTML(type)}

            </td>


            <td>

                ${escapeHTML(semester)}

            </td>


            <td>

                ${escapeHTML(status)}

            </td>


            <td>

                <div
                    style="
                        display:flex;
                        gap:6px;
                        flex-wrap:wrap;
                    "
                >

                    <button
                        class="btn btn-success btn-sm approve-btn"
                        data-id="${escapeHTML(id)}"
                    >
                        Approve
                    </button>


                    <button
                        class="btn btn-danger btn-sm reject-btn"
                        data-id="${escapeHTML(id)}"
                    >
                        Reject
                    </button>


                    <button
                        class="btn btn-outline btn-sm admin-delete-btn"
                        data-id="${escapeHTML(id)}"
                    >
                        Delete
                    </button>

                </div>

            </td>

        </tr>

    `;
}


/* =====================================================
   APPROVE
===================================================== */

async function approveItem(button) {

    const id =
        button.dataset.id;


    button.disabled = true;

    button.textContent =
        "Approving...";


    try {

        const {
            error
        } = await supabaseClient
            .from("resources")
            .update({
                status: "approved"
            })
            .eq("id", id);


        if (error) {

            throw error;

        }


        showAdminMessage(
            "Resource approved successfully.",
            "success"
        );


        await setupPendingPage();


    } catch (error) {

        console.error(
            "Approve error:",
            error
        );


        showAdminMessage(
            error.message ||
            "Unable to approve resource.",
            "error"
        );


        button.disabled = false;

        button.textContent =
            "Approve";
    }
}


/* =====================================================
   REJECT
===================================================== */

async function rejectItem(button) {

    const id =
        button.dataset.id;


    const confirmed =
        confirm(
            "Are you sure you want to reject this resource?"
        );


    if (!confirmed) return;


    button.disabled = true;

    button.textContent =
        "Rejecting...";


    try {

        const {
            error
        } = await supabaseClient
            .from("resources")
            .update({
                status: "rejected"
            })
            .eq("id", id);


        if (error) {

            throw error;

        }


        showAdminMessage(
            "Resource rejected successfully.",
            "success"
        );


        await setupPendingPage();


    } catch (error) {

        console.error(
            "Reject error:",
            error
        );


        showAdminMessage(
            error.message ||
            "Unable to reject resource.",
            "error"
        );


        button.disabled = false;

        button.textContent =
            "Reject";
    }
}


/* =====================================================
   DELETE
===================================================== */

async function deleteAdminItem(button) {

    const id =
        button.dataset.id;


    const confirmed =
        confirm(
            "Delete this resource permanently?"
        );


    if (!confirmed) return;


    button.disabled = true;

    button.textContent =
        "Deleting...";


    try {

        const {
            error
        } = await supabaseClient
            .from("resources")
            .delete()
            .eq("id", id);


        if (error) {

            throw error;

        }


        showAdminMessage(
            "Resource deleted successfully.",
            "success"
        );


        await setupPendingPage();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showAdminMessage(
            error.message ||
            "Unable to delete resource.",
            "error"
        );


        button.disabled = false;

        button.textContent =
            "Delete";
    }
}


/* =====================================================
   ADMIN MESSAGE
===================================================== */

function showAdminMessage(
    message,
    type
) {

    const element =
        document.querySelector("#adminMessage");


    if (!element) return;


    element.className =
        `alert alert-${type}`;


    element.textContent =
        message;


    element.style.display =
        "block";


    setTimeout(() => {

        element.style.display =
            "none";

    }, 3000);
}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}