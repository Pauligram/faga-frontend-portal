// frontend/js/faga-api.js

// Live FAGA Node/Express backend on Railway
const FAGA_API_BASE_URL =
    "https://faga-backend-engine-production.up.railway.app";

const FagaAPI = {
    getToken() {
        return localStorage.getItem("faga_auth_token");
    },

    setToken(token) {
        localStorage.setItem("faga_auth_token", token);
    },

    removeToken() {
        localStorage.removeItem("faga_auth_token");
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    async request(endpoint, options = {}) {
        const token = this.getToken();

        const headers = {
            "Accept": "application/json",
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...(options.headers || {})
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(
                `${FAGA_API_BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch (e) {
                data = {};
            }

            if (!response.ok) {
                if (response.status === 401) {
                    this.removeToken();
                }

                throw {
                    status: response.status,
                    data
                };
            }

            return data;

        } catch (networkError) {
            console.error(
                "FAGA API network error:",
                networkError
            );

            if (
                networkError &&
                networkError.status !== undefined
            ) {
                throw networkError;
            }

            throw {
                status: 0,
                data: {
                    message:
                        "Unable to reach the FAGA operational server."
                }
            };
        }
    },


    // =========================================================
    // AUTHENTICATION
    // =========================================================

    async register(
        name,
        email,
        password,
        phone = ""
    ) {
        return this.request("/api/register", {
            method: "POST",

            body: JSON.stringify({
                name,
                email,
                password,
                phone
            })
        });
    },


    async login(email, password) {
        const data = await this.request("/api/login", {
            method: "POST",

            body: JSON.stringify({
                email,
                password
            })
        });

        if (data.token) {
            this.setToken(data.token);
        }

        return data;
    },


    logout() {
        this.removeToken();
    },


    // =========================================================
    // USER PROFILE
    // =========================================================

    async getProfile() {
        return this.request("/api/profile", {
            method: "GET"
        });
    },


    // =========================================================
    // DELIVERIES
    // =========================================================

    async getDeliveries() {
        return this.request("/api/deliveries", {
            method: "GET"
        });
    },


    async getDelivery(deliveryId) {
        if (!deliveryId) {
            throw new Error("Delivery ID is required.");
        }

        return this.request(
            `/api/deliveries/${encodeURIComponent(deliveryId)}`,
            {
                method: "GET"
            }
        );
    },


    async createDelivery(
        pickupAddress,
        dropoffAddress
    ) {
        return this.request("/api/deliveries", {
            method: "POST",

            body: JSON.stringify({
                pickupAddress,
                dropoffAddress
            })
        });
    },


    async getDeliveryTracking(deliveryId) {
        if (!deliveryId) {
            throw new Error("Delivery ID is required.");
        }

        return this.request(
            `/api/deliveries/${encodeURIComponent(deliveryId)}/tracking`,
            {
                method: "GET"
            }
        );
    },


    async cancelDelivery(deliveryId) {
        if (!deliveryId) {
            throw new Error("Delivery ID is required.");
        }

        return this.request(
            `/api/deliveries/${encodeURIComponent(deliveryId)}/cancel`,
            {
                method: "POST"
            }
        );
    },


    // =========================================================
    // RIDER / DELIVERY TRACKING
    // =========================================================

    async updateDeliveryLocation(
        deliveryId,
        latitude,
        longitude
    ) {
        if (!deliveryId) {
            throw new Error("Delivery ID is required.");
        }

        return this.request(
            `/api/rider/deliveries/${encodeURIComponent(deliveryId)}/location`,
            {
                method: "POST",

                body: JSON.stringify({
                    latitude,
                    longitude
                })
            }
        );
    },


    async pickupDelivery(deliveryId) {
        if (!deliveryId) {
            throw new Error("Delivery ID is required.");
        }

        return this.request(
            `/api/rider/deliveries/${encodeURIComponent(deliveryId)}/pickup`,
            {
                method: "POST"
            }
        );
    },


    async startDelivery(deliveryId) {
        if (!deliveryId) {
            throw new Error("Delivery ID is required.");
        }

        return this.request(
            `/api/rider/deliveries/${encodeURIComponent(deliveryId)}/start`,
            {
                method: "POST"
            }
        );
    },


    async completeDelivery(deliveryId) {
        if (!deliveryId) {
            throw new Error("Delivery ID is required.");
        }

        return this.request(
            `/api/rider/deliveries/${encodeURIComponent(deliveryId)}/complete`,
            {
                method: "POST"
            }
        );
    },


    async getRiderDeliveryOffers() {
        return this.request(
            "/api/rider/delivery-offers",
            {
                method: "GET"
            }
        );
    },


    async acceptDelivery(deliveryId) {
        if (!deliveryId) {
            throw new Error("Delivery ID is required.");
        }

        return this.request(
            `/api/rider/deliveries/${encodeURIComponent(deliveryId)}/accept`,
            {
                method: "POST"
            }
        );
    },


    async declineDelivery(deliveryId) {
        if (!deliveryId) {
            throw new Error("Delivery ID is required.");
        }

        return this.request(
            `/api/rider/deliveries/${encodeURIComponent(deliveryId)}/decline`,
            {
                method: "POST"
            }
        );
    },


    // =========================================================
    // LEGACY TELEMETRY
    // =========================================================

    async updateTelemetry(
        ride_id,
        latitude,
        longitude
    ) {
        return this.request(
            "/api/telemetry/update",
            {
                method: "POST",

                body: JSON.stringify({
                    ride_id,
                    latitude,
                    longitude
                })
            }
        );
    },


    // =========================================================
    // JOBS
    // =========================================================

    async getJobs() {
        return this.request("/api/jobs", {
            method: "GET"
        });
    },


    // =========================================================
    // SELLER
    // =========================================================

    async submitSellerApplication(
        storeName,
        businessAddress
    ) {
        return this.request(
            "/api/seller-applications",
            {
                method: "POST",

                body: JSON.stringify({
                    storeName,
                    businessAddress
                })
            }
        );
    },


    async getAdminSellers() {
        return this.request(
            "/api/admin/seller-applications",
            {
                method: "GET"
            }
        );
    },


    async approveSeller(id) {
        return this.request(
            `/api/admin/seller-applications/${encodeURIComponent(id)}/approve`,
            {
                method: "POST"
            }
        );
    }
};


// =============================================================
// MAKE AVAILABLE GLOBALLY
// =============================================================

window.FagaAPI = FagaAPI;