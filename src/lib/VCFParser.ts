/**
 * PharmaGuard - VCF Parser
 * Parses VCF (Variant Call Format) files to extract pharmacogenetic variants
 * Supports VCF v4.2 format with focus on INFO fields: GENE, STAR, RS
 */

import { VariantInfo } from './VariantPhenotypeMap';
import { SUPPORTED_GENES, isSupportedGene } from './DrugGeneMap';

export interface VCFVariant {
  chromosome: string;
  position: number;
  id: string;
  ref: string;
  alt: string;
  qual: string;
  filter: string;
  info: Record<string, string>;
  format?: string;
  samples?: string[];
  // Parsed pharmacogenetic fields
  gene?: string;
  starAllele?: string;
  rsID?: string;
}

export interface VCFParseResult {
  success: boolean;
  variants: VCFVariant[];
  totalVariants: number;
  pharmacogeneticVariants: number;
  errors: string[];
  metadata: {
    format: string;
    contig?: string[];
    reference?: string;
  };
}

export class VCFParser {
  private static readonly VCF_HEADER_PATTERN = /^##/;
  private static readonly VCF_COLUMN_HEADER = '#CHROM';
  private static readonly REQUIRED_COLUMNS = ['#CHROM', 'POS', 'ID', 'REF', 'ALT', 'QUAL', 'FILTER', 'INFO'];

  /**
   * Parse VCF content from string
   */
  static parseVCF(content: string): VCFParseResult {
    const result: VCFParseResult = {
      success: false,
      variants: [],
      totalVariants: 0,
      pharmacogeneticVariants: 0,
      errors: [],
      metadata: { format: 'unknown' }
    };

    try {
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        result.errors.push('Empty VCF file');
        return result;
      }

      // Parse header and metadata
      const { headerEndIndex, metadata } = this.parseHeader(lines);
      result.metadata = metadata;

      if (headerEndIndex === -1) {
        result.errors.push('Invalid VCF format: missing column header');
        return result;
      }

      // Parse column headers
      const columnHeaders = lines[headerEndIndex].split('\t');
      const columnMapping = this.createColumnMapping(columnHeaders);

      if (!this.validateColumns(columnHeaders)) {
        result.errors.push('Invalid VCF format: missing required columns');
        return result;
      }

      // Parse variant records
      const variantLines = lines.slice(headerEndIndex + 1);
      const variants: VCFVariant[] = [];
      
      for (let i = 0; i < variantLines.length; i++) {
        const line = variantLines[i];
        if (line.trim() === '' || line.startsWith('#')) continue;

        try {
          const variant = this.parseVariantLine(line, columnMapping);
          if (variant) {
            variants.push(variant);
            result.totalVariants++;
            
            // Check if it's a pharmacogenetic variant
            if (this.isPharmacogeneticVariant(variant)) {
              result.pharmacogeneticVariants++;
            }
          }
        } catch (error) {
          result.errors.push(`Error parsing line ${headerEndIndex + i + 2}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      result.variants = variants;
      result.success = result.errors.length === 0 || result.variants.length > 0;

    } catch (error) {
      result.errors.push(`VCF parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Parse VCF header and extract metadata
   */
  private static parseHeader(lines: string[]): { headerEndIndex: number; metadata: VCFParseResult['metadata'] } {
    const metadata: VCFParseResult['metadata'] = { format: 'unknown', contig: [], reference: undefined };
    let headerEndIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('##fileformat=')) {
        metadata.format = line.split('=')[1];
      } else if (line.startsWith('##reference=')) {
        metadata.reference = line.split('=')[1];
      } else if (line.startsWith('##contig=')) {
        const contigMatch = line.match(/ID=([^,>]+)/);
        if (contigMatch && contigMatch[1]) {
          metadata.contig?.push(contigMatch[1]);
        }
      } else if (line.startsWith(this.VCF_COLUMN_HEADER)) {
        headerEndIndex = i;
        break;
      }
    }

    return { headerEndIndex, metadata };
  }

  /**
   * Create mapping of column names to indices
   */
  private static createColumnMapping(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {};
    headers.forEach((header, index) => {
      mapping[header] = index;
    });
    return mapping;
  }

  /**
   * Validate that required columns are present
   */
  private static validateColumns(headers: string[]): boolean {
    return this.REQUIRED_COLUMNS.every(required => headers.includes(required));
  }

  /**
   * Parse a single variant line
   */
  private static parseVariantLine(line: string, columnMapping: Record<string, number>): VCFVariant | null {
    const fields = line.split('\t');
    
    if (fields.length < 8) {
      throw new Error('Insufficient columns in variant line');
    }

    const variant: VCFVariant = {
      chromosome: fields[columnMapping['#CHROM']],
      position: parseInt(fields[columnMapping['POS']]),
      id: fields[columnMapping['ID']],
      ref: fields[columnMapping['REF']],
      alt: fields[columnMapping['ALT']],
      qual: fields[columnMapping['QUAL']],
      filter: fields[columnMapping['FILTER']],
      info: this.parseInfoField(fields[columnMapping['INFO']])
    };

    // Extract pharmacogenetic fields from INFO
    if (variant.info.GENE) {
      variant.gene = variant.info.GENE;
    }
    if (variant.info.STAR) {
      variant.starAllele = variant.info.STAR;
    }
    if (variant.info.RS) {
      variant.rsID = variant.info.RS;
    }

    // Also check ID field for rsID
    if (variant.id.startsWith('rs') && !variant.rsID) {
      variant.rsID = variant.id;
    }

    return variant;
  }

  /**
   * Parse INFO field into key-value pairs
   */
  private static parseInfoField(infoString: string): Record<string, string> {
    const info: Record<string, string> = {};
    
    if (!infoString || infoString === '.') {
      return info;
    }

    const pairs = infoString.split(';');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        info[key] = value || 'true';
      }
    }

    return info;
  }

