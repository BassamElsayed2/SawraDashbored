import QRCode from "qrcode";
import { Branch } from "../types/feedback";

// QR Code generation configuration
export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  type?: "image/png" | "image/svg+xml";
}

// QR Code metadata interface
export interface QRCodeMetadata {
  branch_id: string;
  branch_name: string;
  survey_url: string;
  generated_at: string;
  version: string;
  qr_options: QRCodeOptions;
}

// Default QR code options
export const defaultQROptions: QRCodeOptions = {
  width: 300,
  margin: 2,
  color: {
    dark: "#000000",
    light: "#FFFFFF",
  },
  errorCorrectionLevel: "M",
  type: "image/png",
};

// Utility function to get base URL
export const getBaseUrl = (): string => {
  // Try to get the base URL from environment variable first
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // If not available, try to get it from window.location (client-side)
  if (!baseUrl && typeof window !== "undefined") {
    baseUrl = window.location.origin;
  }

  // Fallback to localhost for development
  if (!baseUrl) {
    baseUrl = "http://localhost:3000";
  }

  return baseUrl;
};

// Utility function to validate and clean URL
export const validateAndCleanUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch {
    return "http://localhost:3000";
  }
};

// QR Code generation utility class
export class QRCodeGenerator {
  private static instance: QRCodeGenerator;
  private options: QRCodeOptions;

  private constructor(options: QRCodeOptions = defaultQROptions) {
    this.options = { ...defaultQROptions, ...options };
  }

  public static getInstance(options?: QRCodeOptions): QRCodeGenerator {
    if (!QRCodeGenerator.instance) {
      QRCodeGenerator.instance = new QRCodeGenerator(options);
    }
    return QRCodeGenerator.instance;
  }

  /**
   * Generate QR code data URL for a branch
   */
  public async generateQRCodeDataURL(
    surveyUrl: string,
    options?: Partial<QRCodeOptions>
  ): Promise<string> {
    try {
      const mergedOptions = { ...this.options, ...options };

      const qrCodeDataURL = await QRCode.toDataURL(surveyUrl, {
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
      });

      return qrCodeDataURL;
    } catch {
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Generate QR code as SVG string
   */
  public async generateQRCodeSVG(
    surveyUrl: string,
    options?: Partial<QRCodeOptions>
  ): Promise<string> {
    try {
      const mergedOptions = {
        ...this.options,
        ...options,
        type: "image/svg+xml",
      };

      const qrCodeSVG = await QRCode.toString(surveyUrl, {
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
        type: "svg",
      });

      return qrCodeSVG;
    } catch {
      throw new Error("Failed to generate QR code SVG");
    }
  }

  /**
   * Generate QR code as Buffer (for file storage)
   */
  public async generateQRCodeBuffer(
    surveyUrl: string,
    options?: Partial<QRCodeOptions>
  ): Promise<Buffer> {
    try {
      const mergedOptions = { ...this.options, ...options };

      const qrCodeBuffer = await QRCode.toBuffer(surveyUrl, {
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
      });

      return qrCodeBuffer;
    } catch {
      throw new Error("Failed to generate QR code buffer");
    }
  }

  /**
   * Generate survey URL for a specific branch
   */
  public generateSurveyURL(branchId: string): string {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/feedback-survey/${branchId}`;
  }

  /**
   * Generate QR code metadata for a branch
   */
  public generateQRCodeMetadata(
    branch: Branch,
    surveyUrl: string,
    options: QRCodeOptions
  ): QRCodeMetadata {
    return {
      branch_id: branch.id || "",
      branch_name: branch.name_en || branch.name_ar,
      survey_url: surveyUrl,
      generated_at: new Date().toISOString(),
      version: "1.0",
      qr_options: options,
    };
  }

  /**
   * Validate QR code options
   */
  public validateQROptions(options: QRCodeOptions): boolean {
    if (options.width && (options.width < 100 || options.width > 1000)) {
      throw new Error("QR code width must be between 100 and 1000 pixels");
    }

    if (options.margin && (options.margin < 0 || options.margin > 10)) {
      throw new Error("QR code margin must be between 0 and 10");
    }

    if (options.color) {
      const colorRegex = /^#[0-9A-F]{6}$/i;
      if (
        !colorRegex.test(options.color.dark) ||
        !colorRegex.test(options.color.light)
      ) {
        throw new Error("QR code colors must be valid hex colors");
      }
    }

    const validErrorLevels = ["L", "M", "Q", "H"];
    if (
      options.errorCorrectionLevel &&
      !validErrorLevels.includes(options.errorCorrectionLevel)
    ) {
      throw new Error("Invalid error correction level");
    }

    return true;
  }

  /**
   * Generate QR code with branding (placeholder for future enhancement)
   */
  public async generateBrandedQRCode(
    surveyUrl: string,
    branch: Branch,
    options?: Partial<QRCodeOptions>
  ): Promise<string> {
    // For now, return a basic QR code
    // Future enhancement: Add company logo overlay
    return this.generateQRCodeDataURL(surveyUrl, options);
  }

  /**
   * Test QR code generation
   */
  public async testQRCodeGeneration(testUrl: string): Promise<boolean> {
    try {
      const testQR = await this.generateQRCodeDataURL(testUrl);
      return testQR.startsWith("data:image/");
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const qrCodeGenerator = QRCodeGenerator.getInstance();

// Utility functions for common QR code operations
export const qrCodeUtils = {
  /**
   * Generate QR code for a branch
   */
  async generateBranchQRCode(
    branch: Branch,
    options?: Partial<QRCodeOptions>
  ): Promise<{
    dataURL: string;
    metadata: QRCodeMetadata;
  }> {
    const surveyUrl = qrCodeGenerator.generateSurveyURL(branch.id || "");
    const dataURL = await qrCodeGenerator.generateQRCodeDataURL(
      surveyUrl,
      options
    );
    const metadata = qrCodeGenerator.generateQRCodeMetadata(branch, surveyUrl, {
      ...defaultQROptions,
      ...options,
    });

    return { dataURL, metadata };
  },

  /**
   * Generate QR code SVG for a branch
   */
  async generateBranchQRCodeSVG(
    branch: Branch,
    options?: Partial<QRCodeOptions>
  ): Promise<{
    svg: string;
    metadata: QRCodeMetadata;
  }> {
    const surveyUrl = qrCodeGenerator.generateSurveyURL(branch.id || "");
    const svg = await qrCodeGenerator.generateQRCodeSVG(surveyUrl, options);
    const metadata = qrCodeGenerator.generateQRCodeMetadata(branch, surveyUrl, {
      ...defaultQROptions,
      ...options,
    });

    return { svg, metadata };
  },

  /**
   * Generate QR code buffer for storage
   */
  async generateBranchQRCodeBuffer(
    branch: Branch,
    options?: Partial<QRCodeOptions>
  ): Promise<{
    buffer: Buffer;
    metadata: QRCodeMetadata;
  }> {
    const surveyUrl = qrCodeGenerator.generateSurveyURL(branch.id || "");
    const buffer = await qrCodeGenerator.generateQRCodeBuffer(
      surveyUrl,
      options
    );
    const metadata = qrCodeGenerator.generateQRCodeMetadata(branch, surveyUrl, {
      ...defaultQROptions,
      ...options,
    });

    return { buffer, metadata };
  },
};
