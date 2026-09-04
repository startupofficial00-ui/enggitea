document.addEventListener("DOMContentLoaded", () => {
    setupSubjectPage();
    setupSearchPage();
    setupResourcePage();
});


/* =====================================================
   SUBJECT DATA
===================================================== */

const subjectData = {

    1: {
        name: "Applied Calculus",
        code: "MA2SC01",
        units: [
            {
                number: 1,
                title: "Differential Calculus",
                description: "Limits, Continuity, Differentiation"
            },
            {
                number: 2,
                title: "Integral Calculus",
                description: "Integration, Definite Integrals"
            },
            {
                number: 3,
                title: "Multivariable Calculus",
                description: "Partial Differentiation, Multiple Integrals"
            },
            {
                number: 4,
                title: "Differential Equations",
                description: "First Order, Higher Order"
            }
        ]
    },

    2: {
        name: "Linear Algebra",
        code: "MA2SC02",
        units: [
            {
                number: 1,
                title: "Vector Spaces",
                description: "Subspaces, Span, Basis, Dimension"
            },
            {
                number: 2,
                title: "Linear Transformations and Diagonalization",
                description: "Eigen Values, Eigen Vectors, Diagonalization"
            },
            {
                number: 3,
                title: "Inner Product Spaces",
                description: "Norms, Cauchy-Schwarz, Orthogonal"
            },
            {
                number: 4,
                title: "Matrix Decomposition",
                description: "QR, SVD, Positive-Definite Matrices"
            }
        ]
    },

    3: {
        name: "Discrete Mathematics",
        code: "MA2SC03",
        units: [
            {
                number: 1,
                title: "Set Theory, Relations, Functions",
                description: "Relations, Equivalence, Recursive Relations"
            },
            {
                number: 2,
                title: "Logic",
                description: "Propositional, Predicate Logic, Proofs"
            },
            {
                number: 3,
                title: "Boolean Algebra",
                description: "Partitions, Inverse, Derivatives, Boolean Algebra"
            },
            {
                number: 4,
                title: "Graphs and Discrete Algorithms",
                description: "Basic Combinations, Graphs, Discrete Algorithms"
            }
        ]
    },

    4: {
        name: "Probability and Statistics",
        code: "MA2SC04",
        units: [
            {
                number: 1,
                title: "Descriptive Statistics",
                description: "Central Tendency, Variation, Bar Plot"
            },
            {
                number: 2,
                title: "Probability and Random Variables",
                description: "Bayes Theorem, Discrete Distributions"
            },
            {
                number: 3,
                title: "Two Dimensional Random Variables",
                description: "Correlation, Regression, CLT"
            },
            {
                number: 4,
                title: "Testing of Hypothesis",
                description: "t-test, z-test, Chi-square"
            },
            {
                number: 5,
                title: "Design of Experiments",
                description: "ANOVA, CRD, RBD, LSD"
            }
        ]
    }

};


/* =====================================================
   SUBJECT PAGE
===================================================== */

function setupSubjectPage() {

    const unitList = document.querySelector("#unitList");

    if (!unitList) return;

    const params = new URLSearchParams(window.location.search);

    const semester = params.get("semester") || "1";

    const subject = subjectData[semester];

    if (!subject) {

        unitList.innerHTML = `
            <div class="empty-state">
                <h3>Semester Not Found</h3>
                <p>Please select a valid semester.</p>
            </div>
        `;

        return;
    }


    const title = document.querySelector("#subjectTitle");
    const code = document.querySelector("#subjectCode");
    const breadcrumb =
        document.querySelector("#breadcrumbSemester");


    if (title) {
        title.textContent = subject.name;
    }

    if (code) {
        code.textContent = subject.code;
    }

    if (breadcrumb) {
        breadcrumb.textContent = `Semester ${semester}`;
    }


    unitList.innerHTML = subject.units.map(unit => {

        return `
            <a
                href="search.html?semester=${semester}&unit=${unit.number}"
                class="unit-card"
            >

                <div>

                    <h3>
                        Unit ${unit.number} - ${escapeHTML(unit.title)}
                    </h3>

                    <p>
                        ${escapeHTML(unit.description)}
                    </p>

                </div>

                <span class="arrow">
                    ›
                </span>

            </a>
        `;

    }).join("");

}


/* =====================================================
   SEARCH PAGE
===================================================== */

function setupSearchPage() {

    const form = document.querySelector("#searchForm");

    if (!form) return;

    const input =
        document.querySelector("#searchInput");

    const resultsContainer =
        document.querySelector("#searchResults");


    const params =
        new URLSearchParams(window.location.search);


    const initialQuery =
        params.get("q");


    if (initialQuery && input) {

        input.value = initialQuery;

        performSearch(
            initialQuery,
            resultsContainer
        );

    }


    form.addEventListener("submit", async event => {

        event.preventDefault();

        const query =
            input.value.trim();


        if (!query) {

            resultsContainer.innerHTML = `
                <div class="alert alert-info">
                    Please enter something to search.
                </div>
            `;

            return;
        }


        const newUrl =
            `search.html?q=${encodeURIComponent(query)}`;

        window.history.pushState(
            {},
            "",
            newUrl
        );


        await performSearch(
            query,
            resultsContainer
        );

    });

}


/* =====================================================
   SEARCH RESOURCES - SUPABASE
===================================================== */

