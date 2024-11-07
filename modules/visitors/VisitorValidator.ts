import crypto from "crypto";
import { VisitorDatastore } from "./VisitorDatastore";
import { ServerFingerprint, ValidationResult } from "@/types";
import { ARTWORK_GENERATION_DAILY_LIMIT } from "@/constants";

export class VisitorValidator {
    private clientFingerprint: string;
    private serverFingerprint: ServerFingerprint;

    private datastore: VisitorDatastore;

    constructor(clientFingerprint: string, serverFingerprint: ServerFingerprint) {
        this.clientFingerprint = clientFingerprint;
        this.serverFingerprint = serverFingerprint;

        this.datastore = new VisitorDatastore();
    }

    private hashServerFingerprint(fingerprint: ServerFingerprint): string {
        return crypto.createHash("sha256").update(JSON.stringify(fingerprint)).digest("hex");
    }

    private generateCompositeId(serverFingerprintHash: string, clientFingerprint: string): string {
        return crypto
            .createHash("sha256")
            .update(serverFingerprintHash + clientFingerprint)
            .digest("hex");
    }

    public async validateRequest(): Promise<ValidationResult> {
        try {
            // Generate server fingerprint
            const serverFingerprintHash = this.hashServerFingerprint(this.serverFingerprint);
            const compositeId = this.generateCompositeId(
                serverFingerprintHash,
                this.clientFingerprint
            );

            // Get or create visitor record
            let visitor = await this.datastore.getVisitor(compositeId);

            if (!visitor) {
                visitor = {
                    id: compositeId,
                    client_fingerprint: this.clientFingerprint,
                    server_fingerprint: serverFingerprintHash,
                    ip_address: this.serverFingerprint.ipAddress,
                    generation_count: 0,
                    last_generation_time: new Date().toISOString(),
                    last_reset_date: new Date().toISOString().split("T")[0],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                await this.datastore.upsertVisitor(visitor);
            }

            // Validate existing visitor
            if (visitor.server_fingerprint !== serverFingerprintHash) {
                return {
                    isAllowed: false,
                    reason: "Invalid fingerprint combination",
                };
            }

            // Check if generation is allowed
            const { allowed, reason } = await this.datastore.canGenerate(visitor);

            return {
                isAllowed: allowed,
                reason,
                remainingGenerations: allowed
                    ? ARTWORK_GENERATION_DAILY_LIMIT - visitor.generation_count
                    : 0,
            };
        } catch (error: any) {
            console.error("Error in visitor validation:", error);
            return {
                isAllowed: false,
                reason: "Validation error occurred: " + error.message,
            };
        }
    }

    public async recordGeneration(): Promise<void> {
        const serverFingerprintHash = this.hashServerFingerprint(this.serverFingerprint);
        const compositeId = this.generateCompositeId(serverFingerprintHash, this.clientFingerprint);

        await this.datastore.incrementGenerationCount(compositeId);
    }
}
