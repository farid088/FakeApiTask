
$(document).ready(function () {

    // API URL
    const API_URL = "https://jsonfakery.com/movies/paginated";

    // Variables
    let movies = [];
    let displayedMovies = [];
    let currentPage = 1;
    let totalPages = 1;


    // HTML Elements
    const movieContainer = $("#movieContainer");
    const loading = $("#loading");
    const error = $("#error");
    const empty = $("#empty");
    const pagination = $("#pagination");

    const searchInput = $("#searchInput");
    const searchBtn = $("#searchBtn");
    const ratingFilter = $("#ratingFilter");
    const sortSelect = $("#sortSelect");

    const movieCount = $("#movieCount");

    const movieModal = $("#movieModal");
    const modalBody = $("#modalBody");


    // GET MOVIES WITH AJAX
    function getMovies(page = 1) {

        currentPage = page;

        loading.removeClass("hidden");
        error.addClass("hidden");
        empty.addClass("hidden");

        movieContainer.empty();
        pagination.empty();

        $.ajax({

            url: API_URL,
            method: "GET",
            data: {
                page: page
            },

            success: function (response) {

                movies = response.data;

                currentPage = response.current_page;
                totalPages = response.last_page;

                displayMovies(movies);

                createPagination();

            },

            error: function () {

                showError();

            },

            complete: function () {

                loading.addClass("hidden");

            }

        });

    }


    // DISPLAY MOVIES
    function displayMovies(movieList) {

        movieContainer.empty();

        displayedMovies = movieList;

        if (movieList.length === 0) {

            empty.removeClass("hidden");

            movieCount.text("No movies found");

            return;

        }

        empty.addClass("hidden");

        movieCount.text(movieList.length + " movies found");

        movieList.forEach(function (movie, index) {

            const poster = movie.poster_path ||
                "https://placehold.co/400x600?text=No+Poster";

            const title = escapeHTML(movie.original_title || "Unknown Movie");

            const rating = Number(movie.vote_average || 0).toFixed(1);

            const date = escapeHTML(movie.release_date || "Unknown");

            const card = `

                <div class="movie-card">

                    <img
                        src="${escapeHTML(poster)}"
                        alt="${title}"
                        class="movie-poster"
                        onerror="this.onerror=null;this.src='https://placehold.co/400x600?text=No+Poster'"
                    >

                    <div class="movie-info">

                        <h3 title="${title}">${title}</h3>

                        <div class="movie-meta">

                            <span>${date}</span>

                            <span class="rating">
                                ★ ${rating}
                            </span>

                        </div>

                        <button
                            class="details-btn"
                            data-index="${index}"
                        >
                            View Details
                        </button>

                    </div>

                </div>

            `;

            movieContainer.append(card);

        });

    }


    // SEARCH
    function searchMovies() {

        const searchValue = searchInput.val().toLowerCase().trim();

        let filteredMovies = movies.filter(function (movie) {

            return (movie.original_title || "")
                .toLowerCase()
                .includes(searchValue);

        });

        applyFilters(filteredMovies);

    }


    // FILTER AND SORT
    function applyFilters(movieList) {

        let filteredMovies = [...movieList];

        const ratingValue = ratingFilter.val();

        // Rating Filter
        if (ratingValue !== "all") {

            filteredMovies = filteredMovies.filter(function (movie) {

                return Number(movie.vote_average) >= Number(ratingValue);

            });

        }


        // Sorting
        const sortValue = sortSelect.val();

        if (sortValue === "high") {

            filteredMovies.sort(function (a, b) {

                return Number(b.vote_average) - Number(a.vote_average);

            });

        }

        else if (sortValue === "low") {

            filteredMovies.sort(function (a, b) {

                return Number(a.vote_average) - Number(b.vote_average);

            });

        }

        else if (sortValue === "az") {

            filteredMovies.sort(function (a, b) {

                return (a.original_title || "").localeCompare(
                    b.original_title || ""
                );

            });

        }

        else if (sortValue === "za") {

            filteredMovies.sort(function (a, b) {

                return (b.original_title || "").localeCompare(
                    a.original_title || ""
                );

            });

        }

        displayMovies(filteredMovies);

    }


    // PAGINATION
    function createPagination() {

        pagination.empty();

        // Previous Button
        const previousButton = $("<button>")
            .addClass("page-btn")
            .text("Previous")
            .prop("disabled", currentPage === 1);

        previousButton.on("click", function () {

            getMovies(currentPage - 1);

        });

        pagination.append(previousButton);


        // Current Page
        const currentButton = $("<button>")
            .addClass("page-btn active")
            .text(currentPage)
            .prop("disabled", true);

        pagination.append(currentButton);


        // Next Button
        const nextButton = $("<button>")
            .addClass("page-btn")
            .text("Next")
            .prop("disabled", currentPage === totalPages);

        nextButton.on("click", function () {

            getMovies(currentPage + 1);

        });

        pagination.append(nextButton);

    }


    // MOVIE DETAILS
    function showMovieDetails(movie) {

        const poster = movie.poster_path ||
            "https://placehold.co/400x600?text=No+Poster";

        let castNames = "Cast information unavailable";

        if (movie.casts && movie.casts.length > 0) {

            castNames = movie.casts
                .slice(0, 5)
                .map(function (actor) {

                    return actor.name;

                })
                .join(", ");

        }

        const details = `

            <div class="modal-details">

                <img
                    src="${escapeHTML(poster)}"
                    alt="Movie Poster"
                    onerror="this.onerror=null;this.src='https://placehold.co/400x600?text=No+Poster'"
                >

                <div class="modal-text">

                    <h2>
                        ${escapeHTML(movie.original_title || "Unknown Movie")}
                    </h2>

                    <p>
                        <strong>Release Date:</strong>
                        ${escapeHTML(movie.release_date || "Unknown")}
                    </p>

                    <p>
                        <strong>Rating:</strong>
                        ★ ${Number(movie.vote_average || 0).toFixed(1)} / 10
                    </p>

                    <p>
                        <strong>Vote Count:</strong>
                        ${Number(movie.vote_count || 0)}
                    </p>

                    <p>
                        <strong>Overview:</strong>
                        ${escapeHTML(movie.overview || "No description available")}
                    </p>

                    <p class="cast">
                        <strong>Cast:</strong>
                        ${escapeHTML(castNames)}
                    </p>

                </div>

            </div>

        `;

        modalBody.html(details);

        movieModal.removeClass("hidden");

    }


    // DETAILS BUTTON CLICK
    movieContainer.on("click", ".details-btn", function () {

        const index = $(this).data("index");

        const selectedMovie = displayedMovies[index];

        showMovieDetails(selectedMovie);

    });


    // CLOSE MODAL
    $("#closeModal").on("click", function () {

        movieModal.addClass("hidden");

    });

    movieModal.on("click", function (event) {

        if (event.target === this) {

            movieModal.addClass("hidden");

        }

    });


    // ERROR
    function showError() {

        error.removeClass("hidden");

    }


    // RETRY
    $("#retryBtn").on("click", function () {

        getMovies(currentPage);

    });


    // ESCAPE HTML
    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, function (char) {

            const entities = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            };

            return entities[char];

        });

    }


    // SEARCH EVENT
    searchBtn.on("click", function () {

        searchMovies();

    });


    searchInput.on("input", function () {

        searchMovies();

    });


    // FILTER EVENT
    ratingFilter.on("change", function () {

        searchMovies();

    });


    // SORT EVENT
    sortSelect.on("change", function () {

        searchMovies();

    });


    // INITIAL REQUEST
    getMovies();

});
