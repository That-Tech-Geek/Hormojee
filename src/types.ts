/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductData {
  name: string;
  industry: string;
  dealStage: string;
  price: number;
  painPoints: string[];
  customAttributes?: Record<string, string>;
}

export interface CentroidRecord {
  id: number;
  label: string;
  features: Partial<ProductData> & Record<string, any>;
  pitchText: string;
  category: string;
}

export interface PitchRecord {
  id: string;
  name: string;
  product: ProductData;
  confidence: number;
  text: string;
  timestamp: string;
  centroidId?: number;
}

export interface FeatureMappingJson {
  [key: string]: number[]; // array of ±1 weights
}

export interface OracleMetrics {
  totalPitches: number;
  pitchTrend: number;
  avgConversion: number;
  conversionTrend: number;
  topIndustry: string;
  secondaryIndustries: string[];
}
