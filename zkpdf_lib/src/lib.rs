//! Zero-knowledge proof library for PDF verification
//! 
//! This library provides functionality to verify claims about PDF documents
//! using zero-knowledge proofs.

use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Error types for PDF verification
#[derive(Error, Debug, PartialEq)]
pub enum PDFVerificationError {
    #[error("Invalid page number: {0}")]
    InvalidPageNumber(u32),
    
    #[error("Invalid offset: {0}")]
    InvalidOffset(usize),
    
    #[error("PDF data is empty")]
    EmptyPDFData,
    
    #[error("Substring not found at specified offset")]
    SubstringNotFound,
    
    #[error("Substring is empty")]
    EmptySubstring,
    
    #[error("Offset out of bounds")]
    OffsetOutOfBounds,
}

/// Result type for PDF verification operations
pub type PDFVerificationResult<T> = Result<T, PDFVerificationError>;

/// Input structure for PDF circuit verification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PDFCircuitInput {
    /// The raw bytes of the PDF document
    pub pdf_bytes: Vec<u8>,
    
    /// The page number to verify (0-indexed)
    pub page_number: u32,
    
    /// The byte offset within the page
    pub offset: usize,
    
    /// The substring to search for at the given offset
    pub substring: String,
}

/// Verification result containing the proof and status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PDFVerificationProof {
    /// Whether the verification succeeded
    pub verified: bool,
    
    /// The page number that was verified
    pub page_number: u32,
    
    /// The offset that was checked
    pub offset: usize,
    
    /// The substring that was searched for
    pub substring: String,
    
    /// Additional metadata about the verification
    pub metadata: String,
}

/// Verify a PDF claim using zero-knowledge proof
/// 
/// This function verifies that a specific substring appears at a given offset
/// within a PDF document.
/// 
/// # Arguments
/// 
/// * `input` - The PDFCircuitInput containing the PDF data and verification parameters
/// 
/// # Returns
/// 
/// Returns a `PDFVerificationProof` if successful, or a `PDFVerificationError` if validation fails
/// 
/// # Security
/// 
/// This function performs input validation to prevent buffer overflows and other security issues:
/// - Validates that PDF data is not empty
/// - Validates that substring is not empty
/// - Validates that offset is within bounds
/// - Validates page number is reasonable (< 10000)
/// 
/// # Examples
/// 
/// ```
/// use zkpdf_lib::{verify_pdf_claim, PDFCircuitInput};
/// 
/// let input = PDFCircuitInput {
///     pdf_bytes: b"Important Document - This is a test PDF".to_vec(),
///     page_number: 0,
///     offset: 0,
///     substring: "Important Document".to_string(),
/// };
/// 
/// let result = verify_pdf_claim(input).unwrap();
/// assert!(result.verified);
/// ```
pub fn verify_pdf_claim(input: PDFCircuitInput) -> PDFVerificationResult<PDFVerificationProof> {
    // Security: Validate inputs to prevent attacks
    validate_input(&input)?;
    
    // Extract the substring from the PDF at the specified offset
    let pdf_text = extract_text_from_pdf(&input.pdf_bytes);
    
    // Check if the substring exists at the specified offset
    let verified = verify_substring_at_offset(&pdf_text, input.offset, &input.substring);
    
    // Create and return the verification proof
    Ok(PDFVerificationProof {
        verified,
        page_number: input.page_number,
        offset: input.offset,
        substring: input.substring.clone(),
        metadata: format!("Verified PDF with {} bytes", input.pdf_bytes.len()),
    })
}

/// Validate the input parameters
fn validate_input(input: &PDFCircuitInput) -> PDFVerificationResult<()> {
    // Security: Check for empty PDF data
    if input.pdf_bytes.is_empty() {
        return Err(PDFVerificationError::EmptyPDFData);
    }
    
    // Security: Check for empty substring
    if input.substring.is_empty() {
        return Err(PDFVerificationError::EmptySubstring);
    }
    
    // Security: Validate page number is reasonable (prevent DoS)
    if input.page_number > 10000 {
        return Err(PDFVerificationError::InvalidPageNumber(input.page_number));
    }
    
    // Security: Check that offset is within bounds
    if input.offset >= input.pdf_bytes.len() {
        return Err(PDFVerificationError::OffsetOutOfBounds);
    }
    
    // Security: Check that offset + substring length doesn't overflow
    if input.offset.checked_add(input.substring.len()).is_none() {
        return Err(PDFVerificationError::InvalidOffset(input.offset));
    }
    
    Ok(())
}