async function performSearch(query, container) {

    if (!container) return;


    container.innerHTML = `
        <div class="loading">

            <div class="spinner"></div>

            Searching resources...

        </div>
    `;


    try {

        let supabaseQuery =
            supabaseClient
                .from("resources")
                .select("*")
                .eq("status", "approved")
                .order("created_at", {
                    ascending: false
                });


        if (query) {

            const safeQuery =
                query.replace(/[%_]/g, "\\$&");

            supabaseQuery =
                supabaseQuery.or(
                    `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,subject.ilike.%${safeQuery}%`
                );

        }


        const {
            data: resources,
            error
        } = await supabaseQuery;


        if (error) {
            throw error;
        }


        if (!resources || resources.length === 0) {

            container.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No Results Found
                    </h3>

                    <p>
                        We couldn't find any resources matching
                        "${escapeHTML(query)}".
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML = `
            <div class="resource-grid">
                ${resources
                    .map(resourceCardHTML)
                    .join("")}
            </div>
        `;


    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        container.innerHTML = `
            <div class="alert alert-error">
                Search failed. Please try again.
            </div>
        `;

    }

}


/* =====================================================
   RESOURCE PAGE
===================================================== */

async function setupResourcePage() {

    const container =
        document.querySelector("#resourceDetails");

    if (!container) return;


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Resource Not Found
                </h3>

                <p>
                    No resource ID was provided.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="loading">

            <div class="spinner"></div>

            Loading resource...

        </div>
    `;


    try {

        const {
            data: resource,
            error
        } = await supabaseClient
            .from("resources")
            .select("*")
            .eq("id", id)
            .eq("status", "approved")
            .single();


        if (error) {
            throw error;
        }


        if (!resource) {
            throw new Error(
                "Resource not found."
            );
        }


        renderResourceDetails(
            resource,
            container
        );


    } catch (error) {

        console.error(
            "Resource loading error:",
            error
        );

        container.innerHTML = `
            <div class="alert alert-error">

                Unable to load this resource.

            </div>
        `;

    }

}


/* =====================================================
   RESOURCE DETAILS UI
===================================================== */

function renderResourceDetails(
    resource,
    container
) {

    const title =
        resource.title ||
        "Untitled Resource";


    const type =
        resource.resource_type ||
        "Resource";


    const description =
        resource.description ||
        "No description available.";


    const youtubeUrl =
        resource.youtube_url;


    const fileUrl =
        resource.file_url;


    let action = "";


    const normalizedType =
        String(type).toLowerCase();


    if (
        normalizedType.includes("video") ||
        normalizedType.includes("playlist")
    ) {

        if (youtubeUrl) {

            action = `
                <a
                    href="${safeURL(youtubeUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary"
                >
                    ▶ Watch ${
                        normalizedType.includes("playlist")
                            ? "Playlist"
                            : "Video"
                    }
                </a>
            `;

        }

    } else if (
        normalizedType.includes("formula") ||
        normalizedType.includes("question") ||
        normalizedType.includes("pdf")
    ) {

        if (fileUrl) {

            action = `
                <a
                    href="${safeURL(fileUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary"
                >
                    👁 View PDF
                </a>
            `;

        }

    } else {

        if (youtubeUrl) {

            action = `
                <a
                    href="${safeURL(youtubeUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary"
                >
                    Open Resource
                </a>
            `;

        } else if (fileUrl) {

            action = `
                <a
                    href="${safeURL(fileUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary"
                >
                    Open File
                </a>
            `;

        }

    }


    container.innerHTML = `

        <article class="card">

            <span class="resource-type">
                ${escapeHTML(type)}
            </span>

            <h1 class="page-title">
                ${escapeHTML(title)}
            </h1>

            <p class="page-subtitle">
                ${escapeHTML(description)}
            </p>


            <div class="section">

                <h2 class="section-title">
                    Resource Information
                </h2>


                <div class="grid grid-2">

                    <div class="subject-card">

                        <h3>
                            Resource Type
                        </h3>

                        <p>
                            ${escapeHTML(type)}
                        </p>

                    </div>


                    ${
                        resource.semester
                            ? `
                                <div class="subject-card">

                                    <h3>
                                        Semester
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            resource.semester
                                        )}
                                    </p>

                                </div>
                            `
                            : ""
                    }

                    ${
                        resource.unit
                            ? `
                                <div class="subject-card">

                                    <h3>
                                        Unit
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            resource.unit
                                        )}
                                    </p>

                                </div>
                            `
                            : ""
                    }

                </div>

            </div>


            <div
                style="
                    margin-top:25px;
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                "
            >

                ${action}


                <a
                    href="search.html"
                    class="btn btn-outline"
                >
                    ← Back to Search
                </a>

            </div>

        </article>

    `;

}


/* =====================================================
   RESOURCE CARD
===================================================== */

function resourceCardHTML(resource) {

    const id =
        resource.id;


    const title =
        resource.title ||
        "Untitled Resource";


    const type =
        resource.resource_type ||
        "Resource";


    const description =
        resource.description ||
        "Engineering Mathematics resource.";


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
                    View
                </a>

            </div>

        </article>

    `;

}


/* =====================================================
   SECURITY HELPERS
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function safeURL(url) {

    try {

        const parsed =
            new URL(
                url,
                window.location.origin
            );


        if (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        ) {

            return parsed.href;

        }

    } catch {

        return "#";

    }

    return "#";

}