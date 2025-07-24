import axios from "axios"

const API_BASE = "/api"

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    async getProfiles(withPin = false) {
        const response = await this.client.get("/profiles", {
            params: { with_pin: withPin },
        })
        return response.data.profiles
    }

    async getOptions() {
        const response = await this.client.get("/nasiopciok")
        return response.data.options
    }

    async updateProfile(profileId, profileData, updateType='') {
        try {
            const response = await this.client.put(`/profiles/${profileId}`, {
                profile: profileData,
                updateType: updateType,
            })
            return response.data
        } catch (error) {
            console.error("apiService.updateProfile error:", error)
            throw error
        }
    }

    async saveAllProfiles(profiles) {
        const response = await this.client.put("/profiles", { profiles })
        return response.data
    }

    async checkProfilePin(profileId, pin) {
        // Ensure both profileId and pin are sent as strings for consistent comparison
        const response = await this.client.post("/auth/check-pin", {
            profile_id: Number.parseInt(profileId), // Send as integer
            pin: String(pin), // Ensure pin is sent as string
        })
        return response.data.valid
    }

    async checkAdminPin(pin) {
        const response = await this.client.post("/auth/check-admin-pin", {
            pin: String(pin), // Ensure pin is sent as string
        })
        return response.data.valid
    }

    async checkIP() {
        const response = await this.client.get("/auth/check-ip")
        return response.data.known
    }

    async saveIP() {
        const response = await this.client.post("/auth/save-ip")
        return response.data
    }

    async sendAcceptanceEmails(ids, message = "") {
        const response = await this.client.post("/email/accept", { ids, message })
        return response.data
    }

    async sendDeclineEmails(ids, message = "") {
        const response = await this.client.post("/email/decline", { ids, message })
        return response.data
    }
    async uploadFile(file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
            `${API_BASE}/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    }
}

export const apiService = new ApiService()
