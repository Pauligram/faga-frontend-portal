// frontend/js/faga-api.js

// Live FAGA Laravel backend on Railway
const FAGA_API_BASE_URL = "https://faga-backend-engine-production.up.railway.app";

/**
 * Global HTTP Fetch Wrapper for authenticated requests
 */
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
            ...(options.body ? { "Content-Type": "application/json" } : {}),
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
            console.error("FAGA API network error:", networkError);

            // Preserve API errors thrown above
            if (networkError && networkError.status !== undefined) {
                throw networkError;
            }

            throw {
                status: 0,
                data: {
                    message: "Unable to reach the FAGA operational server."
                }
            };
        }
    },

    async register(name, email, password) {
        return this.request("/api/register", {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                password
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

    async getProfile() {
        return this.request("/api/profile", {
            method: "GET"
        });
    },

    async getDeliveries() {
        return this.request("/api/deliveries", {
            method: "GET"
        });
    },

    async createDelivery(pickupAddress, dropoffAddress) {
        return this.request("/api/deliveries", {
            method: "POST",
            body: JSON.stringify({
                pickupAddress,
                dropoffAddress
            })
        });
    },

    async updateTelemetry(ride_id, latitude, longitude) {
        return this.request("/api/telemetry/update", {
            method: "POST",
            body: JSON.stringify({
                ride_id,
                latitude,
                longitude
            })
        });
    },

    async getJobs() {
        return this.request("/api/jobs", {
            method: "GET"
        });
    },

    async submitSellerApplication(storeName, businessAddress) {
        return this.request("/api/seller-applications", {
            method: "POST",
            body: JSON.stringify({
                storeName,
                businessAddress
            })
        });
    },

    async getAdminSellers() {
        return this.request("/api/admin/seller-applications", {
            method: "GET"
        });
    },

    async approveSeller(id) {
        return this.request(
            `/api/admin/seller-applications/${id}/approve`,
            {
                method: "POST"
            }
        );
    }
};