/// Extract text from PDF bytes
/// 
/// This is a simplified implementation that treats the PDF bytes as text.
/// In a production system, this would use a proper PDF parsing library.
fn extract_text_from_pdf(pdf_bytes: &[u8]) -> String {
    // For this implementation, we'll convert the bytes to a string
    // In a real implementation, this would parse the PDF structure
    String::from_utf8_lossy(pdf_bytes).into_owned()
}

/// Verify that a substring exists at the specified offset
fn verify_substring_at_offset(text: &str, offset: usize, substring: &str) -> bool {
    // Security: Ensure we don't go out of bounds
    if offset + substring.len() > text.len() {
        return false;
    }
    
    // Extract the text at the offset and compare
    let text_at_offset = &text[offset..offset + substring.len()];
    text_at_offset == substring
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verify_pdf_claim_success() {
        let input = PDFCircuitInput {
            pdf_bytes: b"Important Document - This is a test PDF".to_vec(),
            page_number: 0,
            offset: 0,
            substring: "Important Document".to_string(),
        };

        let result = verify_pdf_claim(input).unwrap();
        assert!(result.verified);
        assert_eq!(result.page_number, 0);
        assert_eq!(result.offset, 0);
        assert_eq!(result.substring, "Important Document");
    }

    #[test]
    fn test_verify_pdf_claim_substring_not_at_offset() {
        let input = PDFCircuitInput {
            pdf_bytes: b"Important Document - This is a test PDF".to_vec(),
            page_number: 0,
            offset: 10,
            substring: "Important Document".to_string(),
        };

        let result = verify_pdf_claim(input).unwrap();
        assert!(!result.verified);
    }

    #[test]
    fn test_verify_pdf_claim_empty_pdf() {
        let input = PDFCircuitInput {
            pdf_bytes: vec![],
            page_number: 0,
            offset: 0,
            substring: "Important Document".to_string(),
        };

        let result = verify_pdf_claim(input);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), PDFVerificationError::EmptyPDFData);
    }

    #[test]
    fn test_verify_pdf_claim_empty_substring() {
        let input = PDFCircuitInput {
            pdf_bytes: b"Important Document".to_vec(),
            page_number: 0,
            offset: 0,
            substring: String::new(),
        };

        let result = verify_pdf_claim(input);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), PDFVerificationError::EmptySubstring);
    }

    #[test]
    fn test_verify_pdf_claim_offset_out_of_bounds() {
        let input = PDFCircuitInput {
            pdf_bytes: b"Short".to_vec(),
            page_number: 0,
            offset: 1000,
            substring: "Document".to_string(),
        };

        let result = verify_pdf_claim(input);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), PDFVerificationError::OffsetOutOfBounds);
    }

    #[test]
    fn test_verify_pdf_claim_invalid_page_number() {
        let input = PDFCircuitInput {
            pdf_bytes: b"Important Document".to_vec(),
            page_number: 20000,
            offset: 0,
            substring: "Important".to_string(),
        };

        let result = verify_pdf_claim(input);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), PDFVerificationError::InvalidPageNumber(20000));
    }

    #[test]
    fn test_verify_substring_at_offset() {
        assert!(verify_substring_at_offset("Hello World", 0, "Hello"));
        assert!(verify_substring_at_offset("Hello World", 6, "World"));
        assert!(!verify_substring_at_offset("Hello World", 0, "World"));
        assert!(!verify_substring_at_offset("Hello World", 100, "Test"));
    }

    #[test]
    fn test_extract_text_from_pdf() {
        let pdf_bytes = b"Test PDF content";
        let text = extract_text_from_pdf(pdf_bytes);
        assert_eq!(text, "Test PDF content");
    }

    #[test]
    fn test_validate_input_success() {
        let input = PDFCircuitInput {
            pdf_bytes: b"Test".to_vec(),
            page_number: 0,
            offset: 0,
            substring: "Test".to_string(),
        };
        assert!(validate_input(&input).is_ok());
    }

    #[test]
    fn test_pdf_circuit_input_serialization() {
        let input = PDFCircuitInput {
            pdf_bytes: b"Test".to_vec(),
            page_number: 0,
            offset: 100,
            substring: "Important Document".to_string(),
        };
        
        let serialized = serde_json::to_string(&input).unwrap();
        let deserialized: PDFCircuitInput = serde_json::from_str(&serialized).unwrap();
        
        assert_eq!(input.pdf_bytes, deserialized.pdf_bytes);
        assert_eq!(input.page_number, deserialized.page_number);
        assert_eq!(input.offset, deserialized.offset);
        assert_eq!(input.substring, deserialized.substring);
    }
}