  /**
   * Check if variant is relevant for pharmacogenetics
   */
  private static isPharmacogeneticVariant(variant: VCFVariant): boolean {
    // Check if gene is in our supported list
    if (variant.gene && isSupportedGene(variant.gene)) {
      return true;
    }

    // Check for known pharmacogenetic rsIDs
    if (variant.rsID && this.isPharmacogeneticRsID(variant.rsID)) {
      return true;
    }

    return false;
  }

  /**
   * Check if rsID is known to be pharmacogenetically relevant
   */
  private static isPharmacogeneticRsID(rsID: string): boolean {
    const pharmacogeneticRsIDs = [
      // CYP2D6
      'rs3892097', 'rs35742686', 'rs5030655', 'rs16947',
      // CYP2C19  
      'rs4244285', 'rs4986893', 'rs12248560',
      // CYP2C9
      'rs1799853', 'rs1057910',
      // TPMT
      'rs1142345', 'rs1800460', 'rs1800462',
      // SLCO1B1
      'rs4149056',
      // DPYD
      'rs3918290', 'rs55886062'
    ];

    return pharmacogeneticRsIDs.includes(rsID);
  }

  /**
   * Filter variants for pharmacogenetic analysis
   */
  static filterPharmacogeneticVariants(variants: VCFVariant[]): VCFVariant[] {
    return variants.filter(variant => this.isPharmacogeneticVariant(variant));
  }

  /**
   * Convert VCF variant to VariantInfo format
   */
  static toVariantInfo(variant: VCFVariant): VariantInfo {
    return {
      rsID: variant.rsID,
      chromosome: variant.chromosome,
      position: variant.position,
      ref: variant.ref,
      alt: variant.alt
    };
  }

  /**
   * Validate VCF file size and format
   */
  static validateVCF(content: string, maxSizeMB: number = 5): { valid: boolean; error?: string } {
    // Check file size (approximate, since content is already string)
    const sizeInMB = new Blob([content]).size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
    }

    // Basic format validation
    if (!content.includes('##fileformat=VCF')) {
      return { valid: false, error: 'Invalid VCF format: missing fileformat header' };
    }

    if (!content.includes('#CHROM')) {
      return { valid: false, error: 'Invalid VCF format: missing column headers' };
    }

    return { valid: true };
  }
}